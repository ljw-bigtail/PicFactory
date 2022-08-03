<template>
  <Dialog v-model:show="show" v-model:loading="loading">
    <template v-slot:content>
      <video
        :src="preview"
        :width="height * ratio"
        :height="height"
        class="preview"
        controls
        autoplay
      ></video>
    </template>
    <template v-slot:footer>
      <div class="btn-group center">
        <button class="button large C" @click="handleClick('gif')">下载GIF</button>
        <button class="button large C" @click="handleClick('mp4')">下载MP4</button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

import Dialog from "../components/Dialog.vue";

const props = defineProps({
  ratio: {
    type: Number,
    default: 1,
  },
});

const preview = ref("");
const height = window.screen.height * 0.6;
const show = ref(false);
const loading = ref(false);

const open = function (_loading = false) {
  show.value = true;
  loading.value = _loading;
};

const load = function () {
  open(true);
};

const display = function (src: string) {
  preview.value = src;
  open();
};

defineExpose({ display, load, open });

const emits = defineEmits(["footer-click"]);

const handleClick = function (type: "gif" | "mp4") {
  emits("footer-click", type);
};
</script>

<style lang="less" scoped>
.preview {
  // max-width: 40vw;
  // max-height: 80vh;
  background-color: var(--color-white);
}
</style>
