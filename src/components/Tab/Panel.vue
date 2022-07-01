<template>
  <div>
    <slot />
  </div>
</template>

<style lang="less" scoped>
.tab {
  width: 100%;
  flex: 1;
  &__body {
    &__item {
      display: none;
      // margin-top: var(--space-1);
      &.selected {
        display: block;
      }
    }
  }
}
</style>
