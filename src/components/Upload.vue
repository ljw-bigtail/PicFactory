<template>
  <div id="upload">
    <input type="file" id="upload-drop-core" multiple="true" @change="fileAdd" />
    <div
      id="upload-drop"
      @drop="dropAdd"
      @dragenter="dragEnter"
      @dragleave="dragLeave"
      @dragover="stopHandler"
      :class="[inDrag ? 'drop-in' : '']"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path
          fill="#51B2F9"
          fill-opacity="1"
          d="M0,224L48,213.3C96,203,192,181,288,170.7C384,160,480,160,576,144C672,128,768,96,864,106.7C960,117,1056,171,1152,186.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
      <span>或将图片拖拽到此区域</span>
      <button id="upload-btn" class="button large" @click="triggerClick">上传图片</button>
    </div>
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
        log(`允许上传的最大文件大小为：${props.max_size / 1000}MB`);
      }
    } else {
      log(`允许上传的文件格式为：jpeg、jpg、png、webp`);
    }
  }
  renderPic();
};

const clearFile = function () {
  fileList = [];
  renderPic();
};

defineExpose({ clearFile });

const fileAdd = function (e: Event) {
  const file = (e.target as HTMLInputElement).files;
  addFiles(file as FileList);
};

const handleDel = function (index: number) {
  fileList.splice(index, 1);
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
  const _files = fileList.map((file, index) => {
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
  fileList = _fileList;
  renderPic();
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
    padding: 90px 0 40px;
    position: relative;
    &.drop-in {
      background-color: #ccc;
    }
    span {
      position: relative;
      z-index: 1;
      opacity: 0.4;
    }
    svg {
      position: absolute;
      left: 0;
      bottom: 0;
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
