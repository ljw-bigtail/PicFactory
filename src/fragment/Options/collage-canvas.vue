<template>
  <div class="form">
    <div>
      <span>尺寸：</span>
      <Size :value="sizeValue" @change="sizeChange"></Size>
    </div>
    <Line />
    <div>
      <span>底色：</span>
      <div>
        <input type="color" v-model="value.paddingColor" @change="formChange" />
      </div>
    </div>
    <div>
      <span>间距：</span>
      <Range v-model="value.margin" @change="rangeChange" />
    </div>
    <div>
      <span>边距：</span>
      <Range v-model="value.padding" @change="rangeChange" />
    </div>
    <div>
      <span>圆角：</span>
      <Range v-model="value.radius" @change="rangeChange" />
    </div>
    <Line />
    <div>
      <span>移图方式：</span>
      <input type="radio" name="rule" :value="1" v-model="value.rule" @change="formChange" />
      清理
      <input type="radio" name="rule" :value="2" v-model="value.rule" @change="formChange" />
      交换
    </div>
    <Line />
    <div>
      <span
        >占位图：<i
          :style="{
            fontStyle: 'normal',
            opacity: 0.5,
            fontSize: '12px',
            position: 'absolute',
            transform: 'translate(-120%, 150%)',
          }"
          >不渲染</i
        ></span
      >
      <div>
        <input type="color" v-model="value.background" @change="formChange" />
        <span>背景</span>
        <input type="color" v-model="value.dashedColor" @change="formChange" />
        <span>边框[20%透明]</span>
      </div>
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
import { Line, Range } from "@/components/index";

import { templateArr, DefaultCanvasFactoryOptions } from "@/utils/CanvasFactory";

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
  background: string;
  paddingColor: string;
  dashedColor: string;
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
    width:
      templateArr[index].default?.width ||
      sizeValue.value.width ||
      DefaultCanvasFactoryOptions.width,
    height:
      templateArr[index].default?.height ||
      sizeValue.value.height ||
      DefaultCanvasFactoryOptions.height,
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
