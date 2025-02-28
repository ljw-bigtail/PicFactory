<template>
  <div class="canvas-editor__box" @click="clearSelectHandler">
    <div
      id="canvas-editor__canvas"
      class="canvas-editor__element"
      :style="{
        width,
        height,
        padding,
        background: paddingColor,
      }"
      @mousemove="fragmentMove"
    >
      <div
        class="canvas-editor__element__cell"
        v-for="(element, index) in cellsImg"
        :key="`${element.id}_${index}}`"
        :class="[dropStatus && inDrag != '' && inDrag === index.toString() ? 'drop-in' : '']"
        :style="{
          height: cellsList[index].height + 'px',
          width: cellsList[index].width + 'px',
          top: cellsList[index].y + 'px',
          left: cellsList[index].x + 'px',
          borderRadius: cellsList[index].radius + 'px',
          borderWidth: element.src && element.src != '' ? '0px' : '2px',
          borderColor: `${dashedColor}33`,
          background,
        }"
        @drop="dropAdd($event, index)"
        @dragover="dragEnter($event, index)"
        @dragleave="dragLeave"
      >
        <div class="canvas-editor__element__cell__box">
          <img
            v-show="element.src != ''"
            :src="element.src"
            @click="imgSelectHandler($event, index)"
            @mousedown="imgMoveStart($event, index)"
            @mouseup="moveStop"
            @mousemove="imgMove($event, index)"
            @mouseleave="moveStop"
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
      <div class="canvas-editor__element__fragment">
        <!-- 贴纸 -->
        <div
          class="canvas-editor__element__fragment__box"
          v-for="(element, index) in fragmentList"
          :key="`fragment_${index}}`"
          :style="{
            top: element.y + 'px',
            left: element.x + 'px',
          }"
          @click="selectFragmentHandler($event, index)"
          @mousedown="fragmentMoveStart($event, index)"
          @mousemove="fragmentBtnMove(index, $event)"
          @mouseup="mouseEventStop(index, $event)"
          @mouseleave="mouseEventStop(index, $event)"
        >
          <div
            v-if="element.type == 'img'"
            :style="{
              height: element.height * element.scale + 'px',
              width: element.width * element.scale + 'px',
              position: 'relative',
              opacity: element.opacity,
              transform: `rotateX(${element.rotateX}deg) rotateY(${element.rotateY}deg) rotateZ(${element.rotateZ}deg)`,
            }"
          >
            <span class="rotate icon-size" @mousedown.prevent="rotateStart(index, $event)">
              <Icon class="icon-size-img" type="rotate-left"></Icon>
            </span>
            <span class="resize icon-size" @mousedown.prevent="resizeStart(index, $event)">
              <Icon class="icon-size-img" type="enlarge"></Icon>
            </span>
            <span class="css-icon delete bold" @click="handleFragmentDel(index)"></span>
            <img :src="element.value" :ref="'fragment_img_' + index" />
          </div>
          <div
            class="canvas-editor__element__fragment__box__text"
            v-else-if="element.type == 'text'"
            :data-id="element.id"
          >
            <span
              class="words"
              :style="{
                transform: `rotateZ(${element.rotateZ}deg)`,
                color: `${element.color}`,
                fontSize: `${Math.floor(element.size * (80 - 12)) + 12}px`,
              }"
            >
              <pre>{{ element.value }}</pre>
            </span>
            <span class="css-icon delete bold" @click="handleFragmentDel(index)"></span>
          </div>
        </div>
      </div>
    </div>
    <CollageImgOption
      ref="collageImgOption"
      v-model:value="collageImgForm"
      :visible="!!(selectStickerIndex == -1 && selectImgIndex > -1)"
      @change="scaleHandler"
      @flipX="flipXHandler"
      @flipY="flipYHandler"
      @turnAnti="turnAntiHandler"
      @turn="turnHandler"
    />
    <CollageTextOption
      ref="collageTextOption"
      v-model:value="collageTextForm"
      :visible="
        !!(
          selectStickerIndex > -1 &&
          fragmentList[selectStickerIndex] &&
          fragmentList[selectStickerIndex].type == 'text'
        )
      "
      @change="textChangeHandler"
    />
    <CollageStickerOption
      ref="collageStickerOption"
      v-model:value="collageStickerForm"
      :visible="!!(selectImgIndex == -1 && selectStickerIndex > -1)"
      @change="scaleStickerHandler"
      @flipX="flipXStickerHandler"
      @flipY="flipYStickerHandler"
      @reverse="reverseStickerHandler"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { Icon } from "@/components/index";
