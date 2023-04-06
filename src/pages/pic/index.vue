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
        <Tab.Box v-model:selected="tabSelect">
          <Tab.Panel key="library" title="图库">
            <Gallery ref="galleryLoader" @log="addLog" @drop="handleDrop" />
          </Tab.Panel>
          <Tab.Panel key="setting" title="设置">
            <CanvasOption v-model:value="canvasForm" />
          </Tab.Panel>
          <Tab.Panel key="sticker" title="贴纸">
            <div class="sticker-text">
              <textarea v-model="textSticker" placeholder="请输入需要插入的文字" />
              <button class="button button-icon B" @click="textAdd">
                <span class="css-icon plus"></span>
                插入
              </button>
            </div>
            <Line />
            <div class="sticker-file">
              <Gallery
                ref="stickerLoader"
                @log="addLog"
                @drop="handleStickerDrop"
                :multiDrop="true"
              />
            </div>
            <Line />
            <!-- <div class="sticker-img">
              <Accordion.Box v-model:selected="stickerTabSelect">
                <Accordion.Panel
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
                </Accordion.Panel>
              </Accordion.Box>
            </div> -->
          </Tab.Panel>
        </Tab.Box>
        <div class="btn-group center">
          <button class="button large C" @click="makeFile('jpg')">下载jpeg</button>
          <button class="button large C" @click="makeFile('png')">下载png</button>
        </div>
      </div>
      <div class="right">
        <CanvasEditor ref="canvasEditor" :options="canvasForm" />
      </div>
    </template>
    <template v-slot:footer>
      <Log :logs="logs" />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import { dateFmt, uuid } from "@/utils/utils";
import { CanvasFactory, DefaultCanvasFactoryOptions, stickerArr } from "@/utils/CanvasFactory";
import BaseLayout from "@/layouts/BaseLayout.vue";
import { Tab, Line, Accordion } from "@/components/index";
import Log from "@/fragment/Log.vue";
import Gallery from "@/fragment/Gallery/index.vue";
import CanvasOption from "@/fragment/Options/collage-canvas.vue";
import CanvasEditor from "@/fragment/CanvasEditor.vue";
import { dropFileType } from "@/type/dropFile";

const logs = ref([] as { value: string; timestamp: string }[]);
const galleryLoader = ref();
const stickerLoader = ref();
const canvasEditor = ref();
const tabSelect = ref("setting");
const canvasForm = ref({ ...DefaultCanvasFactoryOptions });
const stickerTabSelect = ref(stickerArr[0].key); // 默认打开第一套贴纸
const textSticker = ref();
const files: Ref<dropFileType[]> = ref([]);

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

const addFragment = function (opt: {} | {}[]) {
  const datas = Array.isArray(opt) ? opt : [opt];
  canvasEditor.value.addFragment(
    datas.map((item) => {
      return {
        id: uuid(),
        ...item,
      };
    })
  );
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

const loadImg = (
  src: string
): Promise<{
  width: number;
  height: number;
  src: string;
}> => {
  return new Promise(function (res) {
    const img = new Image();
    img.src = src;
    img.onload = function () {
      res({
        height: img.height,
        width: img.width,
        src,
      });
    };
  });
};

const handleStickerDrop = async function () {
  canvasEditor.value.setDropCache({});
  const imgs = await Promise.all(
    [...arguments[0]].map(async (item) => {
      return await loadImg(item.src);
    })
  );
  const maxSize = 300;
  addFragment(
    imgs.map((item) => {
      const { src, width, height } = item;
      let max_height = 0,
        max_width = 0;
      if (height > width) {
        max_height = maxSize;
        max_width = (width / height) * max_height;
      } else {
        max_width = maxSize;
        max_height = (height / width) * max_width;
      }
      return {
        type: "img",
        value: src,
        width: max_width,
        height: max_height,
      };
    })
  );
  files.value = [];
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
    top: calc(100% - 100px + 20px);
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
.sticker-file {
  box-shadow: var(--shadow);
  padding: var(--space-1);
  margin: var(--space-1) 0;
  background: #eee;
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
