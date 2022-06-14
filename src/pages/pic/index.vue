<template>
  <BaseLayout :needLog="true">
    <template v-slot:header>
      <span>Pic Collage</span>
    </template>
    <template v-slot:menu>
      <button class="button A" @click="clearFileCache">清理数据</button>
    </template>
    <template v-slot:main>
      <div class="left">
        <Tab v-model:selected="tabSelect">
          <TabPanel key="setting" title="设置">
            <CanvasOption
              v-model:value="canvasForm"
              @change="optionsChange"
            ></CanvasOption>
          </TabPanel>
          <TabPanel key="library" title="图库">
            <Upload ref="fileUploader" @change="fileChangeHandle" @log="addLog"></Upload>
          </TabPanel>
          <TabPanel key="letter" title="文字"> Coming Soon </TabPanel>
        </Tab>
      </div>
      <div class="right">
        <div class="gif-preview">
          <img :src="previewSrc" class="" />
        </div>
        <div class="btn-group">
          <button class="button large C" @click="makeFile('jpeg')">下载jpeg</button>
          <button class="button large C" @click="makeFile('png')">下载png</button>
        </div>
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
import { CanvasFactory } from "../../utils/CanvasFactory";

import BaseLayout from "../../layouts/BaseLayout.vue";
import Log from "../../components/Log.vue";
import Upload from "../../components/Upload.vue";
import Tab from "../../components/Tab/Box.vue";
import TabPanel from "../../components/Tab/Panel.vue";
import CanvasOption from "../../components/OptionForm/canvas.vue";

type FileObject = { id: number; src: string; file: File };

const logs = ref([] as { value: string; timestamp: string }[]);
const previewSrc = ref("");
const fileUploader = ref();
const tabSelect = ref("setting");
const canvasForm = ref({
  width: 900,
  height: 1600,
  padding: 0.25,
  margin: 0.4,
  radius: 0,
  template: 0,
});

let fileListCache: FileObject[] = [];
const canvasFactory = new CanvasFactory();

const fileChangeHandle = (fileList: FileObject[]) => {
  fileListCache = fileList;
};

const clearFileCache = () => {
  nextTick(() => {
    fileListCache = [];
    previewSrc.value = "";
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

const optionsChange = () => {
  console.log({ ...canvasForm.value }, "配置更新");
};

// const makePreview = function () {
//   console.log(fileListCache);
//   paintsFactory.setOpt(gifForm.value);
//   paintsFactory
//     .toBlob(fileListCache)
//     .then(() => {
//       previewSrc.value = paintsFactory.toPreView();
//     })
//     .catch((e) => {
//       console.log(e);
//     });
// };

const makeFile = function (type: "png" | "jpeg") {
  console.log(type, canvasFactory);

  // paintsFactory.setOpt(gifForm.value);
  // paintsFactory
  //   .toBlob(fileListCache)
  //   .then(() => {
  //     paintsFactory.toFile(type);
  //   })
  //   .catch((e) => {
  //     console.log(e);
  //   });
};
</script>

<style lang="less" scoped>
.gif-preview {
  max-width: 300px;
  min-height: 400px;
  display: block;
  margin: 0 auto var(--space-1);
  box-shadow: var(--shadow);
  img {
    display: inline-block;
    max-width: 100%;
  }
}
</style>
