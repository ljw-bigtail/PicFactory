<template>
  <div class="gallery-img" @dragstart="handelDropPic">
    <div
      :class="[
        'gallery-img-item',
        props.inselect ? (element.selected ? 'selected' : 'not-selected') : '',
      ]"
      @click="handleClick"
    >
      <img :src="element.src" alt="" srcset="" />
      <span class="icon-btn delete round" @click="handleDel"></span>
      <span class="css-icon select round"></span>
    </div>
    <div class="btn-group">
      <button class="" @click="handleReverse">
        <Icon type="reverse-color" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@/components/index";
const props = defineProps(["element", "inselect"]);
const emit = defineEmits(["drag", "del", "select", "reverse"]);

const handelDropPic = () => {
  emit("drag");
};
const handleDel = () => {
  emit("del");
};
const handleReverse = () => {
  emit("reverse");
};
const handleClick = () => {
  if (props.inselect) {
    emit("select");
  }
};
</script>

<style lang="less" scoped>
.gallery-img {
  position: relative;
  width: 23%;
  margin-right: 2%;
  margin-bottom: var(--space-1);
  .gallery-img-item {
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
  .btn-group {
    padding-top: var(--space-1);
  }
}
</style>
