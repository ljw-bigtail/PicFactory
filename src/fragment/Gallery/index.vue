<template>
  <div id="gallery-box" @contextmenu="stopHandler">
    <input type="file" id="gallery-input-core" multiple="true" @change="fileAdd" />
    <div
      id="gallery-drop"
      @drop="dropAdd"
      @dragenter="dragEnter"
      @dragleave="dragLeave"
      @dragover="stopHandler"
      @click="triggerClick"
      :class="[inDrag ? 'drop-in' : '']"
    >
      <button class="button large">点击上传</button>
      <span>或将图片拖拽到此区域</span>
    </div>
    <div class="btn-group right">
      <button class="button large C" @click="handleTopping">
        <Icon type="topping" />
      </button>
      <button class="button large C" @click="handleAll">
        <Icon type="all" />
      </button>
      <button class="button large C" @click="handleToggle">
        <Icon type="reverse" />
      </button>
      <button class="button large C" @click="handleImport" v-if="need_decision">
        <Icon type="import" />
      </button>
    </div>
    <div class="gallery-view">
      <draggable
        v-model="fileList"
        item-key="id"
        id="gallery-img-box"
        @change="renderPic"
        :move="() => !inSelect"
        v-if="drop"
      >
        <template #item="{ element, index }">
          <PicItem
            :element="element"
            :inselect="inSelect"
            @select="handleSelect(index)"
            @drag="handelDropPic(element)"
            @del="handleDel(element.id)"
            @mousedown="handlerRight($event, index)"
          />
        </template>
      </draggable>
      <div id="gallery-img-box" v-else>
        <div v-for="(element, index) in fileList" :key="element.id">
          <PicItem
            :element="element"
            :inselect="inSelect"
            @select="handleSelect(index)"
            @drag="handelDropPic(element)"
            @del="handleDel(element.id)"
            @mousedown="handlerRight($event, index)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import draggable from "vuedraggable";

import { uuid } from "../../utils/utils";

import PicItem from "./pic.vue";
import Icon from "../../components/Icon.vue";

import { Img } from "../../type/img";

// TODO 拖拽组件：批量拖拽

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
  need_decision: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:value", "change", "drop", "log", "decision"]);

const inDrag = ref(false);
const inSelect = ref(false);
const fileList = ref(props.value as Img[]);

const triggerClick = function () {
  const input: HTMLInputElement = document.querySelector(
    "#gallery-input-core"
  ) as HTMLInputElement;
  input.click();
};

const handelDropPic = function (item: Img) {
  emit("drop", item);
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
  handleImport();
};

const clearSelect = function (index?: number) {
  // 清理选中状态
  fileList.value = [...fileList.value].map((e, i) => {
    return Object.assign(e, { selected: i == index });
  });
};

const handlerRight = function (event: MouseEvent, index: number) {
  // 右键
  if (event.button == 2) {
    inSelect.value = !inSelect.value;
    if (inSelect.value && !props.need_decision) {
      clearSelect(index);
    }
  }
};

const handleSelect = function (index: number) {
  // 选中
  fileList.value[index].selected = !fileList.value[index].selected;
};

// 全选与反选
const handleToggle = function(){
  inSelect.value = true;
  fileList.value = fileList.value.map(e=>{
    e.selected = !e.selected
    return e
  });
}
const handleAll = function(){
  inSelect.value = true;
  fileList.value = fileList.value.map(e=>{
    e.selected = true
    return e
  });
}

const handleTopping = function () {
  // 置顶
  if (!inSelect.value) return;
  const select: Img[] = [],
    other: Img[] = [];
  [...fileList.value].forEach((e) => {
    if (e.selected) {
      select.push(e);
    } else {
      other.push(e);
    }
  });
  fileList.value = ([] as Img[]).concat(select, other);
  // 清除状态
  inSelect.value = false;
  if (!props.need_decision) {
    clearSelect();
  }
};

const handleImport = function () {
  emit(
    "decision",
    [...fileList.value].filter((e) => e.selected)
  );
};
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