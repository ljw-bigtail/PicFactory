<template>
  <div id="gallery-box" @contextmenu="stopHandler">
    <DropFile
      v-bind:value="files"
      :max_size="1024 * 10"
      @change="handleFileChange"
    />
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
      <!-- <button class="button large C" @click="handleImport" v-if="need_decision">
        <Icon type="import" />
      </button> -->
    </div>
    <div class="gallery-view">
      <draggable
        v-model="files"
        item-key="id"
        id="gallery-img-box"
        @change="handleFileChange"
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
        <div v-for="(element, index) in files" :key="element.id">
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

import PicItem from "./pic.vue";
import Icon from "../../components/Icon.vue";
import DropFile from "../../components/DropFile.vue";

import { dropFileType } from "../../type/dropFile";

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

const inSelect = ref(false);
const files = ref(props.value as dropFileType[]);

const handelDropPic = function (item: dropFileType) {
  emit("drop", item);
};

const clearFile = function () {
  files.value = [];
  handleFileChange();
};

defineExpose({ clearFile });

const handleDel = function (id: string) {
  files.value = files.value.filter((e) => e.id != id);
  handleFileChange();
};

const stopHandler = function (e: Event) {
  e.stopPropagation();
  e.preventDefault();
};


const handleFileChange = function () {
  emit("change", [...files.value]);
  emit("update:value", [...files.value]);
  handleImport();
};

const clearSelect = function (index?: number) {
  // 清理选中状态
  files.value = [...files.value].map((e, i) => {
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
  files.value[index].selected = !files.value[index].selected;
  handleImport()
};

// 全选与反选
const handleToggle = function(){
  inSelect.value = true;
  files.value = files.value.map(e=>{
    e.selected = !e.selected
    return e
  });
  handleImport();
}
const handleAll = function(){
  inSelect.value = true;
  files.value = files.value.map(e=>{
    e.selected = true
    return e
  });
  handleImport();
}

const handleTopping = function () {
  // 置顶
  if (!inSelect.value) return;
  const select: dropFileType[] = [],
    other: dropFileType[] = [];
  [...files.value].forEach((e) => {
    if (e.selected) {
      select.push(e);
    } else {
      other.push(e);
    }
  });
  files.value = ([] as dropFileType[]).concat(select, other);
  // 清除状态
  inSelect.value = false;
  handleImport()
  if (!props.need_decision) {
    clearSelect();
  }
};

const handleImport = function () {
  emit(
    "decision",
    [...files.value].filter((e) => e.selected)
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
