<template>
  <div
    ref="dialog"
    :id="id"
    :class="[
      'dialog',
      'dialog-' + manner,
      show ? 'open' : '',
      isFullScreen ? 'dialog-full' : '',
      size ? `dialog-size-${size}` : '',
    ]"
    tabindex="1"
    @keyup.stop="handleEsc"
  >
    <Overlay :show="show" @click="handleClose" />
    <Loading class="dialog-loading" :class="loading ? 'show' : ''" />
    <div
      :class="['dialog-center-box', glass ? 'glass' : '', fullBackground ? 'opacity-bg' : '']"
      :style="{
        backgroundImage: `url(${fullBackground})`,
      }"
    >
      <div class="dialog-close" v-if="needClose && manner == 'simple'" @click="handleClose">
        <span class="css-icon delete"></span>
      </div>
      <div class="dialog-header">
        <div class="dialog-header-left">
          <span class="css-icon delete mini" @click="handleClose" v-if="manner == 'mac'"></span>
          <span class="css-icon plus mini" @click="handleFullScreen" v-if="manner == 'mac'"></span>
        </div>
        <header>{{ title }}</header>
        <div class="dialog-header-right">
          <slot name="header" v-if="slots.header"></slot>
        </div>
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

<script setup lang="ts" scope>
import { ref, useSlots, onMounted, nextTick, watch } from "vue";
import { uuid } from "./utils";
import { Loading, Overlay } from "./index";

const props = defineProps({
  manner: {
    type: String,
    default: "mac",
    // default: "simple",
  },
  title: {
    type: String,
  },
  needClose: {
    type: Boolean,
    default: true,
  },
  glass: {
    type: Boolean,
    default: false,
  },
  show: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  escOut: {
    type: Boolean,
    default: true,
  },
  size: {
    type: Number, // [6]寸 1024 * 640
  },
  fullBackground: {
    // 整个背景替换
    type: String,
    default: "",
  },
});

const id = ref(uuid());
const slots = useSlots();
const isFullScreen = ref(false);

const emit = defineEmits(["update:show", "update:loading"]);
const handleClose = function () {
  emit("update:show", false);
  emit("update:loading", false);
};
const handleFullScreen = function () {
  isFullScreen.value = !isFullScreen.value;
};

const handleEsc = (e: KeyboardEvent) => {
  if (props.escOut && e.key === "Escape") {
    handleClose();
  }
  return false;
};

watch(
  () => props.show,
  function (n, o) {
    nextTick(() => {
      if (n) {
        dialog.value.focus();
      } else {
        dialog.value.blur();
      }
    });
  }
);

/**
 * dom 插入到 body 层级
 * 用来解决父元素 transform 导致创建 containing block 产生的 fixed 定位异常
 */
const dialog = ref();
onMounted(() => {
  nextTick(() => {
    const body = document.body;
    if (body.append) {
      body.append(dialog.value);
    } else {
      body.appendChild(dialog.value);
    }
  });
});
</script>

<style lang="less">
.dialog {
  position: fixed;
  top: 500rem;
  left: 500rem;
  z-index: 5000;
  transform: translate(-50%, -50%);
  display: none;
  .dialog-loading.show {
    display: flex;
  }
  .dialog-center-box {
    overflow: hidden;
    border-radius: var(--radius);
    box-shadow: 0 0 2rem 0.2rem var(--color-shadow);
    opacity: 0;
    visibility: hidden;
    transition-duration: 0.3s;
    transition-property: opacity, visibility, background, color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    background-size: cover;
    will-change: opacity;
    display: flex;
    flex-direction: column;
    max-width: 80vw;
    max-height: 80vh;
    min-width: 30vw;
    min-height: 15vh;
    position: relative;
    z-index: 8000;
    background-position: center center;
    background-repeat: no-repeat;
    .dialog-content {
      flex: 1;
      overflow-y: auto;
    }
    .dialog-footer {
      text-align: right;
      padding: 1rem;
      background: var(--color-bg-softer);
    }
  }
  &.dialog-size-6 {
    // [6]寸 1024 * 640
    .dialog-center-box {
      width: 1024px;
      height: 640px;
    }
  }
  &.dialog-simple {
    .dialog-center-box {
      .dialog-close {
        position: absolute;
        right: 0.8rem;
        top: 0.8rem;
        cursor: pointer;
        z-index: 2000;
        line-height: 1;
      }
      .dialog-header {
        position: relative;
        padding: 1rem;
        background: var(--color-bg-softer);
        header {
          text-align: center;
          display: block;
          font-weight: 700;
          font-size: 1.6rem;
          line-height: 2;
          color: var(--color-text);
        }
        .dialog-header-left,
        .dialog-header-right {
          position: absolute;
          top: 1rem;
        }
        .dialog-header-left {
          left: 1.6rem;
        }
        .dialog-header-right {
          right: 1.6rem;
        }
      }
      .dialog-content {
        background-color: var(--color-bg);
      }
    }
  }
  &.dialog-mac {
    .dialog-center-box {
      .dialog-header {
        position: relative;
        padding: 1rem;
        box-shadow: 0 0 1px 0 var(--color-shadow);
        background-color: var(--color-bg);
        header {
          text-align: center;
          display: block;
          font-weight: 700;
          font-size: 1.4rem;
          line-height: 1;
        }
        .dialog-header-left,
        .dialog-header-right {
          position: absolute;
          height: calc(100% - 2rem);
          display: flex;
          align-items: center;
        }
        .dialog-header-left {
          left: 1rem;
          .css-icon {
            cursor: pointer;
            border-radius: 50%;
            overflow: hidden;
            margin-right: 0.5rem;
            &::after,
            &::before {
              opacity: 0;
              transition: opacity 0.3s;
            }
          }
          &:hover {
            .css-icon {
              &::after,
              &::before {
                opacity: 1;
              }
            }
          }
          .delete {
            background-color: #ff5e57;
          }
          // .minus{
          //   background-color: #febc2e;
          // }
          .plus {
            background-color: #2bc840;
          }
        }
        .dialog-header-right {
          right: 1rem;
        }
      }
    }
  }
  .dialog-center-box {
    &.glass {
      // 毛玻璃
      backdrop-filter: blur(6px);
      background: rgba(255, 255, 255, 30%);
      // background: transparent;
      .dialog-header {
        color: var(--color-text);
        header {
          color: var(--color-text);
        }
      }
      .dialog-content {
        background-color: transparent;
      }
    }
    &.opacity-bg {
      .dialog-header {
        background-color: transparent;
        box-shadow: none;
        color: var(--color-text-re);
      }
      .dialog-content {
        background-color: transparent;
      }
    }
    .dialog-content {
      background-color: var(--color-bg);
    }
  }
  &.dialog-full .dialog-center-box {
    height: 100vh;
    max-height: 100vh;
    width: 100vw;
    max-width: 100vw;
  }
  &.open {
    top: 50%;
    left: 50%;
    display: block;
    .dialog-loading {
      opacity: 0;
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