import { colorReverse } from "@/utils/utils";

import CollageImgOption from "./Options/collage-img.vue";
import CollageTextOption from "./Options/collage-text.vue";
import CollageStickerOption from "./Options/collage-sticker.vue";

import {
  DefaultCanvasFactoryOptions,
  DefaultCanvasImgOptions,
  DefaultCanvasStickerOptions,
  DefaultCanvasTextOptions,
  DefaultCellOptions,
  templateArr,
} from "../utils/CanvasFactory";

type CanvasOption = {
  width: number;
  height: number;
  padding: number;
  margin: number;
  radius: number;
  template: number;
  rule: number;
  background: string;
  paddingColor: string;
  dashedColor: string;
};

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

type fragmentProps = {
  type: "text" | "img";
  value: string;
  id: string;
  width: number;
  height: number;
};

type TypeObject = {
  [key: string]: any;
};

type Props = {
  options?: CanvasOption;
  fragment?: fragmentProps[];
};

const props = withDefaults(defineProps<Props>(), {
  options: () => {
    return { ...DefaultCanvasFactoryOptions };
  },
  fragment: () => [],
});

const width = ref("");
const height = ref("");
const scale = ref(1);
const padding = ref("");
const background = ref("");
const paddingColor = ref("");
const dashedColor = ref("");

const cellsList = ref();
const cellsImg = ref();
const fragmentList = ref([] as any[]);

const inDrag = ref(""); // 挪入的cell index

let imgCache: FileOption | null = null;
let clearIndexForImg: string = "";

// 缓存挪动对象数据
let dragCache = {
  position: {
    x: 0, // 鼠标指针位置缓存x
    y: 0, // 鼠标指针位置缓存y
  },
  index: -1, // 需要移动的对象index， -1为不选中
  type: "", // img fragment
};

