<template>
  <BaseLayout>
    <template v-slot:header>
      <span>图片编辑</span>
    </template>
    <template v-slot:main>
      <div class="left">
        <Upload :max_size="MAX_SIZE" @change="fileChangeHandle" @log="addLog"></Upload>
      </div>
      <div class="center">
        <GIFOption :value="gifForm" @change="gifFormChange"></GIFOption>
        <div class="btn-group">
          <button id="make-preview" class="button" @click="makePreview">生成预览</button>
        </div>
      </div>
      <div class="right">
        <img :src="previewSrc" alt="" class="gif-preview" />
        <div class="btn-group">
          <button class="button" @click="makeFile('gif')">下载GIF</button>
          <button class="button" @click="makeFile('mp4')">下载MP4</button>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Log :logs="logs"></Log>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { dateFmt } from "../../utils/utils";
import { PaintsFactory } from "../../utils/PaintsFactory";

import BaseLayout from "../../layouts/base.vue";
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

const addLog = (mes: string) => {
  logs.value.push({
    value: mes,
    timestamp: dateFmt(),
  });
};

const makePreview = function () {
  paintsFactory.setOpt(gifForm.value);
  paintsFactory
    .toBlob(fileListCache)
    .then(() => {
      previewSrc.value = paintsFactory.toPreView();
    })
    .catch((e) => {
      console.log(e);
    });
};

const makeFile = function (type: "gif" | "mp4") {
  paintsFactory.setOpt(gifForm.value);
  paintsFactory
    .toBlob(fileListCache)
    .then(() => {
      paintsFactory.toFile(type);
    })
    .catch((e) => {
      console.log(e);
    });
};
</script>

<style scoped lang="less">
.gif-preview {
  width: 100%;
  max-width: 300px;
  display: block;
  margin: 20px auto;
}
</style>
