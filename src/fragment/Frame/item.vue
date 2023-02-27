<template>
  <div class="frame-editor-item">
    <div class="img">
      <img
        :src="element.src"
        :style="{
          transform: `rotateX(${element.rotateX}deg) rotateY(${element.rotateY}deg) rotateZ(${element.rotateZ}deg)`,
        }"
      />
      <span>第 {{ index + 1 }} 帧</span>
    </div>
    <div class="tools icon-group">
      <Icon type="flip-x" @click="flipXHandler"></Icon>
      <Icon type="clear" @click="handlerClear"></Icon>
      <!-- <Icon type="flip-y" @click="flipYHandler"></Icon>
      <Icon type="rotate" @click="turnAntiHandler"></Icon>
      <Icon type="rotate-90" @click="turnHandler"></Icon> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@/components/index";

const props = defineProps(["element", "index"]);
const emit = defineEmits(["itemTools", "clear"]);

const flipXHandler = () => {
  emit("itemTools", props.index, "flipX");
};
const flipYHandler = () => {
  emit("itemTools", props.index, "flipY");
};
const turnAntiHandler = () => {
  emit("itemTools", props.index, "turnAnti");
};
const turnHandler = () => {
  emit("itemTools", props.index, "turn");
};
const handlerClear = () => {
  emit("clear", props.element.id);
};
</script>

<style lang="less" scoped>
.frame-editor-item {
  overflow: hidden;
  padding: 1%;
  width: 20%;
  .img {
    position: relative;
    font-size: 0;
    img {
      width: 100%;
    }
    span {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      display: block;
      background-color: rgba(0, 0, 0, 0.2);
      font-size: var(--min-size);
      padding: calc(var(--space-1) / 2) 0;
      color: var(--color-white);
    }
  }
  .tools {
    padding-top: calc(var(--space-1) / 2);
  }
}
</style>
