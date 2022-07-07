<template>
  <Dialog v-model:show="show" v-model:loading="loading">
    <template v-slot:content>
      <img :src="preview" class="previewImg" />
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

import Dialog from "./Dialog.vue";

const props = defineProps({
  preview: {
    type: String,
  },
});

const preview = ref("");
const show = ref(false);
const loading = ref(false);

const display = function (src: string) {
  preview.value = src;
  show.value = true;
  loading.value = false;
};

const load = function () {
  show.value = true;
  loading.value = true;
};

defineExpose({ display, load });

const emits = defineEmits(["footer-click"]);

const handleClick = function (type: "gif" | "mp4") {
  emits("footer-click", type);
};
</script>

<style lang="less" scoped>
.previewImg {
  max-width: 40vw;
  max-height: 80vh;
  background-color: var(--color-white);
}
</style>
