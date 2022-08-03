<template>
  <div
    :class="[
      'gallery-img-item',
      props.inselect ? (element.selected ? 'selected' : 'not-selected') : '',
    ]"
    @dragstart="handelDropPic"
    @click="handleClick"
  >
    <img :src="element.src" alt="" srcset="" />
    <span class="icon-btn delete round" @click="handleDel"></span>
    <span class="css-icon select round"></span>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(["element", "inselect"]);
const emit = defineEmits(["drag", "del", "select"]);

const handelDropPic = () => {
  emit("drag");
};
const handleDel = () => {
  emit("del");
};
const handleClick = () => {
  if (props.inselect) {
    emit("select");
  }
};
</script>

<style lang="less" scoped>
.gallery-img-item {
  width: 23%;
  margin-right: 2%;
  margin-bottom: var(--space-1);
  position: relative;
  &:nth-child(4n) {
    margin-right: 0;
  }
  img {
    display: block;
    width: 100%;
  }
  .icon-btn.delete {
    display: none;
  }
  &:hover {
    .icon-btn.delete {
      display: block;
    }
  }
  .css-icon.select {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    display: none;
    &::before,
    &::after {
      opacity: 0;
      border-color: var(--color-white) !important;
    }
  }
  &.selected,
  &.not-selected {
    .css-icon.select {
      display: block;
    }
  }
  &.selected {
    .css-icon.select {
      background-color: rgba(0, 0, 0, 0.3);
      &::before,
      &::after {
        opacity: 1;
      }
    }
  }
}
</style>
