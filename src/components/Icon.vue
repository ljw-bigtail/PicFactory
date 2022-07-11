<template>
  <div :class="['icon', type]"></div>
</template>

<script lang="ts" setup>
const props = defineProps(["type"]);
</script>

<style lang="less" scoped>
.icon {
  display: inline-block;
  background: no-repeat 50% 50%;
  background-size: contain;
  height: 16px;
  width: 16px;
  vertical-align: middle;
  cursor: pointer;
  border: none;
  padding: 0;
  border-radius: 0;
  line-height: 16px;
  &.flip-x {
    background-image: url("../assets/icon/flip-x.svg");
  }
  &.flip-y {
    background-image: url("../assets/icon/flip-y.svg");
  }
  &.rotate,
  &.rotate-90 {
    background-image: url("../assets/icon/rotate.svg");
  }
  &.rotate {
    transform: translateY(-1px) translateX(1px);
  }
  &.rotate-90 {
    transform: rotateZ(90deg) translateY(-1px);
  }
  &.topping {
    background-image: url("../assets/icon/topping.svg");
  }
  &.import {
    background-image: url("../assets/icon/import.svg");
  }
}
</style>
