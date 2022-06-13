<template>
  <BaseLayout :needLog="true">
    <template v-slot:header>
      <span>Pic GIF</span>
    </template>
    <template v-slot:menu>
      <button class="button A" @click="clearFileCache">清理数据</button>
    </template>
    <template v-slot:main>
      <div class="left">
        <Upload
          ref="fileUploader"
          :max_size="MAX_SIZE"
          @change="fileChangeHandle"
          @log="addLog"
        ></Upload>
      </div>
      <div class="right">
        <div class="gif-preview">
          <img :src="previewSrc" class="" />
        </div>
        <div class="btn-group">
          <button class="button large" @click="makePreview">生成预览</button>
          <button class="button large C" @click="makeFile('gif')">下载GIF</button>
          <button class="button large C" @click="makeFile('mp4')">下载MP4</button>
        </div>
        <GIFOption :value="gifForm" @change="gifFormChange"></GIFOption>
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
import Upload from "../../components/Upload.vue";
import GIFOption from "../../components/GIFOption.vue";

type FileObject = { id: number; src: string; file: File };
type GIFOption = {
  width: number;
  height: number;
  repeat: number;
  delay: number;
  background: string;
  rule: number;
};

const logs = ref([] as { value: string; timestamp: string }[]);
const previewSrc = ref("");
const fileUploader = ref();
const gifForm = ref({
  width: 900,
  height: 1600,
  repeat: 0,
  delay: 750,
  background: "#FFFFFF",
  rule: 3,
});

const gifFormChange = function (value: GIFOption) {
  gifForm.value = value;
};

const MAX_SIZE: number = 1000; // KB
let fileListCache: FileObject[] = [];
const paintsFactory = new PaintsFactory();

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

const makePreview = function () {
  console.log(fileListCache);
  paintsFactory
    .setOpt(gifForm.value)
    .toBlob(fileListCache)
    .then(() => {
      previewSrc.value = paintsFactory.toPreView();
    })
    .catch((e) => {
      console.log(e);
    });
};

const makeFile = function (type: "gif" | "mp4") {
  paintsFactory
    .setOpt(gifForm.value)
    .toBlob(fileListCache)
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
  margin: 0 auto var(--space-1);
  box-shadow: var(--shadow);
  img {
    display: inline-block;
    max-width: 100%;
  }
}
.right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: calc(var(--space-1) * 3);
}
</style>
