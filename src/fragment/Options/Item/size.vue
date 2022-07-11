<template>
  <div class="size">
    <div class="size-input">
      <input
        type="number"
        name="width"
        min="0"
        v-model="value.width"
        @change="inputHandler()"
      />
      <input
        type="number"
        name="height"
        min="0"
        v-model="value.height"
        @change="inputHandler()"
      />
      <span>px</span>
    </div>
    <div class="size-select">
      <select @change="selectHandler" v-model="selectVal">
        <option
          :key="opt.name"
          :value="opt.width + '&' + opt.height"
          v-for="(opt, index) in selectOption"
          :disabled="index == 0"
          v-show="index != 1"
        >
          {{ opt.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

type SizeOption = {
  width: number;
  height: number;
};

const props = defineProps<{ value: SizeOption }>();

const emit = defineEmits(["update:value", "change"]);

const selectOption = [
  { name: "请选择" },
  { name: "自定义尺寸", width: -1, height: -1 },
  { name: "(1:1) 1200 x 1200 px", width: 1200, height: 1200 },
  { name: "(2:3) 1200 x 1800 px", width: 1200, height: 1800 },
  { name: "(3:2) 1800 x 1200 px", width: 1800, height: 1200 },
  { name: "(3:4) 1200 x 1600 px", width: 1200, height: 1600 },
  { name: "(4:3) 1600 x 1200 px", width: 1600, height: 1200 },
  { name: "(16:9) 1920 x 1080 px", width: 1920, height: 1080 },
  { name: "(9:16) 1080 x 1920 px", width: 1080, height: 1920 },
  { name: "(手机海报) 1242 x 2208 px", width: 1242, height: 2208 },
  { name: "(公众号首图) 900 x 383 px", width: 900, height: 383 },
];

const selectVal = ref(
  (function () {
    const initVal = `${props.value.width}&${props.value.height}`;
    return selectOption.map((e) => `${e.width}&${e.height}`).includes(initVal)
      ? initVal
      : "-1&-1";
  })()
);

const formChange = function (value?: SizeOption) {
  let _value = props.value;
  if (value) {
    _value = Object.assign(_value, value);
  }
  emit("change", _value);
  emit("update:value", _value);
};

const inputHandler = function () {
  selectVal.value = "-1&-1";
  formChange();
};

const selectHandler = function () {
  const arr = selectVal.value.split("&");
  if (arr.length == 0 || parseInt(arr[0]) < 0 || parseInt(arr[1]) < 0) {
    selectVal.value = "-1&-1";
  } else {
    formChange({
      width: parseInt(arr[0]),
      height: parseInt(arr[1]),
    });
  }
};
</script>

<style lang="less" scoped>
.size {
  display: flex;
  flex-direction: column;
  margin: 0 var(--space-1);
  &-input {
    display: flex;
    align-items: center;
    input {
      width: 80px;
      text-align: center;
      padding: 6px 12px;
      border-radius: var(--radius-mini);
      margin-right: var(--space-1);
    }
  }
  &-select {
    select {
      // width: 80px;
      text-align: center;
      padding: 6px 12px;
      border-radius: var(--radius-mini);
      margin-top: var(--space-1);
    }
  }
}
</style>
