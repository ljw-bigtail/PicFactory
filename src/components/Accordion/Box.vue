<template>
  <div class="accordion content-scroll">
    <div
      v-for="(t, index) in defaults"
      @click="select(t.key)"
      :key="index + t.key"
      :class="['accordion__item', t.key === selected ? 'selected' : '']"
    >
      <div class="accordion__item__header">
        <span>{{ t.title }}</span>
        <span :class="['css-icon', t.key === selected ? 'bottom' : 'right']"></span>
      </div>
      <div class="accordion__item__body">
        <component :is="t.content" :key="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from "vue";
// import accordionPanel from "./panel.vue";

const props = defineProps({ selected: String });
const emit = defineEmits(["update:selected"]);
const defaults = ref();

const context = getCurrentInstance();

onMounted(function () {
  const slots = context?.slots;
  if (!slots || !slots.default) return;
  let child: any = slots.default();
  if (child.length == 0) return;
  if (child.length == 1) {
    // fix: 循环 accordionpanel 的情况
    child = child[0].children;
  }
  defaults.value = child
    .filter((tag: { props: string }) => {
      // if (tag.type !== accordionPanel) {
      //   throw new Error("accordion 子标签名必须是 accordionPanel");
      // }
      if (!tag.props) {
        return false;
      }
      // if (child.length != _child.length) {
      //   console.error("accordionPanel 参数不全 ");
      // }
      const keys = Object.keys(tag.props);
      return keys.includes("key") && keys.includes("title");
    })
    .map((tag: { props: { title: string; key: string } }) => {
      return {
        title: tag.props?.title,
        key: tag.props?.key,
        content: tag,
      };
    });
});

const select = (key: string) => {
  if (props.selected == key) {
    emit("update:selected", "");
  } else {
    emit("update:selected", key);
  }
};
</script>

<style lang="less" scoped>
.accordion {
  &__item {
    box-shadow: var(--shadow);
    margin-bottom: var(--space-1);
    border-radius: var(--radius-mini);
    &__header {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-1);
      padding-left: var(--space-2);
    }
    &__body {
      display: none;
      padding: var(--space-1);
      padding-top: 0;
      border-top: var(--border);
    }
    &.selected {
      .accordion__item__body {
        display: block;
      }
    }
  }
}
</style>
