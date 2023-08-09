<template>
  <BaseLayout>
    <template v-slot:header>
      <span>Pic Collage</span>
    </template>
    <template v-slot:menu>
      <!-- <button class="button A" @click="clearFileCache">清理数据</button> -->
    </template>
    <template v-slot:main>
      <div class="left">
        <Tab.Box v-model:selected="tabSelect">
          <Tab.Panel key="library" title="图库">
            <Gallery ref="galleryLoader" @drop="handleDrop" />
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
            <div class="sticker-img">
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
            </div>
          </Tab.Panel>
        </Tab.Box>
        <div class="btn-group center">
          <button class="button large C" @click="previewFile()">生成预览</button>
        </div>
      </div>
      <div class="right">
        <CanvasEditor ref="canvasEditor" :options="canvasForm" />
      </div>
      <Dialog manner="mac" v-model:show="previewDialog" title="文件下载" maxHeight="96vh">
        <template v-slot:content>
          <div id="konva-container">
            <v-stage :config="configKonva" ref="stage">
              <v-layer>
                <v-rect :config="KonvaBackgroundConfig" />
                <!-- <v-group v-for="item in konvaPart" :key="item" :is="item.type" :config="item.group">
                  <component :is="item.type" :config="item.config"></component>
                </v-group> -->
                <component
                  v-for="item in konvaPart"
                  :key="item"
                  :is="item.type"
                  :config="item.config"
                ></component>
              </v-layer>
            </v-stage>
          </div>
        </template>
        <template v-slot:footer>
          <div class="btn-group center">
            <button class="button large C" @click="makeFile('jpg')">下载jpeg</button>
            <button class="button large C" @click="makeFile('png')">下载png</button>
          </div>
        </template>
      </Dialog>
    </template>
    <template v-slot:footer>
      <Log :logs="logs" />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, Ref, inject, h } from "vue";
import { saveAs } from "file-saver";
import { dateFmt, uuid, getImg } from "@/utils/utils";
import { DefaultCanvasFactoryOptions, stickerArr } from "@/utils/CanvasFactory";
import BaseLayout from "@/layouts/BaseLayout.vue";
import { Tab, Line, Accordion, Dialog } from "@/components/index";
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
const message = inject("_message") as Function;

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

const previewDialog = ref(false);
const configKonva = ref({
  width: canvasForm.value.width,
  height: canvasForm.value.height,
});
let pixelRatio = 1;

const konvaComponents = [
  "v-rect", // 矩形
  "v-circle", // 圆形
  "v-ellipse", // 椭圆
  "v-line", // 线条
  "v-image", // 图片
  "v-text", // 文字
  "v-text-path", // 路径文字
  "v-star", // 星
  "v-label", // 标签
  "v-path", // 路径
  "v-regular-polygon", // 等边多边形
];
const konvaPart: Ref<any[]> = ref([]);
const KonvaBackgroundConfig = ref({
  x: 0,
  y: 0,
  width: configKonva.value.width,
  height: configKonva.value.height,
  fill: canvasForm.value.background,
});

