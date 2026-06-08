<script setup lang="ts">
import { computed } from 'vue'
import { useExamplesStore } from '@/stores/examples'
import { useRouter } from 'vue-router'
import { getExampleById } from '@/examples/registry'
import type { TreeOption } from 'naive-ui'

const store = useExamplesStore()
const router = useRouter()

const selectedKeys = computed(() => (store.activeExample ? [store.activeExample.id] : []))

function handleNodeSelect(keys: string[], _option: TreeOption[]) {
  const key = keys[0]
  if (!key || key.startsWith('cat-')) return
  const example = getExampleById(key)
  if (example) {
    store.selectExample(example)
    router.push(`/example/${example.tech}/${example.category}/${example.id}`)
  }
}
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: store.sidebarCollapsed }">
    <div class="sidebar-inner">
      <div v-if="!store.sidebarCollapsed" class="sidebar-tree">
        <n-tree
          block-line
          :data="store.treeData"
          :selected-keys="selectedKeys"
          :selectable="true"
          expand-on-click
          @update:selected-keys="handleNodeSelect"
        />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #0d1a2d;
  border-right: 1px solid rgba(79, 195, 247, 0.1);
  transition: width 0.25s ease;
  overflow: hidden;
}

.app-sidebar.collapsed {
  width: 48px;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px 4px;
}
</style>
