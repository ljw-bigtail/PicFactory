<template>
  <div class="frame-editor" @drop="dropAdd" @dragover="stopHandler">
    <draggable class="frame-editor-box" v-model="imgs" item-key="id" @change="handleFileChange">
      <template #item="{ element, index }">
        <PicItem :element="element" :index="index" @itemTools="handleBtnClick" @clear="handleDel" />
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import draggable from "vuedraggable";

import { dropFileType, Frame } from "@/type/video";
import PicItem from "./item.vue";

const imgs = ref([] as Frame[]);
let imgCache: dropFileType[] | null = null;

const getFrames = function () {
  return imgs.value.map((e) => ({ ...e }));
};

// 图库挪入 start
const setDropCache = function (data: dropFileType[]) {
  // 外部调用： 缓存挪入的图片数据
  if (!data || data.length === 0) {
    throw new Error("拖入文件数据异常");
  }
  // 拖入的图片 设置缓存
  updateImgCache(data);
};

const updateImgCache = (data: dropFileType[]) => {
  imgCache = data;
};

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

const dropAdd = (e: DragEvent) => {
  stopHandler(e);
  if (!imgCache) return;
  const imgsIds = imgs.value.map((e) => e.id);
  const _imgCache = imgCache.filter((e) => {
    return !imgsIds.includes(e.id);
  });
  if (_imgCache.length == 0) return;
  imgs.value = [
    ...imgs.value,
    ..._imgCache.map((e) => {
      return {
        ...e,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
      };
    }),
  ];
};
// 图库挪入 end

defineExpose({ getFrames, setDropCache });

const handleFileChange = () => {
  console.log("修改顺序");
};
const handleDel = (id: string) => {
  imgs.value = imgs.value.filter((e) => e.id !== id);
};
const handleBtnClick = (index: number, type: "flipX" | "flipY" | "turnAnti" | "turn") => {
  switch (type) {
    case "flipX":
      flipXHandler(index);
      break;
    case "flipY":
      flipYHandler(index);
      break;
    case "turnAnti":
      turnAntiHandler(index);
      break;
    case "turn":
      turnHandler(index);
      break;
  }
};

const flipXHandler = function (index: number) {
  imgs.value[index].rotateY = imgs.value[index].rotateY == 0 ? 180 : 0;
};

const flipYHandler = function (index: number) {
  imgs.value[index].rotateX = imgs.value[index].rotateX == 0 ? 180 : 0;
};

const turnAntiHandler = function (index: number) {
  imgs.value[index].rotateZ -= 90;
};

const turnHandler = function (index: number) {
  imgs.value[index].rotateZ += 90;
};
</script>

<style lang="less" scoped>
.frame-editor {
  flex: 1;
  .frame-editor-box {
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
