<template>
  <BaseLayout :needLog="true">
    <template v-slot:header>
      <span>Pic GIF</span>
    </template>
    <template v-slot:menu>
      <button class="button C">
        <a href="./collage.html">Pic Collage</a>
      </button>
    </template>
    <template v-slot:main>
      <div class="left">
        <Tab v-model:selected="tabSelect">
          <TabPanel key="library" title="图库">
            <Gallery
              ref="galleryLoader"
              v-model:value="files"
              @log="addLog"
              :need_decision="true"
              @decision="handleDecision"
            />
          </TabPanel>
          <TabPanel key="music" title="音乐库">
            <GIFMusic :value="musicForm" />
          </TabPanel>
          <TabPanel key="setting" title="设置">
            <GIFOption :value="gifForm" />
          </TabPanel>
        </Tab>
        <div class="btn-group center">
          <button class="button large" @click="makePreview">生成预览</button>
          <button class="button large" @click="openPreview">打开预览</button>
        </div>
      </div>
      <div class="right">
        <div class="btn-group right">
          <button class="button A" @click="clearFileCache">清理帧</button>
        </div>
        <FrameEditor ref="frameEditor" :list="listImgs" />
      </div>
    </template>
    <template v-slot:footer>
      <Log :logs="logs" />
    </template>
  </BaseLayout>
  <PreViewDialog
    ref="previewDialog"
    :ratio="gifForm.width / gifForm.height"
    @footer-click="makeFile"
  />
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

import { dateFmt } from "../../utils/utils";
import { PaintsFactory } from "../../utils/PaintsFactory";

import BaseLayout from "../../layouts/BaseLayout.vue";
import Log from "../../components/Log.vue";
import Tab from "../../components/Tab/Box.vue";
import TabPanel from "../../components/Tab/Panel.vue";

import Gallery from "../../fragment/Gallery/index.vue";
import GIFOption from "../../fragment/Options/gif-canvas.vue";
import GIFMusic from "../../fragment/Options/gif-music.vue";
import FrameEditor from "../../fragment/FrameEditor.vue";
import PreViewDialog from "../../fragment/PreViewDialog.vue";

const logs = ref([] as { value: string; timestamp: string }[]);
const tabSelect = ref("library");
const previewSrc = ref("");
const galleryLoader = ref();
const previewDialog = ref();
const frameEditor = ref();
const gifForm = ref({
  width: 900,
  height: 1600,
  repeat: 0,
  delay: 750,
  background: "#FFFFFF",
  rule: 3,
  quality: 0.5, // ffmpeg的默认值是23，建议的取值范围是17-28。
});
const musicForm = ref({
  start: 0
})
const files = ref([]);

const paintsFactory = new PaintsFactory();

const clearFileCache = () => {
  nextTick(() => {
    // files.value = [];
    listImgs.value = [];
    previewSrc.value = "";
    // galleryLoader.value.clearFile();
    addLog("清理成功");
  });
};

const addLog = (mes: string) => {
  logs.value.push({
    value: mes,
    timestamp: dateFmt(),
  });
};

const openPreview = function () {
  previewDialog.value.open();
};

const makePreview = async function () {
  var frames = frameEditor.value.getFrames();
  if(!frames || frames.length == 0) return
  previewDialog.value.load();
  var videoSrc = await paintsFactory.setOpt(gifForm.value).setMusic(musicForm.value).setFrame(frames).toPreView();
  previewDialog.value.display(videoSrc);
};

const makeFile = function (type: "gif" | "mp4") {
  var frames = frameEditor.value.getFrames();
  if(!frames || frames.length == 0) return
  paintsFactory
    .setOpt(gifForm.value)
    .setMusic(musicForm.value)
    .setFrame(frames)
    .toFile(type)
    .catch((e) => {
      console.log(e);
    });
};

const listImgs = ref([] as FileOption[]);
type FileOption = { id: string; src: string; file: File; selected: boolean };

const handleDecision = function (list: FileOption[]) {
  listImgs.value = list;
};
</script>

<style lang="less" scoped>
.gif-preview {
  max-width: 300px;
  display: block;
  margin: 0 auto var(--space-2);
  transform: translateY(var(--space-1));
  box-shadow: var(--shadow);
  img {
    display: inline-block;
    max-width: 100%;
  }
}
.left {
  position: relative;
  .tab {
    padding-bottom: 100px;
    box-sizing: border-box;
  }
  .btn-group {
    position: absolute;
    top: calc(100% - 100px);
  }
  & + .right {
    padding-bottom: var(--space-3);
    background-color: var(--color-light-gray);
    .previewImg {
      max-width: 72%;
      max-height: 72%;
      background-color: var(--color-white);
      box-shadow: var(--shadow-dark);
    }
    .btn-group {
      padding: 0 var(--space-1);
    }
  }
}
</style>
