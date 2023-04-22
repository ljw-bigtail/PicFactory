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
        <Tab.Box v-model:selected="tabSelect">
          <Tab.Panel key="library" title="图库">
            <Gallery ref="galleryLoader" @log="addLog" @drop="handleDrop" :multiDrop="true" />
          </Tab.Panel>
          <Tab.Panel key="music" title="音乐库">
            <GIFMusic :value="musicForm" />
          </Tab.Panel>
          <Tab.Panel key="setting" title="设置">
            <GIFOption :value="gifForm" />
          </Tab.Panel>
        </Tab.Box>
        <div class="btn-group center">
          <button class="button large" @click="makePreview">生成预览</button>
          <!-- <button class="button large" @click="openPreview">打开预览</button> -->
        </div>
      </div>
      <div class="right">
        <div class="btn-group right">
          <button class="button A" @click="clearFileCache">清理帧</button>
        </div>
        <FrameEditor ref="frameEditor" />
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
import { ref, nextTick, inject } from "vue";

import { dateFmt } from "@/utils/utils";
import { PaintsFactory } from "@/utils/PaintsFactory";

import BaseLayout from "@/layouts/BaseLayout.vue";
import { Tab } from "@/components/index";

import Log from "@/fragment/Log.vue";
import Gallery from "@/fragment/Gallery/index.vue";
import GIFOption from "@/fragment/Options/gif-canvas.vue";
import GIFMusic from "@/fragment/Options/gif-music.vue";
import FrameEditor from "@/fragment/Frame/Editor.vue";
import PreViewDialog from "@/fragment/PreViewDialog.vue";

const logs = ref([] as { value: string; timestamp: string }[]);
const tabSelect = ref("library");
const previewSrc = ref("");
const galleryLoader = ref();
const previewDialog = ref();
const frameEditor = ref();
const gifForm = ref({
  width: 800,
  height: 1000,
  repeat: 0,
  delay: 750,
  background: "#FFFFFF",
  rule: 3,
  quality: 0.5, // ffmpeg的默认值是23，建议的取值范围是17-28。
});
const musicForm = ref({
  start: 0,
});

const paintsFactory = new PaintsFactory();

const message = inject("_message") as Function;

const clearFileCache = () => {
  nextTick(() => {
    previewSrc.value = "";
    galleryLoader.value.clearSelect();
    frameEditor.value.handleClear();
    message({
      type: "success",
      value: "清理成功...",
    });
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
  if (!frames || frames.length == 0) {
    message({
      type: "warning",
      value: "请从图库中选择。",
    });
    return;
  }
  message({
    value: "正在加载插件，请等待...",
  });
  previewDialog.value.load();
  const file = await paintsFactory
    .setOpt(gifForm.value)
    .setMusic(musicForm.value)
    .setFrame(frames)
    .toPreView()
    .catch((e) => console.log(e));
  if (!file?.src) return;
  const { src, size_mp4, size_gif } = file;
  console.log(`
    size_mp4: ${Math.round(size_mp4 / 1024)}KB
    size_gif: ${Math.round(size_gif / 1024)}KB
  `);
  previewDialog.value.display(src);
};

const makeFile = function (type: "gif" | "mp4") {
  var frames = frameEditor.value.getFrames();
  if (!frames || frames.length == 0) return;
  paintsFactory.toFile(type).catch((e) => console.log(e));
};

type FileOption = { id: string; src: string; file: File; selected: boolean };

const handleDrop = function (data: FileOption[]) {
  frameEditor.value.setDropCache([...data]);
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
    top: calc(100% - 100px + 20px);
  }
  & + .right {
    padding-bottom: var(--space-3);
    background-color: var(--color-light-gray);
    display: flex;
    flex-direction: column;
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
