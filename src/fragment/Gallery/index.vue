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
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue";
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

const clearFile = function () {
  dropFile.value.setVal([]);
  handleFileChange();
};

const handleDel = function (id: string) {
  dropFile.value.setVal(files.value.filter((e) => e.id != id));
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
  dropFile.value.setVal(
    files.value.map((e) => {
      if (state != undefined) {
        e.selected = state;
      } else {
        e.selected = !e.selected;
      }
      return e;
    })
  );
  handleUpdate();
};

const handleSelect = function (index: number) {
  // 选中
  const data = [...files.value];
  data[index].selected = !data[index].selected;
  dropFile.value.setVal(data);
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
  dropFile.value.setVal([...select, ...other]);
  setSelect(false);
};

const handleUpdate = function () {
  emit(
    "decision",
    [...files.value].filter((e) => e.selected)
  );
};

defineExpose({ clearFile, clearSelect });
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
      height: max-content;
      display: flex;
      align-items: flex-start;
      flex-wrap: wrap;
      justify-content: flex-start;
      margin-top: var(--space-1);
    }
  }
}
</style>
