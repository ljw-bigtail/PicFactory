<template>
  <div :class="['img-tool', visible ? 'active' : '']" @click="stopHandler">
    <div>
      <label>透明度</label>
      <Range ref="opacityRange" v-model="value.opacity" @change="rangeChange" />
    </div>
    <Line type="vertical" />
    <Icon type="reverse-color" @click="emit('reverse')"/>
    <Line type="vertical" />
    <div class="icon-group">
      <Icon type="flip-x" @click="emit('flipX', $event)"></Icon>
      <Icon type="flip-y" @click="emit('flipY')"></Icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import { Line, Range, Icon } from "@/components/index";

type CanvasImgOption = {
  opacity: number;
};

const props = defineProps<{ value: CanvasImgOption; visible: boolean }>();
const emit = defineEmits(["update:value", "change", "flipX", "flipY", "reverse"]);

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

const opacityRange = ref();

const setOpacity = function (value: number) {
  opacityRange.value.setVal(value);
};

defineExpose({ setOpacity });

const rangeChange = function () {
  formChange();
};
</script>

<style lang="less" scoped>
@import url("./collage-float-opt.less");
</style>
