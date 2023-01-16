<template>
  <div class="form">
    <DropFile v-model:value="files" :max_size="1024 * 50" :file_type="['audio/mpeg']" />
    <div class="music-select">
      <ul>
        <li v-for="item in files" class="line" @click="handleSelect(item)">
          <span>{{ item.file.name }}</span>
          <span>
            <i :class="['css-icon', item.selected ? 'select' : '']"></i>
          </span>
        </li>
      </ul>
    </div>
    <Line></Line>
    <div>
      <span>起始时间：</span>
      <div>
        <input type="number" name="start" v-model="value.start" @change="formChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import Line from "@/components/Line.vue";
import DropFile from "@/components/DropFile.vue";

import { dropFileType } from "@/type/dropFile";
import { MusicOption } from "@/type/video";

const props = defineProps<{ value: MusicOption }>();
const emit = defineEmits(["update:value", "change"]);

const files = ref([] as dropFileType[]);

const formChange = function (value?: {}) {
  let _value = props.value;
  if (value) {
    _value = Object.assign(_value, value);
  }
  emit("update:value", _value);
  emit("change");
};

const handleSelect = function (item: dropFileType) {
  if (item.selected) return;
  files.value = files.value.map((e) => {
    e.selected = item.id == e.id;
    return e;
  });
  formChange({
    file: item.file,
  });
};
</script>

<style lang="less" scoped>
@import url(./form.less);
.music-select {
  display: block !important;
  .line {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    span {
      display: flex;
      align-items: center;
      justify-content: center;
      i {
        padding-left: 0;
      }
    }
  }
}
</style>
