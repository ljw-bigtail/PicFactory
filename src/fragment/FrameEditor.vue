<template>
  <div class="list">
    <ul>
      <li v-for="(item, index) in imgs" :key="item.id">
        <div class="img">
          <img
            :src="item.src"
            alt=""
            :style="{
              transform: `rotateX(${item.rotateX}deg) rotateY(${item.rotateY}deg) rotateZ(${item.rotateZ}deg)`,
            }"
          />
          <span>第 {{ index + 1 }} 帧</span>
        </div>
        <div class="tools icon-group">
          <Icon type="flip-x" @click="flipXHandler(index)"></Icon>
          <Icon type="flip-y" @click="flipYHandler(index)"></Icon>
          <Icon type="rotate" @click="turnAntiHandler(index)"></Icon>
          <Icon type="rotate-90" @click="turnHandler(index)"></Icon>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

import Icon from "../components/Icon.vue";

type FileOption = {
  id: string;
  src: string;
  file: File;
  selected: boolean;
};

type ImgsOption = FileOption & {
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

const props = defineProps<{ list: FileOption[] }>();

const imgs = ref([] as ImgsOption[]);

watch(props, function () {
  imgs.value = props.list.map((e) => {
    const cache = imgs.value.find((_e) => e.id == _e.id);
    return cache
      ? cache
      : Object.assign(
          {
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
          },
          e
        );
  });
});

const flipXHandler = function (index: number) {
  imgs.value[index].rotateY = imgs.value[index].rotateY == 0 ? 180 : 0;
};

const flipYHandler = function (index: number) {
  imgs.value[index].rotateX = imgs.value[index].rotateX == 0 ? 180 : 0;
};

const turnAntiHandler = function (index: number) {
  imgs.value[index].rotateZ -= 90;
};

const turnHandler = function (index: number) {
  imgs.value[index].rotateZ += 90;
};
</script>

<style lang="less" scoped>
.list {
  ul {
    display: flex;
    flex-wrap: wrap;
    li {
      overflow: hidden;
      padding: 1%;
      width: 20%;
      .img {
        position: relative;
        font-size: 0;
        img {
          width: 100%;
        }
        span {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          display: block;
          background-color: rgba(0, 0, 0, 0.2);
          font-size: var(--min-size);
          padding: calc(var(--space-1) / 2) 0;
          color: var(--color-white);
        }
      }
      .tools {
        padding-top: calc(var(--space-1) / 2);
      }
    }
  }
}
</style>
