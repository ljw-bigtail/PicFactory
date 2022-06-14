<template>
  <div class="tab content-scroll">
    <div class="tab__header">
      <div class="tab__header__wrapper">
        <div
          v-for="(t, index) in titles"
          @click="select(t.key)"
          :key="index + t.key"
          :class="['tab__header__wrapper__item', t.key === selected ? 'selected' : '']"
        >
          {{ t.title }}
        </div>
      </div>
    </div>
    <div class="tab__body">
      <component
        v-for="(c, index) in defaults"
        :is="c"
        :key="index"
        :class="['tab__body__item', c.props.key === selected ? 'selected' : '']"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from "vue";
import TabPanel from "./panel.vue";

const props = defineProps({ selected: String });
const emit = defineEmits(["update:selected"]);
const defaults = ref();
const titles = ref();

const context = getCurrentInstance();

onMounted(function () {
  const slots = context?.slots;
  if (!slots || !slots.default) return;
  const child = slots.default();
  const childTitles = child.map((tag) => {
    // if (tag.type !== TabPanel) {
    //   throw new Error("Tab 子标签名必须是 TabPanel");
    // }
    return {
      title: tag.props?.title,
      key: tag.props?.key,
    };
  });
  defaults.value = child;
  titles.value = childTitles;
});

const select = (key: string) => {
  emit("update:selected", key);
};
</script>

<style lang="less" scoped>
.tab {
  &__header {
    &__wrapper {
      display: flex;
      flex-wrap: nowrap;
      align-items: flex-end;
      &__item {
        margin: 0 var(--space-1);
        padding: 0 var(--space-3) var(--space-1);
        cursor: pointer;
        position: relative;
        &::after {
          content: "";
          display: block;
          height: 3px;
          width: 70%;
          border-radius: 1px;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        &:hover,
        &.selected {
          &::after {
            background-color: var(--color-B);
          }
        }
        &:hover {
          &::after {
            opacity: 0.3;
          }
        }
      }
    }
  }
  &.content-scroll {
    height: 100%;
    display: flex;
    flex-direction: column;
    .tab__body {
      overflow-y: auto;
      overflow-x: hidden;
      box-sizing: border-box;
      padding: 0 var(--space-1) var(--space-2);
      margin-top: var(--space-1);
    }
  }
}
</style>
