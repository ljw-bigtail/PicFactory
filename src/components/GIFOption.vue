<template>
  <div id="size-form">
    <div>
      <label>宽 / 高：</label>
      <input type="number" name="width" v-model="value.width" @change="formChange" />
      px
      <i> / </i>
      <input type="number" name="height" v-model="value.height" @change="formChange" />
      px
    </div>
    <div>
      <label for="rule">截取规则：</label>
      <div>
        <input
          type="radio"
          name="rule"
          :value="1"
          v-model="value.rule"
          @change="formChange"
        />
        放大至GIF尺寸
        <input
          type="radio"
          name="rule"
          :value="2"
          v-model="value.rule"
          @change="formChange"
        />
        等比缩小
        <input
          type="radio"
          name="rule"
          :value="3"
          v-model="value.rule"
          @change="formChange"
        />
        等比放大
      </div>
    </div>
    <div>
      <label for="background">背景色：</label>
      <input
        type="color"
        name="background"
        v-model="value.background"
        @change="formChange"
      />
    </div>
    <div>
      <label for="delay">停留时间：</label>
      <input
        type="number"
        name="delay"
        min="0"
        placeholder="停留时间 毫秒"
        v-model="value.delay"
        @change="formChange"
      />
    </div>
    <div>
      <label for="repeat">重复次数：</label>
      <input
        type="number"
        name="repeat"
        min="-1"
        placeholder="-1 never 0 ever or number"
        v-model="value.repeat"
        @change="formChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
type GIFOption = {
  width: number;
  height: number;
  repeat: number;
  delay: number;
  background: string;
  rule: number;
};

const props = defineProps<{ value: GIFOption }>();
const emit = defineEmits(["change"]);

const formChange = function () {
  emit("change", props.value);
};
</script>

<style lang="less" scoped>
#size-form {
  margin: var(--space-1);
  font-size: var(--min-size);
  box-sizing: border-box;
  & > div {
    margin-top: var(--space-1);
    text-align: left;
    display: flex;
    align-items: center;
    label {
      width: 25%;
      display: inline-block;
      text-align: right;
    }
    i {
      list-style: none;
      padding-left: var(--space-1);
    }
    input {
      border-radius: var(--radius);
      margin: 0 var(--space-1);
      &:not([type="color"]) {
        padding: 6px 12px;
        line-height: 18px;
        font-size: 14px;
        flex: 1;
      }
    }
  }
}
</style>
