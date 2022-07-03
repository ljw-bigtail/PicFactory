<template>
  <BaseLayout :needLog="true">
    <template v-slot:header>
      <span>Pic Collage</span>
    </template>
    <template v-slot:menu>
      <!-- <button class="button A" @click="clearFileCache">清理数据</button> -->
      <button class="button C">
        <a href="./gif.html">Pic GIF</a>
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
              @drop="handleDrop"
            ></Gallery>
          </TabPanel>
          <TabPanel key="setting" title="设置">
            <CanvasOption v-model:value="canvasForm"></CanvasOption>
          </TabPanel>
          <TabPanel key="sticker" title="贴纸">
            <div class="sticker-text">
              <textarea v-model="textSticker" placeholder="请输入需要插入的文字" />
              <button class="button button-icon B" @click="textAdd">
                <span class="css-icon plus"></span>
                插入
              </button>
            </div>
            <Line />
            <div class="sticker-img">
              <Accordion v-model:selected="stickerTabSelect">
                <AccordionPanel
                  v-for="stickerItem in stickerArr"
                  :key="stickerItem.key"
                  :title="stickerItem.seriesName"
                >
                  <ul class="sticker-list">
                    <li
                      v-for="item in stickerItem.src"
                      @click="stickerAdd($event, item)"
                      @mousedown="() => false"
                    >
                      <img :src="item" alt="" srcset="" @mousedown="stopHandler" />
                    </li>
                  </ul>
                </AccordionPanel>
              </Accordion>
            </div>
          </TabPanel>
        </Tab>
        <div class="btn-group center">
          <button class="button large C" @click="makeFile('jpg')">下载jpeg</button>
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
import { ref, nextTick } from "vue";

import { dateFmt, uuid } from "../../utils/utils";
import {
  CanvasFactory,
  DefaultCanvasFactoryOptions,
  stickerArr,
} from "../../utils/CanvasFactory";

import BaseLayout from "../../layouts/BaseLayout.vue";
import Log from "../../components/Log.vue";
import Gallery from "../../components/Gallery/index.vue";
import Tab from "../../components/Tab/Box.vue";
import TabPanel from "../../components/Tab/Panel.vue";
import Accordion from "../../components/Accordion/Box.vue";
import AccordionPanel from "../../components/Accordion/Panel.vue";
import CanvasOption from "../../components/Options/collage-canvas.vue";
import CanvasEditor from "../../components/CanvasEditor.vue";
import Line from "../../components/Line.vue";

const logs = ref([] as { value: string; timestamp: string }[]);
// const previewSrc = ref("");
const galleryLoader = ref();
const canvasEditor = ref();
const tabSelect = ref("setting");
const canvasForm = ref({ ...DefaultCanvasFactoryOptions });
const files = ref();
const stickerTabSelect = ref(stickerArr[0].key); // 默认打开第一套贴纸
const textSticker = ref();

type fragmentOpt = {
  type: "text" | "img";
  value: string;
  id: string;
};
type FileOption = { id: string; src: string; file: File };

const handleDrop = function (data: FileOption) {
  const img = new Image();
  img.src = data.src;
  img.onload = function (e) {
    canvasEditor.value.setDropCache({ ...data, width: img.width, height: img.height });
  };
};
const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

const clearFileCache = () => {
  nextTick(() => {
    files.value = [];
    // previewSrc.value = "";
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

const makeFile = function (type: "png" | "jpg") {
  const canvasFactory = new CanvasFactory({
    id: "canvas-editor__canvas",
    options: { ...canvasForm.value },
  });
  canvasFactory.toFile(type);
};

const addFragment = function (opt: {}) {
  canvasEditor.value.addFragment({
    id: uuid(),
    ...opt,
  } as fragmentOpt);
};

const stickerAdd = function (e: Event, src: string) {
  // 添加贴纸
  stopHandler(e);
  if (!src) return;
  addFragment({
    type: "img",
    value: src,
  });
};

const textAdd = function () {
  // 添加文字
  if (!textSticker.value || textSticker.value.trim() == "") return;
  addFragment({
    type: "text",
    value: textSticker.value,
  });
  textSticker.value = "";
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
.sticker-text {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  box-shadow: var(--shadow);
  margin: var(--space-1) 0;
  padding: var(--space-1);
  textarea {
    flex: 1;
    padding: 0 var(--space-1);
    border: none;
    height: 8em;
    margin-right: var(--space-1);
    &:focus {
      outline: none;
    }
  }
}
.sticker-img {
  .sticker-list {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: flex-start;
    font-size: 0;
    li {
      width: 18%;
      margin-right: 2%;
      margin-top: var(--space-1);
      border-radius: var(--radius-mini);
      cursor: pointer;
      &:hover {
        box-shadow: var(--shadow);
      }
      img {
        max-width: 100%;
        max-height: 100px;
      }
    }
  }
}
</style>
