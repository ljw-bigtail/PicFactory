<template>
  <div class="range">
    <input
      type="range"
      name="background"
      v-model="num"
      @input="handleInput"
      @change="handleChange"
      :style="{ '--to': to }"
    />
    <span>{{ to }}</span>
    <span>%</span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
});
const num = ref((props.value * 100).toString());
const to = ref("0");
const emit = defineEmits(["update:value", "change"]);
const handleChange = function () {
  emit("update:value", parseInt(num.value) / 100);
  emit("change");
};

const handleInput = function () {
  to.value = num.value;
};
handleInput();
</script>

<style lang="less" scoped>
input[type="range"] {
  --from: 0;
  --range-thumb-size: 16px;
  --range-track-hegiht: 4px
  display: block;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0!important;
  outline: 0;
  background: none;
  width: -webkit-fill-available;
  width: fill-available;
  width: fill;
  &::-webkit-slider-runnable-track {
    // 轨道
    height: var(--range-track-hegiht);
    width: 100%;
    border-radius: var(--range-track-hegiht);
    background: linear-gradient(to right, var(--color-light-gray) calc(1% * var(--from, 0)), var(--main-color) calc(1% * var(--from, 0)) calc(1% * var(--to, 100)), var(--color-light-gray) 0%);
  }
  &::-webkit-slider-thumb {
    // 拖动块
    -webkit-appearance: none;
    appearance: none;
    pointer-events: auto;
    width: var(--range-thumb-size);
    height: var(--range-thumb-size);
    border-radius: 50%;
    background-color: #fff;
    box-shadow: 0 1px 3px 1px rgba(0, 0, 0, .25);
    transition: border-color .15s, background-color .15s;
    cursor: pointer;
    margin-top: calc((var(--range-thumb-size) - var(--range-track-hegiht)) * -1 + 1px);
    position: relative;
    top: 5px;
    &:hover {
      // background-color: var(--color-light-gray);
      box-shadow: 0 0 1px 1px rgba(0, 0, 0, .25);
    }
  }
}
.range{
  display: flex;
  align-items: center;
  margin: 0 var(--space-1);
  input{
    margin-right: var(--space-1);
  }
}
</style>
