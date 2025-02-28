<template>
  <div class="drop-file" :data-uploading="uploading">
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
      <div class="">
        <button class="button large" v-show="!uploading">点击上传</button>
        <span v-show="!uploading">或将文件拖拽到此区域</span>
        <p v-show="uploading">
          完成进度：{{ ((uploadingNow / uploadingProgress) * 100).toFixed(1) }}%
        </p>
        <i>{{ uploadingNow.toFixed(1) }}MB / {{ uploadingProgress.toFixed(1) }}MB</i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, withDefaults } from "vue";
import { uuid } from "./utils";
import { dropFileType } from "@/type/dropFile";

const props = withDefaults(
  defineProps<{
    value: dropFileType[];
    max_size?: number;
    multiple?: boolean;
    file_type?: string[];
  }>(),
  {
    max_size: 1024 * 10, // KB
    value: () => [],
    multiple: true,
    file_type: () => ["image/jpeg", "image/png", "image/webp"],
  }
);

const message = inject("_message") as Function;

const inDrag = ref(false);
let fileList = [] as dropFileType[];
// const fileList = ref(props.value as dropFileType[]);
const id = uuid();

const uploading = ref(false);
const uploadingProgress = ref(0);
const uploadingNow = ref(0);

const emit = defineEmits(["update:value", "change", "log"]);

const log = function (mes: string) {
  console.log(mes);
  emit("log", mes);
};

const fileAdd = async function (e: Event) {
  const file = (e.target as HTMLInputElement).files;
  await addFiles(file as FileList);
};

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

const dropAdd = async function (e: DragEvent) {
  stopHandler(e);
  let file = (e.dataTransfer as DataTransfer).files;
  await addFiles(file);
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

const imgToBase64 = (file: File): Promise<string> => {
  return new Promise((res, rej) => {
    let reader = new FileReader();
    reader.onload = () => {
      if (!event?.target) return;
      const target = event?.target as FileReader;
      if (target.result && typeof target.result == "string") {
        res(target.result);
      } else {
        rej("img empty");
      }
    };
    reader.readAsDataURL(file);
  });
};

const autoCropImg = async (base64: string): Promise<string> => {
  return new Promise((res, rej) => {
    const img = new Image();
    img.src = base64;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rej("autoCropImg error.");
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let lOffset = canvas.width,
        rOffset = 0,
        tOffset = canvas.height,
        bOffset = 0;
      
      for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
          const pos = (i + canvas.width * j) * 4;
          // 检查像素是否不是完全透明的
          if (imgData[pos + 3] > 0) {
            bOffset = Math.max(j, bOffset);
            rOffset = Math.max(i, rOffset);
            tOffset = Math.min(j, tOffset);
            lOffset = Math.min(i, lOffset);
          }
        }
      }
      lOffset++;
      rOffset++;
      tOffset++;
      bOffset++;
      const new_canvas = document.createElement("canvas"); //创建处理后画布对象
      new_canvas.width = rOffset - lOffset;
      new_canvas.height = bOffset - tOffset;
      const new_ctx = new_canvas.getContext("2d");
      if (!new_ctx) {
        rej("autoCropImg error.");
        return;
      }
      new_ctx.drawImage(
        img,
        lOffset,
        tOffset,
        new_canvas.width,
        new_canvas.height,
        0,
        0,
        new_canvas.width,
        new_canvas.height
      );
      res(new_canvas.toDataURL());
    };
  });
};

const fileToSrc = async (file: File) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    const base64 = await imgToBase64(file);
    return autoCropImg(base64);
  }
  return window.URL.createObjectURL(file);
};

const addFiles = async (file: FileList) => {
  if (!file) return;
  let maxLen = file.length;
  if (!props.multiple) {
    maxLen = 1;
  }
  fileList = props.value;
  const fileListLenCatch = fileList.length;
  uploading.value = true;
  // 队列添加
  let passArr = [];
  for (let i = 0; i < maxLen; i++) {
    const item = file[i];
    if (props.file_type.includes("*")) {
    } else {
      if (!props.file_type.includes(item.type)) {
        message({
          type: "warning",
          value: `允许上传的文件格式为：${props.file_type}，该文件的格式是${item.type}`,
        });
        return;
      }
    }
    if (item.size > props.max_size * 1000) {
      message({
        type: "warning",
        value: `允许上传的最大文件大小为：${props.max_size / 1000}MB`,
      });
      return;
    }
    passArr.push(i);
    uploadingProgress.value += item.size / 1000 / 1000;
  }
  // 获得文件 blob
  for (let i = 0; i < passArr.length; i++) {
    (async function (item) {
      fileList.push({
        id: uuid(),
        src: await fileToSrc(item),
        file: item,
        selected: false,
      });
      uploadingNow.value += item.size / 1000 / 1000;
      emit("change", [...fileList]);
      emit("update:value", [...fileList]);
      if (fileList.length == fileListLenCatch + passArr.length) {
        uploading.value = false;
      }
    })(file[passArr[i]]);
    // log(`${item.name} 已上传，共${item.size / 1000}KB。`);
  }
};
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
    height: 200px;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    margin-top: 10px;
    border: 1px dashed var(--color-dark-gray);
    border-radius: var(--radius);
    &:hover {
      border-color: var(--color-black);
    }
    &.drop-in {
      background-color: #ccc;
    }
    > div {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      position: relative;
      span {
        opacity: 0.4;
        padding: 20px 0;
      }
      p {
        padding: 20px 0;
      }
      i {
        position: absolute;
        right: 10px;
        bottom: 10px;
        font-style: normal;
        font-size: 12px;
      }
    }
  }
}
</style>
