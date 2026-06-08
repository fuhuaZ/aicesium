<script setup lang="ts">
import { computed, ref } from 'vue'
import { useExamplesStore } from '@/stores/examples'

const store = useExamplesStore()
const collapsed = ref(false)
const copied = ref(false)

const displayCode = computed(() => store.activeCode || '// 请从左侧选择一个示例')

async function copyCode() {
  if (!store.activeCode) return
  try {
    await navigator.clipboard.writeText(store.activeCode)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // fallback
  }
}
</script>

<template>
  <div class="code-panel" :class="{ collapsed }" :style="collapsed ? { height: '36px' } : undefined">
    <div class="code-header" @click="collapsed = !collapsed">
      <div class="code-header-left">
        <span class="code-title">
          {{ store.activeExample ? store.activeExample.title : '源代码' }}
        </span>
        <span class="code-lang">TypeScript</span>
      </div>
      <div class="code-header-right">
        <button v-if="store.activeCode" class="code-btn" @click.stop="copyCode">
          {{ copied ? '已复制' : '复制' }}
        </button>
        <button class="code-btn toggle-btn">
          {{ collapsed ? '展开' : '折叠' }}
        </button>
      </div>
    </div>
    <pre class="code-body" v-show="!collapsed"><code>{{ displayCode }}</code></pre>
  </div>
</template>

<style scoped>
.code-panel {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(79, 195, 247, 0.15);
  background: #0a1628;
  min-height: 36px;
  flex-shrink: 0;
  overflow: hidden;
}
.code-panel.collapsed {
  min-height: 36px !important;
}
.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  background: #0d1a2d;
}
.code-header:hover {
  background: rgba(79, 195, 247, 0.04);
}
.code-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.code-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b8cae;
}
.code-lang {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(79, 195, 247, 0.1);
  color: #4fc3f7;
  border-radius: 3px;
}
.code-header-right {
  display: flex;
  gap: 4px;
}
.code-btn {
  padding: 2px 8px;
  font-size: 11px;
  background: rgba(79, 195, 247, 0.08);
  border: 1px solid rgba(79, 195, 247, 0.15);
  border-radius: 3px;
  color: #6b8cae;
  cursor: pointer;
  transition: all 0.15s;
}
.code-btn:hover {
  background: rgba(79, 195, 247, 0.15);
  color: #4fc3f7;
}
.code-body {
  flex: 1;
  overflow: auto;
  margin: 0;
  padding: 12px 16px;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #b0bec5;
  background: #0a1628;
  tab-size: 2;
  white-space: pre;
}
</style>
