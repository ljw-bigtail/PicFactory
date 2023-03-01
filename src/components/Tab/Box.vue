<template>
  <div :class="['tab', direction === 'row' ? 'row' : 'column']">
    <div class="tab__header">
      <div class="tab__header__wrapper">
        <div
          v-for="(t, index) in titles"
          @click="select(t.key)"
          :key="index + t.key"
          :class="['tab__header__wrapper__item', t.key === selected ? 'selected' : '']"
        >
          <img :src="t.icon" v-if="t.icon && t.icon != ''" />
          <span>
            {{ t.title }}
          </span>
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
import { ref, onMounted, getCurrentInstance, VNode } from "vue";
import { Panel } from "./index";

defineProps({
  selected: {
    type: String,
    // default: "",
  },
  direction: {
    type: String,
    default: "column",
  },
});

const emit = defineEmits(["update:selected"]);
const defaults = ref();
const titles = ref();

const context = getCurrentInstance();

onMounted(function () {
  const slots = context?.slots;
  if (!slots || !slots.default) return;
  let child: any[] = slots.default();
  if (child.length == 0) return;
  if (child.length == 1) {
    // fix: 循环 tabpanel 的情况
    child = child[0].children;
  }
  const _child = child.filter((tag: { props: object; type: VNode }) => {
    // if (tag.type !== Panel) {
    //   throw new Error("Tab 子标签名必须是 Tab.Panel");
    // }
    if (!tag.props) {
      return false;
    }
    const keys = Object.keys(tag.props);
    return keys.includes("key") && keys.includes("title");
  });
  if (child.length != _child.length) {
    throw new Error("Tab.Panel 参数不全");
  }
  const childTitles = _child.map(
    (tag: { props: { title: string; icon?: string; key: string } }) => {
      return {
        title: tag.props.title,
        icon: tag.props?.icon,
        key: tag.props.key,
      };
    }
  );
  defaults.value = _child;
  titles.value = childTitles;
});

const select = (key: string) => {
  emit("update:selected", key);
};
</script>

<style lang="less" scoped>
.tab {
  display: flex;
  height: 100%;
  &.column {
    flex-direction: column;
    .tab__header {
      &__wrapper {
        flex-wrap: nowrap;
        align-items: flex-end;
        &__item {
          padding: 1rem 2rem;
          margin: 0 1rem;
          &::after {
            content: "";
            display: block;
            height: 0.3rem;
            width: 70%;
            border-radius: var(--radius);
            position: absolute;
            bottom: 4px;
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
  }
  &.row {
    flex-direction: row;
    height: 100%;
    .tab__header {
      &__wrapper {
        flex-direction: column;
        &__item {
          padding: 1rem 2rem;
          background-color: var(--color-bg);
          color: var(--color-text);
          &:hover,
          &.selected {
            background-color: var(--color-B);
            color: var(--color-text-re);
          }
          &:hover {
            filter: brightness(1.1);
          }
        }
      }
    }
    .tab__body {
      flex: 1;
      height: 100%;
      overflow-y: auto;
    }
  }
  &__header {
    background-color: var(--color-bg);
    &__wrapper {
      display: flex;
      width: max-content;
      &__item {
        cursor: pointer;
        position: relative;
        text-align: center;
        img {
          margin: 0 auto;
          width: 2rem;
          height: 2rem;
        }
      }
    }
  }
  &__body {
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
    padding: 0 var(--space-1);
    flex: 1;
  }
}
</style>
