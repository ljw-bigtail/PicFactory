<template>
  <div :id="id" :class="['dialog', 'dialog-' + size, show ? 'open' : '']">
    <Overlay :show="show" @click="handleClick" />
    <Loading class="dialog-loading" :class="loading ? 'show' : ''" />
    <div class="dialog-center-box">
      <div class="dialog-close" v-if="needClose" @click="handleClick">
        <span class="css-icon delete bold"></span>
      </div>
      <div class="dialog-header" v-if="slots.header">
        <slot name="header"></slot>
      </div>
      <div class="dialog-content">
        <slot name="content"></slot>
      </div>
      <div class="dialog-footer" v-if="slots.footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useSlots } from "vue";

import { uuid } from "../utils/utils";

import Loading from "./Loading.vue";
import Overlay from "./Overlay.vue";

const props = defineProps({
  size: {
    type: String,
    default: "max-content",
  },
  needClose: {
    type: Boolean,
    default: true,
  },
  show: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const id = ref(uuid());
const slots = useSlots();

const emit = defineEmits(["update:show", "update:loading"]);
const handleClick = function () {
  emit("update:show", false);
  emit("update:loading", false);
};
</script>

<style lang="less" scoped>
.dialog {
  position: fixed;
  top: 5000px;
  left: 5000px;
  z-index: 5000;
  transform: translate(-50%, -50%);
  display: none;
  .dialog-loading.show {
    display: flex;
  }
  .dialog-center-box {
    overflow: hidden;
    background: var(--color-white);
    border-radius: var(--radius);
    box-shadow: var(--shadow-dark);
    opacity: 0;
    visibility: hidden;
    -webkit-transition-duration: 0.3s;
    transition-duration: 0.3s;
    -webkit-transition-property: opacity, visibility;
    transition-property: opacity, visibility;
    will-change: opacity;
    display: flex;
    flex-direction: column;
    max-width: 80vw;
    max-height: 80vh;
    min-width: 100px;
    min-height: 200px;
    position: relative;
    z-index: 8000;
    .dialog-close {
      position: absolute;
      right: var(--space-1);
      top: var(--space-1);
      cursor: pointer;
      z-index: 2000;
      line-height: 1;
    }
  }

  &.dialog-max-content .dialog-center-box {
    width: max-content;
    height: max-content;
  }
  &.dialog-full .dialog-center-box {
    height: 100vh;
    width: 100vw;
  }

  .dialog-content {
    display: flex;
    height: 100%;
    flex: 1;
    overflow-y: auto;
    background: var(--color-white);
    // background: var(--color-light-gray);
  }
  .dialog-header {
    font-size: var(--large-size);
    padding: var(--space-2) var(--space-4) var(--space-1) var(--space-2);
    font-weight: 700;
    & + .dialog-content {
      padding: var(--space-1) var(--space-2) var(--space-2);
      // height: auto;
      display: block;
    }
  }
  .dialog-footer {
    text-align: right;
    padding: 0 var(--space-2);
    button {
      display: inline-block;
      width: 120px;
      padding: var(--space-1);
      cursor: pointer;
      color: #fff;
      text-decoration: none;
      margin: var(--space-1) 0;
      background: var(--main-color);
      border-radius: var(--radius-mini);
    }
  }
  &.open {
    top: 50%;
    left: 50%;
    display: block;
    .dialog-loading {
      & + .dialog-center-box {
        opacity: 1;
        visibility: visible;
      }
      &.show {
        & + .dialog-center-box {
          opacity: 0;
          visibility: hidden;
        }
      }
    }
  }
}
</style>
