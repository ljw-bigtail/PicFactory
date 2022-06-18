<template>
  <div class="canvas-editor__box">
    <canvas id="canvas-editor__canvas"></canvas>
    <div
      class="canvas-editor__element"
      :style="{
        width,
        height,
      }"
    >
      <div
        class="canvas-editor__element__cell"
        v-for="(element, index) in cellsImg"
        :key="element.id"
        :data-index="index"
        :class="[inDrag != '' && inDrag === index.toString() ? 'drop-in' : '']"
        :style="{
          height: cellsList[index].height + 'px',
          width: cellsList[index].width + 'px',
          top: cellsList[index].y + 'px',
          left: cellsList[index].x + 'px',
          borderWidth: element.src && element.src != '' ? '0px' : '2px',
        }"
        @drop="dropAdd"
        @dragenter="dragEnter"
        @dragover="dragEnter"
        @dragleave="dragLeave"
      >
        <img v-show="element.src != ''" :src="element.src" @dragstart="dragCacheChange" />
        <span class="del-btn" @click="handleDel(element)"></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted, watch } from "vue";

import {
  CanvasFactory,
  DefaultCanvasFactoryOptions,
  templateArr,
} from "../utils/CanvasFactory";

type CellsOptionType = {
  width: number;
  height: number;
  x: number;
  y: number;
  img?: any;
};

type FileOption = { id: string; src: string; file: File };

type TypeObject = {
  [key: string]: any;
};

const props = defineProps({
  options: {
    type: Object,
    default: DefaultCanvasFactoryOptions,
  },
});

const width = ref("");
const height = ref("");
const template = ref(0);

const cellsList = ref();
const cellsImg = ref();

const inDrag = ref("");
let dropCache: FileOption | null = null;
let dropFrom: string = "";

watch([props.options], function ([newOptions]) {
  console.log(newOptions, "配置更新");
  if (newOptions.height !== height.value || newOptions.width !== width.value) {
    resize();
    initCells();
  }
  if (newOptions.template !== template.value) {
    initCells();
  }
});

const setDropCache = function (data: FileOption) {
  // 设置图片缓存
  if (!data || !data.id || !data.file || !data.src) {
    dropCache = null;
    console.warn("拖入文件数据异常");
    return;
  }
  dropCache = { ...data };
};
defineExpose({ setDropCache });

onMounted(function () {
  // const canvasFactory = new CanvasFactory({
  //   id: "canvas-editor__canvas",
  // });
  resize();
  initCells();
});

const resize = function () {
  let dom = document.querySelector(".canvas-editor__box");
  if (!dom) {
    throw new Error("canvas-editor dom error");
  }
  const padding = 80; // 编辑框与外部的最小间距
  const { width: size_width, height: size_height } = props.options;
  const { scale_width, scale_height } = {
    scale_width: Math.max(
      parseFloat((size_width / (dom.clientWidth - padding)).toFixed(2)),
      1
    ),
    scale_height: Math.max(
      parseFloat((size_height / (dom.clientHeight - padding)).toFixed(2)),
      1
    ),
  };
  const scale = Math.max(scale_width, scale_height);
  width.value = (size_width / scale).toFixed(0) + "px";
  height.value = (size_height / scale).toFixed(0) + "px";
};

const initCells = function () {
  const template = templateArr[props.options.template];
  if (!template || !template.cells) {
    // throw new Error("数据异常");
    console.warn("templateArr 数据异常");
    return;
  }
  changeCell(template.cells);
};

const changeCell = function (cellsData: CellsOptionType[]) {
  var _cellsList: TypeObject = {},
    _cellsImg: {}[] = [];
  cellsData.forEach(function (item, index) {
    const [_width, _height] = [parseFloat(width.value), parseFloat(height.value)];
    _cellsImg.push({});
    _cellsList[index.toString()] = {
      width: item.width * _width,
      height: item.height * _height,
      x: item.x * _width,
      y: item.y * _height,
    };
  });
  cellsList.value = _cellsList;
  cellsImg.value = _cellsImg;
};

const handleDel = function (item: {}) {
  console.log(item);
};

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

const dragLeave = function (e: DragEvent) {
  stopHandler(e);
  inDrag.value = "";
};

const dropAdd = function (e: DragEvent) {
  stopHandler(e);
  if (inDrag.value == "") return;
  // 放置在当前位置
  cellsImg.value[inDrag.value] = dropCache;
  inDrag.value = "";
  // 清除来源 img cache
  if (dropFrom != "") {
    cellsImg.value[dropFrom] = {};
    dropFrom = "";
  }
};

const dragEnter = function (e: DragEvent) {
  stopHandler(e);
  let target = e.target as HTMLElement;
  let index = target.dataset.index;
  if (target.nodeName === "IMG") {
    // 拖到img上 取上一级 index
    index = target.parentElement?.dataset.index;
  }
  if (index == undefined || inDrag.value == index) return;
  inDrag.value = index;
};

const dragCacheChange = function (e: DragEvent) {
  let index = (e.target as HTMLElement).parentElement?.dataset.index;
  if (index == undefined) return;
  dropCache = { ...cellsImg.value[index] };
  dropFrom = index;
};
</script>

<style lang="less" scoped>
.canvas-editor {
  &__box {
    background-color: var(--color-light-gray);
    height: 100%;
    width: 100%;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    #canvas-editor__canvas {
      display: none;
    }
  }
  &__element {
    background-color: var(--color-white);
    box-shadow: var(--shadow-dark);
    position: relative;
    overflow: hidden;
    &__cell {
      position: absolute;
      border: 2px dashed var(--main-color-opacity);
      overflow: hidden;
      box-sizing: border-box;
      &.drop-in {
        background-color: var(--main-color-opacity);
        border-color: var(--main-color);
      }
      img {
        max-width: 100%;
        max-height: 100%;
      }
      .del-btn {
        opacity: 0;
      }
      &:hover .del-btn {
        opacity: 0.5;
        &:hover {
          opacity: 1;
        }
      }
    }
  }
}
</style>
