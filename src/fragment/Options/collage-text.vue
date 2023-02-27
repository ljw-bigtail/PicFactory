<template>
  <div :class="['img-tool', visible ? 'active' : '']" @click="stopHandler">
    <div>
      <label>颜色</label>
      <input type="color" v-model="value.color" @change="formChange" />
    </div>
    <Line type="vertical" />
    <div>
      <label>字号</label>
      <Range ref="sizeRange" v-model="value.size" @change="formChange" />
    </div>
    <Line type="vertical" />
    <div>
      <label>旋转</label>
      <Range ref="rotateRange" v-model="value.rotateZ" @change="formChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Line, Range } from "@/components/index";

type Option = {
  rotateZ: number;
  size: number;
  color: string;
};

const props = defineProps<{ value: Option; visible: boolean }>();
const emit = defineEmits(["update:value", "change"]);

const stopHandler = function (e: Event) {
  e.stopPropagation();
};

const formChange = function (value?: {}) {
  let _value = props.value;
  if (value) {
    _value = Object.assign(_value, value);
  }
  emit("update:value", _value);
  emit("change");
};

const color = ref();
const sizeRange = ref();
const rotateRange = ref();
const setVal = function () {
  var value = arguments[0];
  color.value.setVal(value.color);
  sizeRange.value.setVal(value.size);
  rotateRange.value.setVal(value.rotateZ / 360);
  emit("update:value", value);
};

defineExpose({ setVal });
</script>

<style lang="less" scoped>
@import url("./collage-float-opt.less");
</style>
