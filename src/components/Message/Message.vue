<template>
  <div :class="['global-message-box', open ? 'open' : '']">
    <div :class="['global-message-value', type]">{{ value }}</div>
    <span class="global-message-btn" @click="handleClose">
      <i class="css-icon delete"></i>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "info",
  },
  value: {
    type: String,
    default: "",
  },
  timeout: {
    type: Number,
    default: 3000,
  },
  remove: Function,
});

let timer: any;
const open = ref(false);

onMounted(() => {
  open.value = true;
  const animateTimeOut = 300;
  timer = setTimeout(function () {
    open.value = false;
    setTimeout(function () {
      if (typeof props.remove == "function") {
        props.remove();
      }
    }, animateTimeOut); // 动画时间
  }, props.timeout - animateTimeOut);
});

const handleClose = () => {
  if (typeof props.remove == "function") {
    props.remove();
  }
  if (timer) {
    clearTimeout(timer);
  }
};
</script>

<style lang="less" scoped>
.global-message-box {
  width: 240px;
  min-height: 2em;
  background-color: var(--color-white);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
  text-align: left;
  margin-top: var(--space-1);
  right: calc(-100% - 40px);
  transition: all 0.3s;
  position: relative;
  &.open {
    display: block;
    right: 40px;
  }
  .global-message-value {
    padding: var(--space-1);
    text-align: left;
    word-break: break-all;
    position: relative;
    &::before,
    &::after {
      content: "";
      position: absolute;
      display: block;
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
    &::before {
      top: 0;
      left: 0;
      border-top: 4px solid #000;
      border-left: 4px solid #000;
    }
    &::after {
      bottom: 0;
      right: 0;
      border-bottom: 4px solid #000;
      border-right: 4px solid #000;
    }
    &.info::before,
    &.info::after {
      border-color: var(--color-B);
    }
    &.warning::before,
    &.warning::after {
      border-color: var(--color-C);
    }
    &.success::before,
    &.success::after {
      border-color: var(--color-D);
    }
    &.error::before,
    &.error::after {
      border-color: var(--color-A);
    }
  }
  .global-message-btn {
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    opacity: 0.5;
    transform: scale(0.8);
  }
}
</style>
