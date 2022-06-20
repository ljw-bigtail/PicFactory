<template>
  <div class="canvas-editor__box">
    <canvas id="canvas-editor__canvas"></canvas>
    <div
      class="canvas-editor__element"
      :style="{
        width,
        height,
        padding,
      }"
    >
      <div
        class="canvas-editor__element__cell"
        v-for="(element, index) in cellsImg"
        :key="`${element.id}_${index}}`"
        :class="[inDrag != '' && inDrag === index.toString() ? 'drop-in' : '']"
        :style="{
          height: cellsList[index].height + 'px',
          width: cellsList[index].width + 'px',
          top: cellsList[index].y + 'px',
          left: cellsList[index].x + 'px',
          borderWidth: element.src && element.src != '' ? '0px' : '2px',
        }"
        @drop="dropAdd($event, index)"
        @dragover="dragEnter($event, index)"
        @dragleave="dragLeave($event, index)"
      >
        <div class="canvas-editor__element__cell__box">
          <img
            v-show="element.src != ''"
            :src="element.src"
            @mousedown="imgMoveStart($event, index)"
            @mouseup="imgMoveEnd()"
            @mousemove="imgMove($event, index)"
            @mouseleave="imgMoveEnd()"
            :style="{
              height: element.height + 'px',
              width: element.width + 'px',
              top: element.y + 'px',
              left: element.x + 'px',
            }"
          />
          <span class="del-btn" @click="handleDel(index)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";

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

type FileOption = {
  id: string;
  src: string;
  file: File;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: "x" | "y";
};

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
const padding = ref("");
const template = ref(0);

const cellsList = ref();
const cellsImg = ref();

const inDrag = ref("");
let imgCache: FileOption | null = null;
let clearIndexForImg: string = "";

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

onMounted(function () {
  // const canvasFactory = new CanvasFactory({
  //   id: "canvas-editor__canvas",
  // });
  resize();
  initCells();
});

const config = {
  min_box_padding: 80, // editor__box 与 editor__element 的最小间距 (编辑框与外部的最小间距)
  element_padding: 40, // editor__element 的 padding 在 options.padding = 100% 时的值
  element_radius: 20, // editor__element 的 border-radius 在 options.radius = 100% 时的值
  cell_margin: 40, // editor__cell 的 margin 在 options.margin = 100% 时的值
};

