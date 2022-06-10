<template>
  <div :class="['layout', openFooter ? 'open-footer' : '']">
    <div class="header">
      <div class="title">
        <slot name="header"></slot>
      </div>
      <div class="btn-group">
        <button class="button A" @click="clearFileListCache">清理数据</button>
        <button class="button" @click="toggleFooter">
          {{ openFooter ? "关闭" : "打开" }}日志
        </button>
      </div>
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

const emit = defineEmits(["clearFile"]);
const clearFileListCache = () => {
  emit("clearFile");
};

const cacheKey = "sys-opt-cache";
const openFooter = ref(Cache.get(cacheKey)["open-footer"]);
const toggleFooter = function () {
  openFooter.value = !openFooter.value;
  Cache.set(cacheKey, {
    "open-footer": openFooter.value,
  });
};
</script>

<style lang="less">
@import "../style/common.less";
.layout {
  position: relative;
  height: 100vh;
  &::-webkit-scrollbar {
    display: none;
  }
  &,
  & > * {
    max-width: var(--max-width);
    margin: 0 auto;
    width: 100%;
  }
  & > .header {
    height: var(--header-height);
    border-bottom: var(--border-main);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-1) 0;
    position: sticky;
    left: 0;
    top: 0;
    background-color: #fff;
    z-index: 2000;
    .title {
      display: flex;
      align-items: center;
      font-size: var(--title-size);
      font-weight: 700;
      &::before {
        content: "";
        display: inline-block;
        margin-right: var(--space-1);
        width: 52px;
        height: calc(var(--title-size) * 1.2);
        background-color: var(--color-black);
        border-top-left-radius: var(--title-size);
        border-bottom-left-radius: var(--title-size);
      }
    }
  }
  & > .main {
    margin-top: calc(var(--space-1) * 2);
    height: calc(100vh - var(--header-height) - var(--space-1) * 2);
    background-color: #fff;
  }
  & > .footer {
    box-shadow: var(--shadow);
    height: calc(var(--header-height) * 2);
    position: absolute;
    left: 0;
    bottom: 0;
    padding: var(--space-1);
    background-color: #fff;
    z-index: 2000;
    transition: all 0.7s;
    opacity: 0;
    transform: translateY(100%);
  }
  &.open-footer {
    & > .main {
      margin-bottom: calc(var(--header-height) * 2 + var(--space-1) * 2);
      height: calc(100vh - var(--header-height) * 3 - var(--space-1) * 4);
    }
    & > .footer {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
