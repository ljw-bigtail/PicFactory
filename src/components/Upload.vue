<template>
  <div id="upload">
    <input type="file" id="upload-drop-core" multiple="true" @change="fileAdd" />
    <div
      id="upload-drop"
      @drop="dropAdd"
      @dragenter="dragEnter"
      @dragleave="dragLeave"
      @dragover="stopHandler"
      @click="triggerClick"
      :class="[inDrag ? 'drop-in' : '']"
    >
      <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          fill="#51B2F9"
          fill-opacity="1"
          d="M0,224L48,213.3C96,203,192,181,288,170.7C384,160,480,160,576,144C672,128,768,96,864,106.7C960,117,1056,171,1152,186.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg> -->
      <button class="button large">点击上传</button>
      <span>或将图片拖拽到此区域</span>
    </div>
    <div class="upload-view-box">
      <draggable
        v-model="fileList"
        item-key="id"
        id="upload-view"
        @change="renderPic"
        v-if="drop"
      >
        <template #item="{ element }">
          <div class="upload-view-item">
            <img :src="element.src" alt="" srcset="" />
            <span class="del-btn round" @click="handleDel(element.id)"></span>
          </div>
        </template>
      </draggable>
      <div id="upload-view" v-else>
        <div
          class="upload-view-item"
          v-for="element in fileList"
          :key="element.id"
          @click="handelClick(element)"
        >
          <img :src="element.src" alt="" srcset="" />
          <span class="del-btn round" @click="handleDel(element.id)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import draggable from "vuedraggable";

import { uuid } from "../utils/utils";

const props = defineProps({
  max_size: {
    type: Number,
    default: 1024 * 10, // KB
  },
  value: {
    type: Array,
    default: [],
  },
  drop: {
    type: Boolean,
    default: true,
  },
});

type FileObject = { id: string; src: string; file: File };

const emit = defineEmits(["update:value", "change", "select", "log"]);

const inDrag = ref(false);
const fileList = ref(props.value as FileObject[]);

const triggerClick = function () {
  const input: HTMLInputElement = document.querySelector(
    "#upload-drop-core"
  ) as HTMLInputElement;
  input.click();
};

const handelClick = function (item: FileObject) {
  emit("select", item);
};

const log = function (mes: string) {
  emit("log", mes);
};

const addFiles = (file: FileList) => {
  if (!file) return;
  for (let i = 0; i < file.length; i++) {
    const item = file[i];
    if (["image/jpeg", "image/png", "image/webp"].includes(item.type)) {
      if (item.size < props.max_size * 1000) {
        // 队列添加完毕 获得文件 blob
        fileList.value.push({
          id: uuid(),
          src: window.URL.createObjectURL(item),
          file: item,
        });
        log(`${item.name} 已上传，共${item.size / 1000}KB。`);
      } else {
        log(`允许上传的最大文件大小为：${props.max_size / 1000}MB`);
      }
    } else {
      log(`允许上传的文件格式为：jpeg、jpg、png、webp`);
    }
  }
  renderPic();
};

const clearFile = function () {
  fileList.value = [];
  renderPic();
};

defineExpose({ clearFile });

const fileAdd = function (e: Event) {
  const file = (e.target as HTMLInputElement).files;
  addFiles(file as FileList);
};

const handleDel = function (id: string) {
  fileList.value = fileList.value.filter((e) => e.id != id);
  renderPic();
};

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

const dropAdd = function (e: DragEvent) {
  stopHandler(e);
  const file = (e.dataTransfer as DataTransfer).files;
  addFiles(file);
  inDrag.value = false;
};

const dragEnter = function (e: DragEvent) {
  stopHandler(e);
  inDrag.value = true;
};

const dragLeave = function (e: DragEvent) {
  stopHandler(e);
  inDrag.value = false;
};

const renderPic = function () {
  emit("change", [...fileList.value]);
  emit("update:value", [...fileList.value]);
};
</script>

<style scoped lang="less">
#upload {
  position: relative;
  display: flex;
  flex-direction: column;
  #upload-drop-core {
    display: none;
  }
  #upload-drop {
    cursor: pointer;
    padding: 50px 0;
    display: flex;
    flex-direction: column;
    border: 1px dashed var(--color-light-gray);
    border-radius: var(--radius);
    &:hover {
      border-color: var(--color-dark-gray);
    }
    &.drop-in {
      background-color: #ccc;
    }
    span {
      opacity: 0.4;
      padding: 20px 0;
    }
  }
  .upload-view-box {
    flex: 1;
    overflow: hidden;
    #upload-view {
      height: max-content;
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      justify-content: flex-start;
      margin-top: var(--space-1);
      .upload-view-item {
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
      }
    }
  }
}
</style>
