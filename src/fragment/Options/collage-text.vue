<template>
  <div :class="['img-tool', visible ? 'active' : '']" @click="stopHandler">
    <div>
      <label>颜色</label>
      <input type="color" v-model="value.color" @change="formChange" />
    </div>
    <Line type="vertical" />
    <div>
      <label>字号</label>
      <Range ref="sizeRange" v-model:value="value.size" @change="formChange" />
    </div>
    <Line type="vertical" />
    <div>
      <label>旋转</label>
      <Range ref="rotateRange" v-model:value="value.rotateZ" @change="formChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Line from "../../components/Line.vue";
import Range from "../../components/Range.vue";

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
</script>

<style lang="less" scoped>
@import url("./collage-float-opt.less");
</style>
