<template>
  <div :class="['layout', openFooter ? 'open-footer' : '']">
    <div class="header">
      <slot name="header"></slot>
      <button class="button" @click="toggleFooter">
        {{ openFooter ? "关闭" : "打开" }}日志
      </button>
    </div>
    <div class="main flex-box">
      <slot name="main"></slot>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Cache } from "../utils/utils";

const cacheKey = "open-footer";
const openFooter = ref(!!Cache.get(cacheKey));
const toggleFooter = function () {
  openFooter.value = !openFooter.value;
  Cache.set(cacheKey, openFooter.value);
};
</script>

<style lang="less">
@import "../style/common.less";

.layout {
  & > .header {
    height: var(--header-height);
    box-shadow: var(--shadow);
    font-size: var(--title-size);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-1);
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    background-color: #fff;
    z-index: 2000;
  }
  & > .main {
    margin-top: calc(var(--header-height) + var(--space-1) * 2);
    height: calc(100vh - var(--header-height) - var(--space-1) * 2);
    background-color: #fff;
  }
  & > .footer {
    box-shadow: var(--shadow);
    display: none;
    height: calc(var(--header-height) * 2);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--space-1);
    background-color: #fff;
    z-index: 2000;
  }
  &.open-footer {
    & > .main {
      margin-bottom: calc(var(--header-height) * 2 + var(--space-1) * 2);
      height: calc(100vh - var(--header-height) * 3 - var(--space-1) * 4);
    }
    & > .footer {
      display: block;
    }
  }
}
</style>
