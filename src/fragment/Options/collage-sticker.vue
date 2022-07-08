<template>
  <div :class="['img-tool', visible ? 'active' : '']" @click="stopHandler">
    <div>
      <label>缩放</label>
      <Range ref="scaleRange" v-model:value="value.scale" @change="formChange" />
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
  console.log(props.value);

  emit("update:value", props.value);
  emit("change");
};
</script>

<style lang="less" scoped>
@import url("./collage-float-opt.less");
</style>
