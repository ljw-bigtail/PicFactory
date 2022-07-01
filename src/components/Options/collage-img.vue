<template>
  <div :class="['img-tool', visible ? 'active' : '']" @click="stopHandler">
    <div>
      <label>缩放</label>
      <Range ref="scaleRange" v-model:value="value.scale" @change="rangeChange" />
    </div>
    <Line type="vertical" />
    <div class="icon-group">
      <Icon type="flip-x" @click="emit('flipX', $event)"></Icon>
      <Icon type="flip-y" @click="emit('flipY')"></Icon>
    </div>
    <Line type="vertical" />
    <div class="icon-group">
      <Icon type="rotate" @click="emit('turnAnti')"></Icon>
      <Icon type="rotate-90" @click="emit('turn')"></Icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import Line from "../Line.vue";
import Range from "../Range.vue";
import Icon from "../Icon.vue";

type CanvasImgOption = {
  scale: number;
};

const props = defineProps<{ value: CanvasImgOption; visible: boolean }>();
const emit = defineEmits([
  "update:value",
  "change",
  "flipX",
  "flipY",
  "turnAnti",
  "turn",
]);

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

const formChange = function (value?: {}) {
  let _value = props.value;
  if (value) {
    _value = Object.assign(_value, value);
  }
  emit("update:value", _value);
  emit("change");
};

const scaleRange = ref();

const setScale = function (value: number) {
  scaleRange.value.setVal(value);
};

defineExpose({ setScale });

const rangeChange = function () {
  formChange();
};
</script>

<style lang="less" scoped>
.img-tool {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%) translateY(calc(100% + 10px));
  background-color: var(--color-white);
  box-shadow: var(--shadow-dark);
  border-radius: var(--radius-mini);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1_5);
  transition: all 0.3s;
  &.active {
    transform: translateX(-50%) translateY(0);
  }
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
    label {
      white-space: nowrap;
      font-size: 80%;
    }
  }
}
</style>
