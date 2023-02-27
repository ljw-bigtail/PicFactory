<template>
  <div class="form">
    <div>
      <span>宽 / 高：</span>
      <Size :value="sizeValue" @change="sizeChange"></Size>
    </div>
    <div>
      <span>质量：</span>
      <div>
        <Range ref="scaleRange" v-model="value.quality" @change="qualityChange" />
      </div>
    </div>
    <!-- <div>
      <span for="rule">截取规则：</span>
      <div>
        <select name="rule" v-model="value.rule" @change="formChange">
          <option value="1">放大</option>
          <option value="2">等比缩小</option>
          <option value="3">等比放大</option>
        </select>
      </div>
    </div> -->
    <Line />
    <div>
      <span for="background">背景色：</span>
      <div>
        <input type="color" name="background" v-model="value.background" @change="formChange" />
      </div>
    </div>
    <div>
      <span for="delay">停留时间：</span>
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
      <span for="repeat">重复次数：</span>
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
import { Line, Range } from "@/components/index";

type GIFOption = {
  width: number;
  height: number;
  repeat: number;
  delay: number;
  background: string;
  rule: number;
  quality: number;
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

const qualityChange = function () {
  formChange();
};
</script>

<style lang="less" scoped>
@import url(./form.less);
</style>
