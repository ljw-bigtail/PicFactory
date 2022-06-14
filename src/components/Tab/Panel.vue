<template>
  <div>
    <slot />
  </div>
</template>

<style lang="less" scoped>
.tab {
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
