<template>
  <div class="form">
    <div>
      <label>宽 / 高：</label>
      <Size :value="sizeValue" @change="sizeChange"></Size>
    </div>
    <div>
      <label for="rule">截取规则：</label>
      <div>
        <input
          type="radio"
          name="rule"
          :value="1"
          v-model="value.rule"
          @change="formChange"
        />
        放大
        <input
          type="radio"
          name="rule"
          :value="2"
          v-model="value.rule"
          @change="formChange"
        />
        等比缩小
        <input
          type="radio"
          name="rule"
          :value="3"
          v-model="value.rule"
          @change="formChange"
        />
        等比放大
      </div>
    </div>
    <Line />
    <div>
      <label for="background">背景色：</label>
      <div>
        <input
          type="color"
          name="background"
          v-model="value.background"
          @change="formChange"
        />
      </div>
    </div>
    <div>
      <label for="delay">停留时间：</label>
      <div>
        <input
          type="number"
          name="delay"
          min="0"
          placeholder="停留时间 毫秒"
          v-model="value.delay"
          @change="formChange"
        />
      </div>
    </div>
    <div>
      <label for="repeat">重复次数：</label>
      <div>
        <input
          type="number"
          name="repeat"
          min="-1"
          placeholder="-1 never 0 ever or number"
          v-model="value.repeat"
          @change="formChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import Size from "./Item/size.vue";
import Line from "../Line.vue";
type GIFOption = {
  width: number;
  height: number;
  repeat: number;
  delay: number;
  background: string;
  rule: number;
};

type SizeOption = {
  width: number;
  height: number;
};

const props = defineProps<{ value: GIFOption }>();
const emit = defineEmits(["update:value", "change"]);

const sizeValue = ref({
  width: props.value.width,
  height: props.value.height,
});

const formChange = function (value?: {}) {
  let _value = props.value;
  if (value) {
    _value = Object.assign(_value, value);
  }
  emit("update:value", _value);
  emit("change");
};

const sizeChange = function (value: SizeOption) {
  formChange(value);
};
</script>

<style lang="less" scoped>
@import url(./form.less);
</style>
