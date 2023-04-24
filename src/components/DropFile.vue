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
  const file = (e.dataTransfer as DataTransfer).files;
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
      ctx.drawImage(img, 0, 0); //绘制
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; //读取图片数据
      let lOffset = canvas.width,
        rOffset = 0,
        tOffset = canvas.height,
        bOffset = 0;
      for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
          const pos = (i + canvas.width * j) * 4;
          if (
            imgData[pos] == 255 ||
            imgData[pos + 1] == 255 ||
            imgData[pos + 2] == 255 ||
            imgData[pos + 3] == 255
          ) {
            bOffset = Math.max(j, bOffset); // 找到有色彩的最下端
            rOffset = Math.max(i, rOffset); // 找到有色彩的最右端
            tOffset = Math.min(j, tOffset); // 找到有色彩的最上端
            lOffset = Math.min(i, lOffset); // 找到有色彩的最左端
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
  for (let i = 0; i < file.length; i++) {
    const item = file[i];
    if (!props.file_type.includes(item.type)) {
      log(`允许上传的文件格式为：${props.file_type}`);
      return;
    }
    if (item.size > props.max_size * 1000) {
      log(`允许上传的最大文件大小为：${props.max_size / 1000}MB`);
      return;
    } // 队列添加完毕 获得文件 blob
    fileList.value.push({
      id: uuid(),
      src: await fileToSrc(item),
      file: item,
      selected: false,
    });
    log(`${item.name} 已上传，共${item.size / 1000}KB。`);
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
    border: 1px dashed var(--color-dark-gray);
    border-radius: var(--radius);
    &:hover {
      border-color: var(--color-black);
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
