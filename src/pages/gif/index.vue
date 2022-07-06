<template>
  <BaseLayout :needLog="true">
    <template v-slot:header>
      <span>Pic GIF</span>
    </template>
    <template v-slot:menu>
      <button class="button A" @click="clearFileCache">清理数据</button>
      <button class="button C">
        <a href="./collage.html">Pic Collage</a>
      </button>
    </template>
    <template v-slot:main>
      <div class="left">
        <Tab v-model:selected="tabSelect">
          <TabPanel key="library" title="图库">
            <Gallery ref="galleryLoader" v-model:value="files" @log="addLog"></Gallery>
          </TabPanel>
          <TabPanel key="setting" title="设置">
            <GIFOption :value="gifForm"></GIFOption>
          </TabPanel>
        </Tab>
        <div class="btn-group center">
          <button class="button large" @click="makePreview">生成预览</button>
          <button class="button large C" @click="makeFile('gif')">下载GIF</button>
          <button class="button large C" @click="makeFile('mp4')">下载MP4</button>
        </div>
      </div>
      <div class="right">
        <video
          :src="previewSrc"
          class="previewImg"
          width=""
          height=""
          controls
          autoplay
        ></video>
      </div>
    </template>
    <template v-slot:footer>
      <Log :logs="logs"></Log>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

import { dateFmt } from "../../utils/utils";
import { PaintsFactory } from "../../utils/PaintsFactory";

import BaseLayout from "../../layouts/BaseLayout.vue";
import Log from "../../components/Log.vue";
import Tab from "../../components/Tab/Box.vue";
import TabPanel from "../../components/Tab/Panel.vue";
import Gallery from "../../components/Gallery/index.vue";
import GIFOption from "../../components/Options/gif-canvas.vue";

const logs = ref([] as { value: string; timestamp: string }[]);
const tabSelect = ref("library");
const previewSrc = ref("");
const galleryLoader = ref();
const gifForm = ref({
  width: 900,
  height: 1600,
  repeat: 0,
  delay: 750,
  background: "#FFFFFF",
  rule: 3,
});
const files = ref([]);

const paintsFactory = new PaintsFactory();

const clearFileCache = () => {
  nextTick(() => {
    files.value = [];
    previewSrc.value = "";
    galleryLoader.value.clearFile();
    addLog("清理成功");
  });
};

const addLog = (mes: string) => {
  logs.value.push({
    value: mes,
    timestamp: dateFmt(),
  });
};

const makePreview = function () {
  paintsFactory
    .setOpt(gifForm.value)
    .toBlob(files.value)
    .then(async () => {
      previewSrc.value = await paintsFactory.toPreView();
    })
    .catch((e) => {
      console.log(e);
    });
};

const makeFile = function (type: "gif" | "mp4") {
  paintsFactory
    .setOpt(gifForm.value)
    .toBlob(files.value)
    .then(() => {
      paintsFactory.toFile(type);
    })
    .catch((e) => {
      console.log(e);
    });
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
.right {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: var(--space-3);
  background-color: var(--color-light-gray);
  .previewImg {
    max-width: 72%;
    max-height: 72%;
    background-color: var(--color-white);
    box-shadow: var(--shadow-dark);
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
}
</style>
