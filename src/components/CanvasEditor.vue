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
      <draggable v-model="cellsSort" item-key="id" @change="handleMove">
        <template #item="{ element }">
          <div
            class="canvas-editor__element__cell"
            :style="{
              height: cellsFile[element].height + 'px',
              width: cellsFile[element].width + 'px',
              top: cellsFile[element].y + 'px',
              left: cellsFile[element].x + 'px',
              borderWidth: cellsFile[element].img != '' ? '0px' : '2px',
            }"
            @click="cellClick(element)"
          >
            <img
              v-show="cellsFile[element].img != ''"
              :src="cellsFile[element].img.src"
            />
            <span class="del-btn" @click="handleDel(element)"></span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type } from "os";
import { ref, nextTick, onMounted, onUpdated, watch } from "vue";
import draggable from "vuedraggable";

import {
  CanvasFactory,
  DefaultCanvasFactoryOptions,
  templateArr,
} from "../utils/CanvasFactory";

type dragEvent = {
  moved: {
    element: any;
    newIndex: number;
    oldIndex: number;
  };
};

type CellsFileType = {
  width: number;
  height: number;
  x: number;
  y: number;
  img?: any;
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
const template = ref(0);
const selectIndex = ref(props.options.template);

const cellsFile = ref();
const cellsSort = ref();
// const files = ref();

watch([props.options], function ([newOptions]) {
  console.log(newOptions, "配置更新");
  if (newOptions.height !== height.value || newOptions.width !== width.value) {
    resize();
  }
  if (newOptions.template !== template.value) {
    initCells();
  }
});

const setImg = function (data: {}) {
  // if (!cellsFile.value) return;
  // if (!cellsFile.value[selectIndex.value]) return;
  cellsFile.value[selectIndex.value].img = { ...data };
  // console.log(data, cellsFile.value[selectIndex.value], "add img");
};
defineExpose({ setImg });

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

const changeCell = function (cellsData: CellsFileType[]) {
  var _cellsFile: TypeObject = {},
    _cellsSort: number[] = [];
  cellsData.forEach(function (item, index) {
    const [_width, _height] = [parseFloat(width.value), parseFloat(height.value)];
    _cellsSort.push(index);
    _cellsFile[index.toString()] = {
      width: item.width * _width,
      height: item.height * _height,
      x: item.x * _width,
      y: item.y * _height,
      img: item.img ? item.img : "",
    };
  });
  cellsFile.value = _cellsFile;
  cellsSort.value = _cellsSort;
};

const handleMove = function (event: dragEvent) {
  // emit("update:value", [...fileList.value]);
  const cellsData = cellsSort.value.map((e: number) => {
    return cellsFile.value[e.toString()];
  });
  cellsFile.value = cellsData;
};

const handleDel = function (item: {}) {
  console.log(item);
};

const cellClick = function (index: number) {
  selectIndex.value = index;
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
      border: 2px dashed var(--color-C);
      overflow: hidden;
      box-sizing: border-box;
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
