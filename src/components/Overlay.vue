<template>
  <div :class="['overlay', show ? 'overlay-show' : '']" />
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less" scoped>
.overlay {
  position: fixed;
  top: -5000px;
  right: -5000px;
  bottom: -5000px;
  left: -5000px;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.2);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  visibility: hidden;
  opacity: 0;
  -webkit-transition-duration: 0.3s;
  transition-duration: 0.3s;
  -webkit-transition-property: opacity, visibility;
  transition-property: opacity, visibility;
  will-change: opacity;
  &.overlay-show {
    visibility: visible;
    opacity: 1;
  }
}
</style>
