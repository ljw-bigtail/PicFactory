<template>
  <div class="form">
    <div>
      <span>起始时间：</span>
      <div>
        <input
          type="number"
          name="start"
          v-model="value.start"
          @change="formChange"
        />
      </div>
    </div>
    <Line></Line>
    <div>
      '../../assets/music.mp3'
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import Line from "../../components/Line.vue";

import { MusicOption } from "../../type/video";

import music from '../../assets/music.mp3'

const props = defineProps<{ value: MusicOption }>();
const emit = defineEmits(["update:value", "change"]);

// TODO test 后面做成点击切换
onMounted(function(){
  formChange({
    file: music
  })
})

const formChange = function (value?: {}) {
  let _value = props.value;
  if (value) {
    _value = Object.assign(_value, value);
  }
  emit("update:value", _value);
  emit("change");
};
</script>

<style lang="less" scoped>
@import url(./form.less);
</style>
