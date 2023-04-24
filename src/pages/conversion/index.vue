<template>
  <BaseLayout>
    <template v-slot:header>
      <span>格式转换</span>
    </template>
    <!-- <template v-slot:menu> </template> -->
    <template v-slot:main>
      <!-- <DropFile
        v-model:value="files"
        :max_size="1024 * 10"
        @change="handleFileChange"
        ref="dropFile"
        :multiple="false"
        :file_type="['*']"
      />
      <div class="size-select">
        <select @change="selectHandler" v-model="targetType">
          <option
            :key="opt.name"
            :value="opt.value"
            v-for="(opt, index) in selectOption"
            v-show="index != 1"
          >
            {{ opt.name }}
          </option>
        </select>
      </div>
      <button class="button large" @click="">生成文件</button>
      <button class="button large" @click="">下载文件</button> -->
      Comming Soon...
    </template>
    <template v-slot:footer>
      <Log :logs="logs" />
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
import { dateFmt } from "@/utils/utils";
import BaseLayout from "@/layouts/BaseLayout.vue";
import { DropFile } from "@/components/index";
import Log from "@/fragment/Log.vue";
import { dropFileType } from "@/type/dropFile";

const logs = ref([] as { value: string; timestamp: string }[]);

const selectOption = ref([{ name: "请选择", value: "" }]);
const targetType = ref();
const selectHandler = () => {};

const files: Ref<dropFileType[]> = ref([]);
const handleFileChange = () => {
  console.log([...files.value]);
};
// const tabSelect = ref("library");
// const previewSrc = ref("");
// const galleryLoader = ref();
// const previewDialog = ref();
// const frameEditor = ref();
// const gifForm = ref({
//   width: 800,
//   height: 1000,
//   repeat: 0,
//   delay: 750,
//   background: "#FFFFFF",
//   rule: 3,
//   quality: 0.5, // ffmpeg的默认值是23，建议的取值范围是17-28。
// });
// const musicForm = ref({
//   start: 0,
// });

// const paintsFactory = new PaintsFactory();

// const message = inject("_message") as Function;

// const clearFileCache = () => {
//   nextTick(() => {
//     previewSrc.value = "";
//     galleryLoader.value.clearSelect();
//     frameEditor.value.handleClear();
//     message({
//       type: "success",
//       value: "清理成功...",
//     });
//   });
// };

// const addLog = (mes: string) => {
//   logs.value.push({
//     value: mes,
//     timestamp: dateFmt(),
//   });
// };

// const openPreview = function () {
//   previewDialog.value.open();
// };

// const makePreview = async function () {
//   var frames = frameEditor.value.getFrames();
//   if (!frames || frames.length == 0) {
//     message({
//       type: "warning",
//       value: "请从图库中选择。",
//     });
//     return;
//   }
//   message({
//     value: "正在加载插件，请等待...",
//   });
//   previewDialog.value.load();
//   const file = await paintsFactory
//     .setOpt(gifForm.value)
//     .setMusic(musicForm.value)
//     .setFrame(frames)
//     .toPreView()
//     .catch((e) => console.log(e));
//   if (!file?.src) return;
//   const { src, size_mp4, size_gif } = file;
//   console.log(`
//     size_mp4: ${Math.round(size_mp4 / 1024)}KB
//     size_gif: ${Math.round(size_gif / 1024)}KB
//   `);
//   previewDialog.value.display(src);
// };

// const makeFile = function (type: "gif" | "mp4") {
//   var frames = frameEditor.value.getFrames();
//   if (!frames || frames.length == 0) return;
//   paintsFactory.toFile(type).catch((e) => console.log(e));
// };

// type FileOption = { id: string; src: string; file: File; selected: boolean };

// const handleDrop = function (data: FileOption[]) {
//   frameEditor.value.setDropCache([...data]);
// };
</script>

<style lang="less" scoped></style>
