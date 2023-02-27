<template>
  <div class="range">
    <input type="range" v-model="num" :step="1" @input="handleChange" :style="{ '--to': to }" />
    <span>{{ to }}%</span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

interface switchOpt {
  modelValue: number;
}

const props = withDefaults(defineProps<switchOpt>(), {
  modelValue: 0,
});

const num = ref((props.modelValue * 100).toFixed(2));
const to = ref(num.value);

const emit = defineEmits(["update:modelValue"]);

const handleChange = function () {
  // 刷新背景
  to.value = num.value;
  // 刷新结果
  emit("update:modelValue", (parseInt(num.value) / 100).toFixed(2));
};

handleChange();

const setVal = function () {
  num.value = (arguments[0] * 100).toFixed(2);
  handleChange();
};

defineExpose({ setVal });
</script>

<style lang="less" scoped>
input[type="range"] {
  --from: 0;
  --range-thumb-size: 16px;
  --range-track-hegiht: 6px;
  display: block;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
  padding: 0 !important;
  outline: 0;
  background: none;
  width: -webkit-fill-available;
  width: fill-available;
  width: fill;
  &::-webkit-slider-runnable-track {
    // 轨道
    height: var(--range-track-hegiht);
    border-radius: var(--range-track-hegiht);
    background: linear-gradient(
      to right,
      var(--color-light-gray) calc(1% * var(--from, 0)),
      var(--main-color) calc(1% * var(--from, 0)) calc(1% * var(--to, 100)),
      var(--color-light-gray) 0%
    );
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
    box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.25);
    transition: border-color 0.15s, background-color 0.15s;
    cursor: pointer;
    margin-top: calc((var(--range-thumb-size) - var(--range-track-hegiht)) * -1 + 1px);
    position: relative;
    top: 4px;
    &:hover {
      // background-color: var(--color-light-gray);
      box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.25);
    }
  }
}
.range {
  display: flex;
  align-items: center;
  margin: 0 0.8rem;
  input {
    margin-right: 0.8rem;
  }
  span {
    font-size: 80%;
    display: inline-block;
    width: 4em;
  }
}
</style>
