<template>
  <BaseLayout :needLog="true">
    <template v-slot:header>
      <span>Pic Collage</span>
    </template>
    <template v-slot:menu>
      <button class="button A" @click="clearFileCache">清理数据</button>
      <button class="button C">
        <a href="./gif.html">Pic GIF</a>
      </button>
    </template>
    <template v-slot:main>
      <div class="left">
        <Tab v-model:selected="tabSelect">
          <TabPanel key="setting" title="设置">
            <CanvasOption v-model:value="canvasForm"></CanvasOption>
          </TabPanel>
          <TabPanel key="library" title="图库">
            <Upload
              ref="fileUploader"
              :drop="false"
              v-model:value="files"
              @log="addLog"
              @drop="handleDrop"
            ></Upload>
          </TabPanel>
          <TabPanel key="letter" title="文字"> Coming Soon </TabPanel>
        </Tab>
        <div class="btn-group center">
          <button class="button large C" @click="makeFile('jpeg')">下载jpeg</button>
          <button class="button large C" @click="makeFile('png')">下载png</button>
        </div>
      </div>
      <div class="right">
        <CanvasEditor ref="canvasEditor" :options="canvasForm"></CanvasEditor>
      </div>
    </template>
    <template v-slot:footer>
      <Log :logs="logs"></Log>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from "vue";

import { dateFmt } from "../../utils/utils";
import { CanvasFactory, DefaultCanvasFactoryOptions } from "../../utils/CanvasFactory";

import BaseLayout from "../../layouts/BaseLayout.vue";
import Log from "../../components/Log.vue";
import Upload from "../../components/Upload.vue";
import Tab from "../../components/Tab/Box.vue";
import TabPanel from "../../components/Tab/Panel.vue";
import CanvasOption from "../../components/OptionForm/canvas.vue";
import CanvasEditor from "../../components/CanvasEditor.vue";

const logs = ref([] as { value: string; timestamp: string }[]);
// const previewSrc = ref("");
const fileUploader = ref();
const canvasEditor = ref();
const tabSelect = ref("setting");
const canvasForm = ref(DefaultCanvasFactoryOptions);
const files = ref();

type CanvasEditorFactory = CanvasFactory | null;

let canvasFactory: CanvasEditorFactory = null;
// onMounted(function () {
//   canvasFactory = new CanvasFactory({
//     id: "canvas-editor",
//   });
// });

type FileOption = { id: string; src: string; file: File };

const handleDrop = function (data: FileOption) {
  const img = new Image();
  img.src = data.src;
  img.onload = function (e) {
    canvasEditor.value.setDropCache({ ...data, width: img.width, height: img.height });
  };
};

const clearFileCache = () => {
  nextTick(() => {
    files.value = [];
    // previewSrc.value = "";
    fileUploader.value.clearFile();
    addLog("清理成功");
  });
};

const addLog = (mes: string) => {
  logs.value.push({
    value: mes,
    timestamp: dateFmt(),
  });
};

const makeFile = function (type: "png" | "jpeg") {
  console.log(type, canvasFactory, files.value);
  // paintsFactory.setOpt(gifForm.value);
  // paintsFactory
  //   .toBlob(files.value)
  //   .then(() => {
  //     paintsFactory.toFile(type);
  //   })
  //   .catch((e) => {
  //     console.log(e);
  //   });
};
</script>

<style lang="less" scoped>
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
