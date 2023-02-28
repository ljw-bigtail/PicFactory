<template>
  <div :class="['img-tool', visible ? 'active' : '']" @click="stopHandler">
    <div>
      <label>缩放</label>
      <Range ref="scaleRange" v-model="value.scale" @change="formChange" />
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
  scale: number;
  rotateZ: number;
};

const props = defineProps<{ value: Option; visible: boolean }>();
const emit = defineEmits(["update:value", "change"]);

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

const formChange = function () {
  emit("update:value", props.value);
  emit("change");
};

const scaleRange = ref();
const rotateRange = ref();
const setVal = function () {
  var value = arguments[0];
  scaleRange.value.setVal(value.scale);
  rotateRange.value.setVal(value.rotateZ / 360);
  emit("update:value", value);
};

defineExpose({ setVal });
</script>

<style lang="less" scoped>
@import url("./collage-float-opt.less");
</style>
