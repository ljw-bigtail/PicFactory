<template>
  <div class="form">
    <div>
      <label>尺寸：</label>
      <Size :value="sizeValue" @change="sizeChange"></Size>
    </div>
    <Line />
    <div>
      <label>间距：</label>
      <Range v-model:value="value.margin" @change="rangeChange" />
    </div>
    <div>
      <label>边框：</label>
      <Range v-model:value="value.padding" @change="rangeChange" />
    </div>
    <div>
      <label>圆角：</label>
      <Range v-model:value="value.radius" @change="rangeChange" />
    </div>
    <Line />
    <div>
      <label>移图方式：</label>
      <input
        type="radio"
        name="rule"
        :value="1"
        v-model="value.rule"
        @change="formChange"
      />
      清理
      <input
        type="radio"
        name="rule"
        :value="2"
        v-model="value.rule"
        @change="formChange"
      />
      交换
    </div>
    <Line />
    <div class="template-types">
      <ul>
        <li
          v-for="(item, index) in templateArr"
          @click="templateChange(index)"
          :class="[value.template == index ? 'selected' : '']"
        >
          <img :src="item.src" alt="" srcset="" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import Size from "./Item/size.vue";
import Line from "../Line.vue";
import Range from "../Range.vue";

import { templateArr } from "../../utils/CanvasFactory";

type SizeOption = {
  width: number;
  height: number;
};

type CanvasOption = {
  width: number;
  height: number;
  padding: number;
  margin: number;
  radius: number;
  template: number;
  rule: number;
};

const props = defineProps<{ value: CanvasOption }>();
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

const rangeChange = function () {
  formChange();
};

const sizeChange = function (value: SizeOption) {
  formChange(value);
};

const templateChange = function (index: number) {
  formChange({
    template: index,
  });
};
</script>

<style lang="less" scoped>
@import url(./form.less);
.template-types {
  ul {
    display: flex;
    flex-wrap: wrap;
    li {
      --img-border: calc(var(--space-1) * 0.4);
      width: 16.6%;
      box-sizing: border-box;
      padding: var(--img-border);
      position: relative;
      border-radius: var(--radius);
      overflow: hidden;
      font-size: 0;
      img {
        width: 100%;
      }
      &.selected::before,
      &:hover::before {
        cursor: pointer;
        content: "";
        position: absolute;
        box-sizing: border-box;
        left: var(--img-border);
        top: var(--img-border);
        right: var(--img-border);
        bottom: var(--img-border);
        background-color: var(--color-black);
        opacity: 0.1;
      }
      &.selected::before {
        opacity: 0.2;
      }
    }
  }
}
</style>
