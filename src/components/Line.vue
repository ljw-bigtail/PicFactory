<template>
  <span :class="['line', 'line-' + type]"></span>
</template>

<script lang="ts" setup>
const props = defineProps({
  type: {
    type: String,
    default: "horizontal", // horizontal | vertical
  },
});
</script>

<style scoped lang="less">
.line {
  display: block;
  &.line-horizontal {
    margin: var(--space-1) 0;
    border-top: var(--border);
  }
  &.line-vertical {
    margin: 0 var(--space-1);
    height: 1em;
    border-right: var(--border);
  }
}
</style>
