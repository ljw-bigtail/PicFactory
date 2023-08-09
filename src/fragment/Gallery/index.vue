<template>
  <div id="gallery-box" @contextmenu="stopHandler">
    <DropFile
      v-model:value="files"
      :max_size="1024 * 10"
      @change="handleFileChange"
      ref="dropFile"
    />
    <div class="btn-group right">
      <button class="button large C" @click="handleTopping">
        <Icon type="topping" />
      </button>
      <!-- <button class="button large C" @click="handleAll">
        <Icon type="all" />
      </button> -->
      <button class="button large C" @click="handleToggle">
        <Icon type="reverse" />
      </button>
      <!-- <button class="button large C" @click="handleUpdate">
        <Icon type="import" />
      </button> -->
    </div>
    <div class="gallery-view">
      <draggable
        v-model="files"
        item-key="id"
        id="gallery-img-box"
        @change="handleFileChange"
        v-if="drop"
      >
        <template #item="{ element, index }">
          <PicItem
            :element="element"
            :inselect="true"
            @select="handleSelect(index)"
            @drag="handelDropPic(element)"
            @del="handleDel(element.id)"
            @reverse="handleReverse(index)"
          />
        </template>
      </draggable>
      <div id="gallery-img-box" v-else>
        <div v-for="(element, index) in files" :key="element.id">
          <PicItem
            :element="element"
            @select="handleSelect(index)"
            @drag="handelDropPic(element)"
            @del="handleDel(element.id)"
            @reverse="handleReverse(index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, nextTick } from "vue";
import draggable from "vuedraggable";
// import { Cache } from "@/utils/utils";

import PicItem from "./pic.vue";
import { Icon, DropFile } from "@/components/index";

import { dropFileType } from "@/type/dropFile";

const props = defineProps({
  max_size: {
    type: Number,
    default: 1024 * 10, // KB
  },
  drop: {
    type: Boolean,
    default: true,
  },
  multiDrop: {
    // 批量拖拽
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:value", "change", "drop", "log", "decision"]);

// const GalleryFiles = {
//   key: "PicFactoryGallery",
//   get: function () {
//     const json = Cache.get(this.key);
//     return json.files ? json.files : [];
//   },
//   set: function (data: dropFileType[]) {
//     Cache.set(this.key, data);
//   },
// };

const files: Ref<dropFileType[]> = ref([]);
const dropFile = ref();

const handelDropPic = function (item: dropFileType) {
  if (props.multiDrop) {
    const imgs = [...files.value].filter((e) => e.selected);
    if (imgs.length == 0) {
      emit("drop", [item]);
    } else {
      emit("drop", imgs);
      clearSelect();
    }
  } else {
    emit("drop", item);
  }
};

const handleSet = function (arr: dropFileType[]) {
  files.value = arr;
};

const clearFile = function () {
  const cache = [...files.value];
  return new Promise((res) => {
    files.value = [];
    // return cache;
    nextTick(function () {
      res(cache);
    });
  });
};

const handleDel = function (id: string) {
  files.value = files.value.filter((e) => e.id != id);
  handleFileChange();
};

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};

const handleFileChange = function () {
  emit("change", arguments[0]);
  emit("update:value", arguments[0]);
  handleUpdate();
};

const setSelect = function (state?: boolean) {
  // 清理选中状态
  files.value.map((e) => {
    e.selected = state != undefined ? state : !e.selected;
    return e;
  });
  handleUpdate();
};

const handleSelect = function (index: number) {
  // 选中
  files.value[index].selected = !files.value[index].selected;
  handleUpdate();
};

// 除文件外清除
const clearSelect = function () {
  setSelect(false);
};
// 反选
const handleToggle = function () {
  setSelect();
};
// 全选
const handleAll = function () {
  setSelect(true);
};

const handleTopping = function () {
  // 置顶
  const select: dropFileType[] = [],
    other: dropFileType[] = [];
  [...files.value].forEach((e) => {
    if (e.selected) {
      select.push(e);
    } else {
      other.push(e);
    }
  });
  files.value = [...select, ...other];
  setSelect(false);
};

const handleUpdate = function () {
  emit(
    "decision",
    [...files.value].filter((e) => e.selected)
  );
};

const colorReverse = function (src: string): Promise<string> {
  return new Promise(function (res, rej) {
    const oCanvas = document.createElement("canvas");
    const oGc = oCanvas.getContext("2d");
    if (!oGc) {
      rej("colorReverse error.");
      return;
    }
    const oImg = new Image();
    oImg.src = src;
    oImg.onload = function () {
      oCanvas.width = oImg.width;
      oCanvas.height = oImg.height;
      oGc.drawImage(oImg, 0, 0);
      const imgData = oGc.getImageData(0, 0, oCanvas.width, oCanvas.height);
      const data = imgData.data; //读取图片数据
      for (var i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      //处理完之后，再次输出
      oGc.putImageData(imgData, 0, 0);
      res(oCanvas.toDataURL());
    };
  });
};

const handleReverse = async function (index: number) {
  const _files = [...files.value];
  _files[index].src = await colorReverse(_files[index].src);
  files.value = _files;
  handleFileChange();
  return false;
};

defineExpose({ clearFile, clearSelect, handleSet });
</script>

<style scoped lang="less">
#gallery-box {
  position: relative;
  display: flex;
  flex-direction: column;
  #gallery-input-core {
    display: none;
  }
  #gallery-drop {
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
  .gallery-view {
    flex: 1;
    overflow: hidden;
    #gallery-img-box {
      min-height: 200px;
      border-radius: var(--radius);
      height: max-content;
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      justify-content: flex-start;
      padding: var(--space-1);
      background: rgb(238, 238, 238, 0.4);
    }
  }
}
</style>