watch(props.options, function () {
  // 刷新配置属性
  resize();
  initCells();
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
  const {
    width: size_width,
    height: size_height,
    background: _background,
    paddingColor: _paddingColor,
    dashedColor: _dashedColor,
  } = props.options;
  const { scale_width, scale_height } = {
    scale_width: Math.max(
      parseFloat((size_width / (dom.clientWidth - config.min_box_padding * 2)).toFixed(2)),
      1
    ),
    scale_height: Math.max(
      parseFloat((size_height / (dom.clientHeight - config.min_box_padding * 2)).toFixed(2)),
      1
    ),
  };
  scale.value = Math.max(scale_width, scale_height);
  width.value = (size_width / scale.value).toFixed(0) + "px";
  height.value = (size_height / scale.value).toFixed(0) + "px";
  background.value = _background;
  paddingColor.value = _paddingColor;
  dashedColor.value = _dashedColor;
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
  cellsImg.value = Object.keys(_cellsList)
    .map(function (e, index) {
      if (
        cellsImg.value &&
        cellsImg.value[index] &&
        Object.keys(cellsImg.value[index]).length > 0
      ) {
        return updateImgCache(cellsImg.value[index], index.toString());
      }
      return {};
    })
    .filter((e) => e);
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

const moveStop = function () {
  dragCache.index = -1;
  dragCache.type = "";
};

/**
 * 返回编辑器参数 用来解析生成canvas
 */
const getImageParameters = function () {
  const {
    width,
    height,
    padding: canvasPadding,
    paddingColor: canvasBackgroundColor,
    background: blockBackgroundColor,
    dashedColor: blockBorderColor,
    radius: canvasRadius,
    margin: blockSpace,
  } = props.options;
  const canvasScale = scale.value,
    canvasWidth = width / canvasScale,
    canvasHeight = height / canvasScale;
  const data = {
    canvasWidth,
    canvasHeight,
    canvasScale,
    canvasPadding,
    canvasBackgroundColor,
    blocks: Object.keys(cellsList.value).map((index) => {
      const {
        width: blockWidth,
        height: blockHeight,
        x: blockPositionX,
        y: blockPositionY,
      } = cellsList.value[index];

      const blockRadius = (canvasRadius * Math.min(blockWidth, blockHeight)) / 2;
      const {
        src: blockImg,
        width: blockImgWidth,
        height: blockImgHeight,
        x: blockImgPositionX,
        y: blockImgPositionY,
        scale: blockImgScale,
        rotateX: blockImgRotateX,
        rotateY: blockImgRotateY,
        rotateZ: blockImgRotateZ,
      } = cellsImg.value[index];
      return {
        blockWidth,
        blockHeight,
        blockPositionX,
        blockPositionY,
        blockBackgroundColor,
        blockBorderColor,
        blockRadius,
        blockSpace,
        blockImg,
        blockImgWidth,
        blockImgHeight,
        blockImgPositionX,
        blockImgPositionY,
        blockImgScale,
        blockImgRotateX,
        blockImgRotateY,
        blockImgRotateZ,
      };
    }),
    fragmentTexts: [...fragmentList.value]
      .filter((item) => item.type === "text")
      .map((item) => {
        const { size, color, x, y, rotateZ, value, width, height } = item;
        return {
          fontSize: Math.floor(size * (80 - 12)) + 12,
          color,
          text: value,
          x,
          y,
          rotateZ,
          width,
          height,
        };
      }),
    fragmentImgs: [...fragmentList.value]
      .filter((item) => item.type === "img")
      .map((item) => {
        const { width, height, x, y, rotateZ, value, scale } = item;
        return { width, height, x, y, rotateZ, src: value, scale };
      }),
  };
  return data;
};

// 图库挪入 start
const dropStatus = ref(false); // 是否开启drop
const setDropCache = function (data: FileOption) {
  // 外部调用： 缓存挪入的图片数据
  // if (!data || !data.id || !data.file || !data.src) {
  //   throw new Error("拖入文件数据异常");
  // }
  dropStatus.value = !!(data && data.id && data.file && data.src);
  // 拖入的图片 设置缓存
  updateImgCache({ ...data });
  clearIndexForImg = "";
};

const dragLeave = function (e: DragEvent) {
  stopHandler(e);
  inDrag.value = "";
};

const dropAdd = function (e: DragEvent, index: number) {
  stopHandler(e);
  if (dragCache.type != "") return;
  const _index = index.toString();
  if (_index == "" || clearIndexForImg == _index) return;
  if (!imgCache?.src) return;
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
  if (dragCache.type != "") return;
  const _index = index.toString();
  updateImgCache({ ...cellsImg.value[_index] }, _index);
  clearIndexForImg = _index.toString();
};

const dragEnter = function (e: DragEvent, index: number) {
  stopHandler(e);
  if (dragCache.type != "") return;
  if (inDrag.value == index.toString()) return;
  inDrag.value = index.toString();
};
// 图库挪入 end

// 添加贴纸 start
const addFragment = function (_data: fragmentProps | fragmentProps[]) {
  const datas: fragmentProps[] = Array.isArray(_data) ? _data : [_data];
  const position = 20;
  fragmentList.value = fragmentList.value.concat(
    datas.map((data, index) => {
      return {
        // 文字用
        size: DefaultCanvasTextOptions.size,
        color: DefaultCanvasTextOptions.color,
        // 图片用
        width: data.width ?? DefaultCanvasStickerOptions.width,
        height: data.height ?? DefaultCanvasStickerOptions.height,
        scale: DefaultCanvasStickerOptions.scale, // 缩放 0% ～ 100%
        opacity: DefaultCanvasStickerOptions.opacity, // 透明度 0-1
        rotateY: 0, // Y轴对称
        rotateX: 0, // X轴对称
        // public
        x: position * index, // 定位 x
        y: position * index, // 定位 y
        rotateZ: 0, // 中心旋转
        value: data.value,
        id: data.id,
        type: data.type,
      };
    })
  );
  nextTick(function () {
    // 获取文字贴纸宽高 用来计算旋转中心
    const canvas_dom = document.querySelector("#canvas-editor__canvas");
    if (!canvas_dom) return;
    fragmentList.value.map((e) => {
      if (e.type === "text") {
        const { offsetWidth, offsetHeight } = canvas_dom.querySelector(
          `.canvas-editor__element__fragment__box__text[data-id="${e.id}"]`
        ) as HTMLElement;
        e.width = offsetWidth;
        e.height = offsetHeight;
        return e;
      }
      return e;
    });
  });
};
// 添加贴纸 end
defineExpose({ setDropCache, addFragment, getImageParameters });

// 图片内部挪动 start
const imgMoveStart = function (e: MouseEvent, index: number) {
  selectStickerIndex.value = -1;
  dragStart(index);
  // 缓存：记录当前的position 拖拽进其他cell
  // 移动起点
  dragCache = {
    position: {
      x: e.clientX - (e.target as HTMLElement).offsetLeft,
      y: e.clientY - (e.target as HTMLElement).offsetTop,
    },
    index,
    type: "img",
  };
};

const imgMove = function (e: MouseEvent, index: number) {
  e.preventDefault();
  if (dragCache.type !== "img" || dragCache.index == -1) return;
  if (dragCache.index !== index) return;
  function getSize(type: "x" | "y") {
    function getMax() {
      const { rotateZ, width, height, scale } = cellsImg.value[index];
      const direction = rotateZ % 180 == 0 ? "vertical" : "horizontal";
      // TODO 缺少旋转后的位移限制切换
      // if ((type == "x" && direction == "vertical") || (type == "y" && direction == "horizontal")) {
      if (type == "x") {
        return width * scale - cellsList.value[index].width;
      }
      // if ((type == "y" && direction == "vertical") || (type == "x" && direction == "horizontal")) {
      if (type == "y") {
        return height * scale - cellsList.value[index].height;
      }
      throw Error("getSize error");
    }
    function getValByMax(len: number) {
      // 边界值
      const max_len = getMax();
      // 根据边距修改值
      if (len > 0) {
        return 0;
      } else if (len < -max_len) {
        return -max_len;
      } else {
        return len;
      }
    }
    if (type == "x") {
      return e.clientX != dragCache.position.x
        ? (function () {
            const disX = e.clientX - (e.target as HTMLElement).offsetLeft; // 鼠标位移距离
            const len = cellsImg.value[index].x - dragCache.position.x + disX; // 图片位移距离
            return getValByMax(len);
          })()
        : 0;
    }
    if (type == "y") {
      return e.clientY != dragCache.position.y
        ? (function () {
            const disY = e.clientY - (e.target as HTMLElement).offsetTop; // 鼠标位移距离
            const len = cellsImg.value[index].y - dragCache.position.y + disY; // 图片位移距离
            return getValByMax(len);
          })()
        : 0;
    }
  }
  cellsImg.value[index].x = getSize("x");
  cellsImg.value[index].y = getSize("y");
  // 因为图片较大，所以这里不需要缓存新的鼠标位置
};
// 图片内部挪动 end

let mouseEventType = -1; // move 0 resize 1 rotate 2
// 碎片挪动 start
const collageTextOption = ref();
const fragmentMoveStart = function (e: MouseEvent, index: number) {
  stopHandler(e);
  if (mouseEventType > 0) return;
  // 初始化移动起点
  mouseEventType = 0;
  dragCache = {
    position: {
      x: e.clientX,
      y: e.clientY,
    },
    index,
    type: "fragment",
  };
  // 更新浮窗工具
  const fragment_data = { ...fragmentList.value[index] };
  switch (fragment_data.type) {
    case "text":
      collageTextOption.value.setVal({
        rotateZ: fragment_data.rotateZ,
        size: fragment_data.size,
        color: fragment_data.color,
      });
      break;
  }
};

const getRegion = function (num: number, range: [number, number]) {
  // 超出区域取区域边界
  let _num: number;
  if (num <= range[0]) {
    _num = range[0];
  } else if (num >= range[1]) {
    _num = range[1];
  } else {
    _num = num;
  }
  return _num;
};

const fragmentMove = function (e: MouseEvent) {
  // 贴纸拖拽
  if (dragCache.type != "fragment" || dragCache.index == -1) return;
  stopHandler(e);
  // 刷新位置
  const [x, y] = [
    fragmentList.value[dragCache.index].x + e.clientX - dragCache.position.x,
    fragmentList.value[dragCache.index].y + e.clientY - dragCache.position.y,
  ];
  fragmentList.value[dragCache.index].x = getRegion(x, [
    0,
    parseInt(width.value) - fragmentList.value[dragCache.index].width,
  ]);
  fragmentList.value[dragCache.index].y = getRegion(y, [
    0,
    parseInt(height.value) - fragmentList.value[dragCache.index].height,
  ]);
  // 缓存
  dragCache.position = {
    x: e.clientX,
    y: e.clientY,
  };
};

const mouseEventStop = (index: number, event: MouseEvent) => {
  switch (mouseEventType) {
    case 0:
      moveStop();
      break;
    case 1:
    case 2:
      stickerPositionCache = {
        clientX: 0,
        clientY: 0,
      };
      break;
  }
  mouseEventType = -1;
};

const fragmentBtnMove = function (index: number, event: MouseEvent) {
  switch (mouseEventType) {
    // case 0:
    //   break;
    case 1:
      resizeMove(index, event);
      break;
    case 2:
      rotateMove(index, event);
      break;
  }
};
// 碎片挪动 end

// 图片编辑 start
const collageImgOption = ref();
const collageImgForm = ref({ ...DefaultCanvasImgOptions });
const selectImgIndex = ref(-1);

const imgSelectHandler = function (e: Event, index: number) {
  stopHandler(e);
  selectImgIndex.value = index;
  collageImgOption.value.setScale(cellsImg.value[index].scale - 1);
};

const clearSelectHandler = function (e: Event) {
  e.stopPropagation();
  selectImgIndex.value = -1;
  selectStickerIndex.value = -1;
};

const scaleHandler = function () {
  if (selectImgIndex.value == -1) return;
  cellsImg.value[selectImgIndex.value].scale = collageImgForm.value.scale + 1;
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
  let rotateZ = (cellsImg.value[selectImgIndex.value].rotateZ - 90) % 360;
  if (rotateZ < 0) {
    rotateZ += 360;
  }
  cellsImg.value[selectImgIndex.value].rotateZ = rotateZ;
};

const turnHandler = function () {
  let rotateZ = (cellsImg.value[selectImgIndex.value].rotateZ + 90) % 360;
  if (rotateZ < 0) {
    rotateZ += 360;
  }
  cellsImg.value[selectImgIndex.value].rotateZ = rotateZ;
};
// 图片编辑end

// 贴纸-编辑 start
// 清除贴纸
const handleFragmentDel = function (index: number) {
  fragmentList.value.splice(index, 1);
  selectStickerIndex.value = -1;
};

// 碎片编辑 start
const selectStickerIndex = ref(-1);
const selectFragmentHandler = function (e: Event, index: number) {
  stopHandler(e);
  selectStickerIndex.value = index;
};

const collageStickerOption = ref();
const collageStickerForm = ref({ 
  opacity: 1
 });

const scaleStickerHandler = function () {
  console.log(selectStickerIndex.value, collageStickerForm.value.opacity);
  
  if (selectStickerIndex.value == -1) return;
  fragmentList.value[selectStickerIndex.value].opacity = collageStickerForm.value.opacity;
};

const flipXStickerHandler = function () {
  if (selectStickerIndex.value == -1) return;
  fragmentList.value[selectStickerIndex.value].rotateY =
  fragmentList.value[selectStickerIndex.value].rotateY == 0 ? 180 : 0;
};

const flipYStickerHandler = function () {
  if (selectStickerIndex.value == -1) return;
  fragmentList.value[selectStickerIndex.value].rotateX =
  fragmentList.value[selectStickerIndex.value].rotateX == 0 ? 180 : 0;
};
const reverseStickerHandler = async function(){
  if (selectStickerIndex.value == -1) return;
  fragmentList.value[selectStickerIndex.value].value = await colorReverse(fragmentList.value[selectStickerIndex.value].value)
}

// 贴纸图片 拖拽大小 start
let stickerPositionCache = {
  clientX: 0,
  clientY: 0,
};
const resizeStart = function (index: number, event: MouseEvent) {
  mouseEventType = 1;
  const { clientX, clientY } = event;
  stickerPositionCache = {
    clientX,
    clientY,
  };
};
const resizeMove = function (index: number, event: MouseEvent) {
  if (stickerPositionCache.clientX == 0 || stickerPositionCache.clientY == 0) {
    return;
  }
  const size_range: [number, number] = [20, parseInt(width.value) * 0.8];
  const { clientX, clientY } = event;
  let base = clientX - stickerPositionCache.clientX;
  const check_width = getRegion(fragmentList.value[index].width + base, size_range);
  // const check_height = fragmentList.value[index].height + base;
  const aspectRatio = fragmentList.value[index].height / fragmentList.value[index].width;
  if (fragmentList.value[index].width == check_width) {
    return;
  }
  fragmentList.value[index].width = check_width;
  fragmentList.value[index].height = check_width * aspectRatio;
  stickerPositionCache = {
    clientX,
    clientY,
  };
};
// 贴纸图片 拖拽大小 end

// 贴纸图片 拖拽旋转 start
type Point = {
  x: number;
  y: number;
};
const rotateStart = function (index: number, event: MouseEvent) {
  mouseEventType = 2;
  const { clientX, clientY } = event;
  stickerPositionCache = {
    clientX,
    clientY,
  };
};
const rotateMove = function (index: number, event: MouseEvent) {
  if (stickerPositionCache.clientX == 0 || stickerPositionCache.clientY == 0) {
    return;
  }
  const { clientX, clientY } = event;
  const angle = (start: Point, end: Point) => {
    // 根据两点坐标 求夹角度数
    var diff_x = end.x - start.x,
      diff_y = end.y - start.y;
    if (diff_x == 0) return 0;
    return (360 * Math.atan(diff_y / diff_x)) / (2 * Math.PI);
  };
  // 获取原点 => 图片中心对于屏幕位置
  const img_rect_data = (document.querySelector(
    `#canvas-editor__canvas > div.canvas-editor__element__fragment > div:nth-child(${
      index + 1
    }) > div > img`
  ) as HTMLElement).getBoundingClientRect();
  const zero_point = {
    x: img_rect_data.x + img_rect_data.width / 2,
    y: img_rect_data.y + img_rect_data.height / 2,
  };
  const deg =
    angle(zero_point, {
      x: stickerPositionCache.clientX,
      y: stickerPositionCache.clientY,
    }) -
    angle(zero_point, {
      x: clientX,
      y: clientY,
    });
  fragmentList.value[index].rotateZ -= deg;
  stickerPositionCache = {
    clientX,
    clientY,
  };
};
// 贴纸图片 拖拽旋转 end
// 贴纸-编辑 end

// 碎片-文本
const collageTextForm = ref({
  ...DefaultCanvasTextOptions,
  rotateZ: 0,
});
const textChangeHandler = function () {
  if (selectStickerIndex.value == -1 || !fragmentList.value[selectStickerIndex.value]) return;
  fragmentList.value[selectStickerIndex.value].rotateZ = collageTextForm.value.rotateZ * 360;
  fragmentList.value[selectStickerIndex.value].size = collageTextForm.value.size;
  fragmentList.value[selectStickerIndex.value].color = collageTextForm.value.color;
};
// 碎片编辑 end
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
        cursor: pointer;
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
    &__fragment {
      &__box {
        position: absolute;
        cursor: pointer;
        &__text .words {
          border-radius: var(--radius-mini);
          transition: background 0.3s;
          display: block;
          text-align: left;
          &:hover {
            backdrop-filter: blur(4px);
            background-color: rgba(255, 255, 255, 0.6);
          }
        }
        img {
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
        }
        span:not(.words) {
          opacity: 0;
          visibility: hidden;
          transition: 0.5s all;
        }
        &:hover span {
          opacity: 1;
          visibility: visible;
        }
        .delete {
          position: absolute;
          right: 0;
          top: 0;
          transform: rotateZ(45deg) translate(0, -60%);
          z-index: 2;
        }
        .resize {
          position: absolute;
          right: 0;
          bottom: 0;
          transform: rotateZ(270deg) translate(-60%, 60%);
          z-index: 2;
        }
        .rotate {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 300%;
          height: 300%;
          .icon-size-img {
            position: absolute;
            transform: translate(0, -50%) rotate(45deg);
            top: 50%;
            cursor: grabbing;
            z-index: 10;
            left: 68%;
          }
        }
        .icon-size {
          .icon-size-img {
            width: 26px;
            height: 26px;
            overflow: hidden;
            filter: drop-shadow(0px 0px 2px #aaa);
          }
        }
      }
    }
  }
}
</style>
