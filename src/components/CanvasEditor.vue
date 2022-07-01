<template>
  <div class="canvas-editor__box" @click="clearSelectHandler">
    <div
      id="canvas-editor__canvas"
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
          borderRadius: cellsList[index].radius + 'px',
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
            @click="selectImgHandler($event, index)"
            @mousedown="imgMoveStart($event, index)"
            @mouseup="imgMoveEnd()"
            @mousemove="imgMove($event, index)"
            @mouseleave="imgMoveEnd()"
            :style="{
              height: element.height * element.scale + 'px',
              width: element.width * element.scale + 'px',
              top: element.y + 'px',
              left: element.x + 'px',
              transform: `rotateX(${element.rotateX}deg) rotateY(${element.rotateY}deg) rotateZ(${element.rotateZ}deg)`,
            }"
          />
          <span class="css-icon delete bold" @click="handleDel(index)"></span>
        </div>
      </div>
    </div>
    <CanvasImgOption
      ref="canvasImgOption"
      v-model:value="canvasImgForm"
      :visible="selectImgIndex > -1"
      @change="scaleHandler"
      @flipX="flipXHandler"
      @flipY="flipYHandler"
      @turnAnti="turnAntiHandler"
      @turn="turnHandler"
    ></CanvasImgOption>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import CanvasImgOption from "./Options/collage-img.vue";

import {
  DefaultCanvasFactoryOptions,
  DefaultCanvasImgOptions,
  DefaultCellOptions,
  templateArr,
} from "../utils/CanvasFactory";

