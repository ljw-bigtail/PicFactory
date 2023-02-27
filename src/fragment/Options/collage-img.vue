<template>
  <div :class="['img-tool', visible ? 'active' : '']" @click="stopHandler">
    <div>
      <label>缩放</label>
      <Range ref="scaleRange" v-model="value.scale" @change="rangeChange" />
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

import { Line, Range, Icon } from "@/components/index";

type CanvasImgOption = {
  scale: number;
};

const props = defineProps<{ value: CanvasImgOption; visible: boolean }>();
const emit = defineEmits(["update:value", "change", "flipX", "flipY", "turnAnti", "turn"]);

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
@import url("./collage-float-opt.less");
</style>
