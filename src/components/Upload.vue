<template>
  <div id="upload">
    <div
      id="upload-drop"
      @drop="dropAdd"
      @dragenter="dragEnter"
      @dragleave="dragLeave"
      @dragover="stopHandler"
      :class="[inDrag ? 'drop-in' : '']"
    >
      或将图片拖拽到此区域
    </div>
    <input type="file" id="upload-drop-core" multiple="true" @change="fileAdd" />
    <div id="upload-btn" class="button" @click="triggerClick">上传图片</div>
    <div class="upload-view-box">
      <draggable
        v-model="fileListPreview"
        item-key="id"
        id="upload-view"
        @change="dragSortChange"
      >
        <template #item="{ element }">
          <div class="upload-view-item">
            <img :src="element.src" alt="" srcset="" />
            <span class="del-btn" @click="handleDel(element.id)"></span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import draggable from "vuedraggable";

const props = defineProps({
  max_size: {
    type: Number,
    default: 1000,
  },
});

const emit = defineEmits(["change", "log"]);

const inDrag = ref(false);
const fileListPreview = ref([] as { id: number; src: string }[]);

let fileList: File[] = [];

const triggerClick = function () {
  const input: HTMLInputElement = document.querySelector(
    "#upload-drop-core"
  ) as HTMLInputElement;
  input.click();
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
        fileList.push(item);
        log(`${item.name} 已上传，共${item.size / 1000}KB。`);
      } else {
        log(`允许上传的最大文件大小为：${props.max_size * 1000}KB`);
      }
    } else {
      log(`允许上传的文件格式为：jpeg、jpg、png、webp`);
    }
  }
  renderPic(fileList);
};

const fileAdd = function (e: Event) {
  const file = (e.target as HTMLInputElement).files;
  addFiles(file as FileList);
};

const handleDel = function (index: number) {
  fileList.splice(index, 1);
  renderPic(fileList);
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

const renderPic = function (files: File[]) {
  const _files = files.map((file, index) => {
    return {
      id: index,
      src: window.URL.createObjectURL(file),
      file: file,
    };
  });
  fileListPreview.value = _files;
  emit("change", _files);
};

const dragSortChange = function (res: any) {
  const {
    moved: { newIndex, oldIndex },
  } = res;
  const _fileList = fileList;
  const _file = _fileList[newIndex];
  _fileList[newIndex] = _fileList[oldIndex];
  _fileList[oldIndex] = _file;
  renderPic(_fileList);
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
  #upload-btn {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
  #upload-drop {
    cursor: default;
    border-bottom: 1px dashed #ccc;
    padding: 90px 0 40px;
    &.drop-in {
      background-color: #ccc;
    }
  }
  .upload-view-box {
    flex: 1;
    overflow-y: auto;
    #upload-view {
      height: max-content;
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      justify-content: flex-start;
      margin-top: var(--space-1);
      padding: var(--space-1);
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
        .del-btn {
          position: absolute;
          width: 32px;
          height: 32px;
          cursor: pointer;
          background-color: rgba(0, 0, 0, 0.3);
          top: 0;
          right: 0;
          transform: translate(30%, -30%) rotateZ(45deg);
          border-radius: 50%;
          font-size: 0;
          &::before,
          &::after {
            content: "";
            display: block;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 16px;
            border-bottom: 2px solid #fff;
          }
          &::after {
            transform: translate(-50%, -50%) rotateZ(90deg);
          }
        }
      }
    }
  }
}
</style>
