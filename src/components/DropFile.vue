<template>
  <div class="drop-file">
    <input
      type="file"
      :id="`drop-file-core_${id}`"
      :accept="file_type.join(',')"
      class="drop-file-core"
      :multiple="multiple"
      @change="fileAdd"
    />
    <div
      class="drop-file-box"
      @drop="dropAdd"
      @dragenter="dragEnter"
      @dragleave="dragLeave"
      @dragover="stopHandler"
      @click="triggerClick"
      :class="[inDrag ? 'drop-in' : '']"
    >
      <button class="button large">点击上传</button>
      <span>或将文件拖拽到此区域</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { uuid } from "./utils";
import { dropFileType } from "@/type/dropFile";

const props = defineProps({
  max_size: {
    type: Number,
    default: 1024 * 10, // KB
  },
  value: {
    type: Array,
    default: [],
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  file_type: {
    type: Array,
    default: ["image/jpeg", "image/png", "image/webp"],
  },
});

const inDrag = ref(false);
const fileList = ref(props.value as dropFileType[]);
const id = uuid();

const emit = defineEmits(["update:value", "change", "log"]);

const log = function (mes: string) {
  emit("log", mes);
};

const fileAdd = function (e: Event) {
  const file = (e.target as HTMLInputElement).files;
  addFiles(file as FileList);
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

const triggerClick = function () {
  const input: HTMLInputElement = document.querySelector(
    "#drop-file-core_" + id
  ) as HTMLInputElement;
  input.click();
};

const addFiles = (file: FileList) => {
  if (!file) return;
  for (let i = 0; i < file.length; i++) {
    const item = file[i];
    if (props.file_type.includes(item.type)) {
      if (item.size < props.max_size * 1000) {
        // 队列添加完毕 获得文件 blob
        fileList.value.push({
          id: uuid(),
          src: window.URL.createObjectURL(item),
          file: item,
          selected: false,
        });
        log(`${item.name} 已上传，共${item.size / 1000}KB。`);
      } else {
        log(`允许上传的最大文件大小为：${props.max_size / 1000}MB`);
      }
    } else {
      log(`允许上传的文件格式为：jpeg、jpg、png、webp`);
    }
  }

  emit("change", [...fileList.value]);
  emit("update:value", [...fileList.value]);
};

const setVal = function () {
  fileList.value = arguments[0];
  emit("change", [...fileList.value]);
  emit("update:value", [...fileList.value]);
};

defineExpose({ setVal });
</script>

<style lang="less" scoped>
.drop-file {
  position: relative;
  display: flex;
  flex-direction: column;
  .drop-file-core {
    display: none;
  }
  .drop-file-box {
    cursor: pointer;
    width: 100%;
    text-align: center;
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
}
</style>