const previewFile = async function () {
  konvaPart.value = [];
  const imageParameters = canvasEditor.value.getImageParameters();
  // const imageParameters = imageParametersTest;
  /**
   * TODO
   * 1. 渲染占位图边框 因为是个圆角 不好弄
   * 3. 旋转后偏移量不对 没有解决
   *  */
  // canvas 配置
  configKonva.value.width = imageParameters.canvasWidth;
  configKonva.value.height = imageParameters.canvasHeight;
  pixelRatio = imageParameters.canvasScale;
  // canvas 背景
  KonvaBackgroundConfig.value.width = imageParameters.canvasWidth;
  KonvaBackgroundConfig.value.height = imageParameters.canvasHeight;
  KonvaBackgroundConfig.value.fill = imageParameters.canvasBackgroundColor;
  // canvas group 与组内 img
  const blockImgs = await Promise.all(
    imageParameters.blocks.map(async (item: any) => await getImg(item.blockImg))
  );
  imageParameters.blocks.forEach((item: any, index: number) => {
    const {
      blockWidth: width,
      blockHeight: height,
      blockRadius: radius,
      blockPositionX: x,
      blockPositionY: y,
      blockImgPositionX: imgX,
      blockImgPositionY: imgY,
      blockImgWidth: imgWidth,
      blockImgHeight: imgHeight,
      blockImgScale: scale,
      blockImgRotateX: rotateX,
      blockImgRotateY: rotateY,
      blockImgRotateZ: rotateZ,
    } = item;
    const konvaPartConfig: any = {
      type: konvaComponents[0],
      group: {
        x,
        y,
        width,
        height,
        clipFunc: function (ctx: CanvasRenderingContext2D) {
          // 圆角矩形路径
          const [x, y] = [0, 0];
          ctx.moveTo(x + radius, y);
          ctx.arcTo(x + width, y, x + width, y + height, radius); // 右上角
          ctx.arcTo(x + width, y + height, x, y + height, radius); // 右下角
          ctx.arcTo(x, y + height, x, y, radius); // 左下角
          ctx.arcTo(x, y, x + width, y, radius); // 左上角
        },
      },
    };

    if (!item.blockImg || item.blockImg == "") {
      // 块背景
      konvaPartConfig.type = konvaComponents[0];
      konvaPartConfig.config = {
        width,
        height,
        fill: item.blockBackgroundColor,
        x,
        y,
        // 边框todo
      };
    } else {
      // 图片
      konvaPartConfig.type = konvaComponents[4];
      // rotateY;
      let offset = {
        x: 0,
        y: 0,
      };
      let scaleX = scale;
      let scaleY = scale;
      if (rotateY == 180) {
        // 左右翻转 需要修改offset
        offset.x = imgWidth;
        scaleX *= -1;
      }
      if (rotateX == 180) {
        // 上下翻转 需要修改offset
        offset.y = imgHeight;
        scaleY *= -1;
      }
      // if (rotateZ != 0) {
      //   // 旋转 需要修改offset
      //   offset.x = imgWidth / 2;
      //   offset.y = imgHeight / 2;
      //   // scaleY *= -1;
      // }
      konvaPartConfig.config = {
        width: imgWidth,
        height: imgHeight,
        image: blockImgs[index],
        scaleX,
        scaleY,
        x: imgX,
        y: imgY,
        offset,
        // rotation: rotateZ,
      };
    }
    konvaPart.value.push(konvaPartConfig);
  });
  imageParameters.fragmentTexts.forEach((item: any) => {
    const { fontSize, color, text, x, y, rotateZ } = item;
    // 文字
    konvaPart.value.push({
      type: konvaComponents[5],
      config: {
        text,
        x,
        y,
        fontSize,
        // fontFamily: "Calibri",
        fill: color,
        rotation: rotateZ,
      },
    });
  });
  const fragmentImgsSrc = await Promise.all(
    imageParameters.fragmentImgs.map(async (item: any) => await getImg(item.src))
  );
  imageParameters.fragmentImgs.forEach((item: any, index: number) => {
    const { width, height, x, y, rotateZ, scale } = item;
    // 图片
    konvaPart.value.push({
      type: konvaComponents[4],
      config: {
        width,
        height,
        image: fragmentImgsSrc[index],
        scaleX: scale,
        scaleY: scale,
        x,
        y,
        rotation: rotateZ,
      },
    });
  });
  previewDialog.value = true;
};

const stage = ref();
const mimeTypes = {
  png: "image/png",
  jpg: "image/jpeg",
};

const makeFile = async function (type: "png" | "jpg") {
  const dataURL = stage.value.getStage().toDataURL({
    pixelRatio, // 输出图片分辨率为渲染分辨率的3倍
    mimeType: mimeTypes[type],
  });
  saveAs(dataURL, "image." + type);
  message({
    type: "success",
    value: `${type.toLocaleUpperCase()}下载完成。`,
  });
  previewDialog.value = false;
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
#konva-container {
  margin: var(--space-1);
  box-shadow: var(--shadow-dark);
}
</style>