type FileOption = {
  id: string;
  src: string;
  file: File;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

type TypeObject = {
  [key: string]: any;
};

const props = defineProps({
  options: {
    type: Object,
    default: { ...DefaultCanvasFactoryOptions },
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
  if (newOptions.height !== height.value || newOptions.width !== width.value) {
    resize();
    initCells();
  } else if (newOptions.template !== template.value) {
    initCells();
  }
});

onMounted(function () {
  resize();
  initCells();
});

const config = { ...DefaultCellOptions };

const resize = function () {
  let dom = document.querySelector(".canvas-editor__box");
  if (!dom) {
    throw new Error("canvas-editor dom error");
  }
  const { width: size_width, height: size_height } = props.options;
  const { scale_width, scale_height } = {
    scale_width: Math.max(
      parseFloat(
        (size_width / (dom.clientWidth - config.min_box_padding * 2)).toFixed(2)
      ),
      1
    ),
    scale_height: Math.max(
      parseFloat(
        (size_height / (dom.clientHeight - config.min_box_padding * 2)).toFixed(2)
      ),
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
  const [cell_width, cell_height] = [parseFloat(width.value), parseFloat(height.value)]; // 绘板宽高
  const padding = config.element_padding * props.options.padding,
    margin = config.cell_margin * props.options.margin,
    radius = config.element_radius * props.options.radius;
  const [x_qty, y_qty] = template.qty; // 网格长宽数量
  const [item_width, item_height] = [
    (cell_width - 2 * padding - (x_qty - 1) * margin) / x_qty,
    (cell_height - 2 * padding - (y_qty - 1) * margin) / y_qty,
  ]; // 每格占用
  // 计算 cell 的大小与定位
  const _cellsList: TypeObject = {};
  template.cells.forEach(function (item, index) {
    // 初始化尺寸
    const [[start_x, start_y], [end_x, end_y]] = item;
    const _width = (end_x - start_x) * item_width + (end_x - start_x - 1) * margin,
      _height = (end_y - start_y) * item_height + (end_y - start_y - 1) * margin,
      _x = padding + start_x * (margin + item_width),
      _y = padding + start_y * (margin + item_height);
    _cellsList[index.toString()] = {
      width: _width,
      height: _height,
      x: _x,
      y: _y,
      radius: radius * Math.min(_width, _height),
    };
  });
  // 初始化cell数据
  cellsList.value = _cellsList;
  // 初始化img占位
  cellsImg.value = Object.keys(_cellsList).map(function (e, index) {
    if (
      cellsImg.value &&
      cellsImg.value[index] &&
      Object.keys(cellsImg.value[index]).length > 0
    ) {
      return updateImgCache(cellsImg.value[index], index.toString());
    }
    return {};
  });
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
  if (index != undefined && imgCache) {
    // 根据 cell 的宽高计算 img 的
    const xScale = cellsList.value[index].width / width;
    const yScale = cellsList.value[index].height / height;
    const scale = Math.max(xScale, yScale);
    _width = width * scale;
    _height = height * scale;
  }
  imgCache = {
    id,
    src,
    file,
    width: _width,
    height: _height,
    x: 0, // 定位 x
    y: 0, // 定位 y
    scale: 1, // 缩放 100% ～ 200%
    rotateX: 0, // X轴对称
    rotateY: 0, // Y轴对称
    rotateZ: 0, // 中心旋转
  };
  return imgCache;
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
  // 缓存移出img数据数据
  const _old_target_img = { ...cellsImg.value[_index] };
  // 放置在当前位置
  updateImgCache(imgCache, _index);
  cellsImg.value[_index] = imgCache;
  inDrag.value = "";
  switch (props.options.rule) {
    case 1:
      // 清除来源 img cache
      if (clearIndexForImg != "") {
        cellsImg.value[clearIndexForImg] = {};
        clearIndexForImg = "";
      }
      break;
    case 2:
      // 替换
      if (clearIndexForImg != "") {
        cellsImg.value[clearIndexForImg] = _old_target_img;
        clearIndexForImg = "";
      }
      break;
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
let dragPositionCache = {
  x: 0,
  y: 0,
}; // 鼠标指针位置缓存
let moveState = -1; // 是否开启移动事件

const imgMoveStart = function (e: MouseEvent, index: number) {
  moveState = index;
  // 缓存： 记录当前的position 拖拽进其他cell
  dragStart(index);
  // 初始化移动起点
  dragPositionCache = {
    x: e.clientX - (e.target as HTMLElement).offsetLeft,
    y: e.clientY - (e.target as HTMLElement).offsetTop,
  };
};

const imgMoveEnd = function () {
  moveState = -1;
};

const imgMove = function (e: MouseEvent, index: number) {
  stopHandler(e);
  if (moveState == -1) return;
  if (moveState !== index) return;
  function getSize(type: "x" | "y") {
    function getValByMax(len: number, max_len: number) {
      // 边界判断 根据边距修改值
      if (len > 0) {
        return 0;
      } else if (len < -max_len) {
        return -max_len;
      } else {
        return len;
      }
    }
    if (type == "x") {
      return e.clientX != dragPositionCache.x
        ? (function () {
            const disX = e.clientX - (e.target as HTMLElement).offsetLeft;
            const len = cellsImg.value[index].x + disX - dragPositionCache.x;
            const max_len =
              cellsImg.value[index].width * cellsImg.value[index].scale -
              cellsList.value[index].width;
            return getValByMax(len, max_len);
          })()
        : 0;
    } else if (type == "y") {
      return e.clientY != dragPositionCache.y
        ? (function () {
            const disY = e.clientY - (e.target as HTMLElement).offsetTop; // 鼠标位移距离
            const len = cellsImg.value[index].y + disY - dragPositionCache.y; // 图片位移距离
            const max_len =
              cellsImg.value[index].height * cellsImg.value[index].scale -
              cellsList.value[index].height; // 图片位移边距
            return getValByMax(len, max_len);
          })()
        : 0;
    }
  }
  cellsImg.value[index].x = getSize("x");
  cellsImg.value[index].y = getSize("y");
};
// 图片内部挪动 end

// 图片编辑 start
const canvasImgOption = ref();
const canvasImgForm = ref({ ...DefaultCanvasImgOptions });
const selectImgIndex = ref(-1);

const selectImgHandler = function (e: Event, index: number) {
  stopHandler(e);
  selectImgIndex.value = index;
  canvasImgOption.value.setScale(cellsImg.value[index].scale - 1);
};

const clearSelectHandler = function (e: Event) {
  stopHandler(e);
  selectImgIndex.value = -1;
};

const scaleHandler = function () {
  if (selectImgIndex.value == -1) return;
  cellsImg.value[selectImgIndex.value].scale = canvasImgForm.value.scale + 1;
};

const flipXHandler = function () {
  cellsImg.value[selectImgIndex.value].rotateY =
    cellsImg.value[selectImgIndex.value].rotateY == 0 ? 180 : 0;
};

const flipYHandler = function () {
  cellsImg.value[selectImgIndex.value].rotateX =
    cellsImg.value[selectImgIndex.value].rotateX == 0 ? 180 : 0;
};

const turnAntiHandler = function () {
  cellsImg.value[selectImgIndex.value].rotateZ -= 90;
};

const turnHandler = function () {
  cellsImg.value[selectImgIndex.value].rotateZ += 90;
};
// 图片编辑end
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
    position: relative;
    overflow: hidden;
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
      .delete {
        opacity: 0;
        right: 0;
        position: absolute;
        border-radius: 50%;
      }
      &:hover .delete {
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
