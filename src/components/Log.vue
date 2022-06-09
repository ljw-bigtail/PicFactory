<template>
  <div id="log">
    <h3 class="title">日志：</h3>
    <div class="log-mes">
      <ul>
        <li v-for="item in logs" :key="item.timestamp">
          {{ item.timestamp }}
          <br />
          {{ item.value }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ logs: { value: string; timestamp: string }[] }>();
</script>

<style scoped lang="less">
#log {
  border: 1px dashed #ccc;
  text-align: left;
  font-size: 0.8em;
  display: flex;
  align-items: flex-start;
  overflow: hidden;
  h3 {
    padding: 12px;
    font-weight: normal;
  }
  .log-mes {
    flex: 1;
    height: calc(var(--header-height) * 2);
    overflow-y: scroll;
    border-left: 1px dashed #ccc;
    padding-left: var(--space-1);
    ul {
      padding: var(--space-1) 0;
      min-height: 100%;
      height: max-content;
      li {
        padding-bottom: var(--space-1);
      }
    }
  }
}
</style>
