<template>
  <BaseLayout>
    <template v-slot:header>
      <span>格式转换</span>
    </template>
    <!-- <template v-slot:menu> </template> -->
    <template v-slot:main>
      <div class="center">
        <header>
          <h3>图片格式转换</h3>
          <p>
            现已支持：
            {{ selectOption.map((e) => e.name.toLocaleUpperCase()).join("、") }}
            格式
          </p>
        </header>
        <div>
          <DropFile
            v-model:value="files"
            :max_size="1024 * 10"
            @change="handleFileChange"
            ref="dropFile"
            :multiple="false"
            :file_type="selectOption.map((e) => e.fileType)"
          />
        </div>
        <div class="form">
          <div class="form-item">
            <span>请选择想获取的文件格式：</span>
            <select @change="selectHandler" v-model="targetType">
              <option
                :key="opt.value"
                :value="opt.value"
                v-for="opt in selectOption"
                :disabled="fileType === opt.fileType"
              >
                {{ opt.name.toLocaleUpperCase() }}
              </option>
            </select>
          </div>
          <ul class="filsList">
            <li v-for="file in files">
              <span>{{ file.file.name }}</span>
              <span>{{ (file.file.size / 1000).toFixed(0) }}KB</span>
            </li>
          </ul>
        </div>
        <div class="btn-group center">
          <button class="button D large" @click="handleConversion">
            下载{{ targetType.toLocaleUpperCase() }}
          </button>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <Log :logs="logs" />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, Ref, inject } from "vue";
import { saveAs } from "file-saver";
import { dateFmt } from "@/utils/utils";
import BaseLayout from "@/layouts/BaseLayout.vue";
import { DropFile } from "@/components/index";
import Log from "@/fragment/Log.vue";
import { dropFileType } from "@/type/dropFile";

const logs = ref([] as { value: string; timestamp: string }[]);
const message = inject("_message") as Function;

const selectOption = ref([
  { name: "jpg/jpeg", value: "jpg", fileType: "image/jpeg" },
  // { name: "jpeg", value: "jpeg", fileType: "image/jpeg" },
  { name: "png", value: "png", fileType: "image/png" },
  { name: "bmp", value: "bmp", fileType: "image/bmp" },
  { name: "webp", value: "webp", fileType: "image/webp" },
]);
const targetType = ref(selectOption.value[0].value);
const selectHandler = () => {};

const files: Ref<dropFileType[]> = ref([]);
const fileType = ref("");
const handleFileChange = (_files: dropFileType[]) => {
  fileType.value = { ...[..._files][0] }.file.type;
  targetType.value = selectOption.value.filter((item) => {
    return item.fileType !== fileType.value;
  })[0].value;
};

const readfile = async (file: File): Promise<string> => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      if (typeof reader.result == "string") {
        res(reader.result);
      } else {
        rej("File Error!");
      }
    };
  });
};

const canvasToBlob = async (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> => {
  return new Promise(function (res, rej) {
    canvas.toBlob(
      function (blob) {
        if (blob) {
          res(blob);
        } else {
          rej("数据异常");
        }
      },
      type,
      quality
    );
  });
};

const canvasLoadImg = async (src: string, fileType: string): Promise<Blob> => {
  return new Promise((res, rej) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return;
    const image = new Image();
    image.src = src;
    image.onload = async function () {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      const blob = await canvasToBlob(canvas, fileType, 1);
      res(blob);
    };
  });
};

const handleConversion = async () => {
  const { file } = { ...[...files.value][0] };
  const src = await readfile(file);
  const fileType = selectOption.value.find((item) => {
    return item.value == targetType.value;
  });
  if (!fileType) return;
  const blob = await canvasLoadImg(src, fileType.fileType);
  await saveAs(blob, `${file.name}-${dateFmt()}.${fileType.value}`);
  message({
    type: "success",
    value: "下载成功...",
  });
};
</script>

<style lang="less" scoped>
.center {
  width: 750px;
  header {
    padding: 2rem 0;
    h3 {
      padding: 1rem 0;
    }
    p {
      color: var(--color-dark-gray);
    }
  }
  .form {
    padding: 1rem 0;
    select {
      padding: 0.4rem 0.8rem;
      border-radius: var(--radius);
    }
  }
  .filsList {
    margin: 1rem 0;
    li {
      display: flex;
      line-height: 1.4;
      justify-content: space-between;
      padding: 0.6rem 0;
      span:first-child {
        text-align: left;
        width: 70%;
        display: block;
        overflow: hidden;
      }
    }
  }
}
</style>
