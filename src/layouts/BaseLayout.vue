<template>
  <div :class="['layout', openFooter ? 'open-footer' : '']">
    <div class="header">
      <div class="title" @click="goHome()">
        <slot name="header"></slot>
      </div>
      <div class="btn-group right">
        <slot name="menu"></slot>
        <button
          :class="['button', tool.classname]"
          v-for="tool in tools"
          :key="tool.key"
          v-show="tool.key !== currentTool"
        >
          <a :href="tool.link">{{ tool.name }}</a>
        </button>
        <!-- <button class="button" @click="toggleFooter">{{ openFooter ? "关闭" : "打开" }}Log</button> -->
        <button class="button" @click="showVersion">日志{{ version[0].number }}</button>
      </div>
    </div>
    <div class="main flex-box">
      <slot name="main"></slot>
    </div>
    <div class="footer">
      <slot name="footer"></slot>
    </div>
  </div>
  <Dialog manner="mac" v-model:show="versionDialog" title="版本记录">
    <template v-slot:content>
      <div class="versionList">
        <div v-for="item in version">
          <h5>{{ item.number }}</h5>
          <div v-html="item.content"></div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, readonly } from "vue";
import { Cache } from "@/utils/utils";
import { Dialog } from "@/components";
import versionData from "@/version.json";

// const prop = defineProps();

// 底部
const cacheKey = "sys-opt-cache";
const openFooter = ref(Cache.get(cacheKey)["open-footer"]);
const toggleFooter = function () {
  openFooter.value = !openFooter.value;
  Cache.set(cacheKey, {
    "open-footer": openFooter.value,
  });
};

const goHome = () => {
  window.location.href = "/";
};

const tools = readonly([
  {
    name: "鹿酒的博客",
    classname: "B",
    link: "/blog/",
    key: "鹿酒的博客",
  },
  {
    name: "拼图工具",
    classname: "C",
    link: "./collage.html",
    key: "collage",
  },
  {
    name: "GIF工具",
    classname: "C",
    link: "./gif.html",
    key: "gif",
  },
  {
    name: "商品迁移",
    classname: "C",
    link: "./csv-move.html",
    key: "csv-move",
  },
  {
    name: "格式转换",
    classname: "A",
    link: "./conversion.html",
    key: "conversion",
  },
]);

const getTool = (() => {
  const tool = tools.filter((e) => {
    return window.location.pathname.indexOf(e.key) > 0;
  })[0];

  return tool ? tool.key : "";
})();
const currentTool = ref(getTool);

const showVersion = () => {
  versionDialog.value = true;
};
const version = ref(versionData.version.reverse());
const versionDialog = ref(false);
</script>

<style lang="less">
@import url("../style/common.less");
.layout {
  position: relative;
  height: 100vh;
  &::-webkit-scrollbar {
    display: none;
  }
  &,
  & > * {
    max-width: var(--max-width);
    margin: 0 auto;
    width: 100%;
  }
  & > .header {
    height: var(--header-height);
    border-bottom: var(--border-main);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-1) 0;
    position: sticky;
    left: 0;
    top: 0;
    background-color: #fff;
    z-index: 2000;
    .title {
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: var(--title-size);
      font-weight: 700;
      &::before {
        content: "";
        display: inline-block;
        margin-right: var(--space-1);
        width: 80px;
        height: calc(var(--title-size) * 1.6);
        background-color: var(--color-black);
        border-top-left-radius: var(--title-size);
        border-bottom-left-radius: var(--title-size);
      }
    }
  }
  & > .main {
    padding-top: var(--space-1);
    height: calc(100vh - var(--header-height) - var(--space-2));
    background-color: #fff;
    box-sizing: border-box;
    justify-content: center;
  }
  & > .footer {
    box-shadow: var(--shadow);
    height: calc(var(--header-height) * 2);
    position: absolute;
    left: 0;
    bottom: 0;
    padding: var(--space-1);
    background-color: #fff;
    z-index: 2000;
    transition: all 0.7s;
    opacity: 0;
    transform: translateY(100%);
  }
  &.open-footer {
    & > .main {
      margin-bottom: calc(var(--header-height) * 2 + var(--space-2));
      height: calc(100vh - var(--header-height) * 3 - var(--space-4));
    }
    & > .footer {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
.versionList {
  text-align-last: left;
  padding: 1rem 2rem;
  > div {
    border-bottom: var(--border);
    border-style: dashed;
    padding: 1rem 0;
    &:last-child {
      border-bottom: none;
    }
    h5 {
      font-size: 1.4rem;
      line-height: 2rem;
    }
    p {
      line-height: 1.6rem;
    }
  }
}
</style>