const resize = function () {
  let dom = document.querySelector(".canvas-editor__box");
  if (!dom) {
    throw new Error("canvas-editor dom error");
  }
  const { width: size_width, height: size_height } = props.options;
  const { scale_width, scale_height } = {
    scale_width: Math.max(
      parseFloat((size_width / (dom.clientWidth - config.min_box_padding)).toFixed(2)),
      1
    ),
    scale_height: Math.max(
      parseFloat((size_height / (dom.clientHeight - config.min_box_padding)).toFixed(2)),
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
  const changeCell = function (cellsData: CellsOptionType[]) {
    var _cellsList: TypeObject = {},
      _cellsImg: {}[] = [];
    cellsData.forEach(function (item, index) {
      const [_width, _height] = [parseFloat(width.value), parseFloat(height.value)];
      _cellsImg.push({});
      // _cellsList[index.toString()] = {
      //   width: item.width * _width,
      //   height: item.height * _height,
      //   x: item.x * _width,
      //   y: item.y * _height,
      // };
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
  changeCell(template.cells);
};

const updateImgCache = function (json?: FileOption | null, index?: string) {
  // 都不传为 清除；传json时写入；传index时修改定位参数
  if (!json) {
    imgCache = null;
    return;
  }
  const { id, src, file, width, height } = json;
  let _width = width;
  let _height = height;
  let _scale = "x";
  if (index != undefined && imgCache) {
    // 根据 cell 的宽高计算 img 的
    const xScale = cellsList.value[index].width / width;
    const yScale = cellsList.value[index].height / height;
    const scale = Math.max(xScale, yScale);
    _width = width * scale;
    _height = height * scale;
    _scale = scale == xScale ? "y" : "x";
  }
  imgCache = {
    id,
    src,
    file,
    x: 0,
    y: 0,
    width: _width,
    height: _height,
    scale: _scale as "x" | "y",
  };
};

const handleDel = function (index: number) {
  // 清除图片
  if (cellsImg.value[index].id) {
    cellsImg.value[index] = {};
  }
};

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

// 图库挪入 start
// 外部调用： 缓存挪入的图片数据
const setDropCache = function (data: FileOption) {
  // 设置图片缓存
  if (!data || !data.id || !data.file || !data.src) {
    // updateImgCache();
    throw new Error("拖入文件数据异常");
  }
  // 拖入的图片 设置缓存
  updateImgCache({ ...data });
  clearIndexForImg = "";
};
defineExpose({ setDropCache });

const dragLeave = function (e: DragEvent, index: number) {
  stopHandler(e);
  inDrag.value = "";
};

const dropAdd = function (e: DragEvent, index: number) {
  stopHandler(e);
  const _index = index.toString();
  if (_index == "" || clearIndexForImg == _index) return;
  // 放置在当前位置
  updateImgCache(imgCache, _index);
  cellsImg.value[_index] = imgCache;
  inDrag.value = "";
  // 清除来源 img cache
  if (clearIndexForImg != "") {
    cellsImg.value[clearIndexForImg] = {};
    clearIndexForImg = "";
  }
};

const dragStart = function (index: number) {
  // 缓存： 记录当前的position 拖拽进其他cell
  const _index = index.toString();
  updateImgCache({ ...cellsImg.value[_index] }, _index);
  clearIndexForImg = _index.toString();
};

const dragEnter = function (e: DragEvent, index: number) {
  stopHandler(e);
  if (inDrag.value == index.toString()) return;
  inDrag.value = index.toString();
};
// 图库挪入 end

// 图片内部挪动 start
let dragPositionCache = 0; // 鼠标指针位置缓存
let moveState = -1; // 是否开启移动事件

const imgMoveStart = function (e: MouseEvent, index: number) {
  moveState = index;
  // 缓存： 记录当前的position 拖拽进其他cell
  dragStart(index);
  // 初始化移动起点
  const disX = e.clientX - (e.target as HTMLElement).offsetLeft;
  const disY = e.clientY - (e.target as HTMLElement).offsetTop;
  dragPositionCache = cellsImg.value[index].scale == "x" ? disX : disY;
};

const imgMoveEnd = function () {
  moveState = -1;
};

const imgMove = function (e: MouseEvent, index: number) {
  stopHandler(e);
  if (moveState == -1) return;
  if (moveState !== index) return;
  function getValByMax(len: number, max_len: number) {
    // 边界判断
    // 根据边距修改值
    if (len > 0) {
      return 0;
    } else if (len < -max_len) {
      return -max_len;
    } else {
      return len;
    }
  }
  switch (cellsImg.value[index].scale) {
    case "x":
      if (e.clientX != dragPositionCache) {
        const disX = e.clientX - (e.target as HTMLElement).offsetLeft;
        const len = cellsImg.value[index].x + disX - dragPositionCache;
        const max_len = cellsImg.value[index].width - cellsList.value[index].width;
        cellsImg.value[index].x = getValByMax(len, max_len);
        cellsImg.value[index].y = 0;
      }
      break;
    case "y":
      if (e.clientY != dragPositionCache) {
        const disY = e.clientY - (e.target as HTMLElement).offsetTop; // 鼠标位移距离
        const len = cellsImg.value[index].y + disY - dragPositionCache; // 图片位移距离
        const max_len = cellsImg.value[index].height - cellsList.value[index].height; // 图片位移边距
        cellsImg.value[index].x = 0;
        cellsImg.value[index].y = getValByMax(len, max_len);
      }
      break;
  }
};
// 图片内部挪动 end
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
      .del-btn {
        opacity: 0;
      }
      &:hover .del-btn {
        opacity: 0.5;
        &:hover {
          opacity: 1;
        }
      }
      &__box {
        position: relative;
        overflow: hidden;
        height: 100%;
        width: 100%;
        img {
          position: absolute;
        }
      }
    }
  }
}
</style>
