<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExamplesStore } from '@/stores/examples'
import { useRouter } from 'vue-router'
import type { ExampleMeta } from '@/types/examples'

const store = useExamplesStore()
const router = useRouter()
const searchQuery = ref('')

const filteredExamples = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return store.currentExamples
  return store.currentExamples.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)),
  )
})

function selectExample(example: ExampleMeta) {
  store.selectExample(example)
  router.push(`/example/${example.category}/${example.id}`)
}
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: store.sidebarCollapsed }">
    <div class="sidebar-inner">
      <div v-if="!store.sidebarCollapsed" class="sidebar-search">
        <input v-model="searchQuery" type="text" placeholder="搜索示例..." class="search-input" />
      </div>
      <div v-if="!store.sidebarCollapsed" class="sidebar-title">
        {{ store.categories.find((c) => c.id === store.activeCategory)?.name }}
      </div>
      <nav class="sidebar-list">
        <button
          v-for="example in filteredExamples"
          :key="example.id"
          class="example-item"
          :class="{ active: store.activeExample?.id === example.id }"
          :title="store.sidebarCollapsed ? example.title : undefined"
          @click="selectExample(example)"
        >
          <span class="example-title">{{ example.title }}</span>
          <span v-if="!store.sidebarCollapsed" class="example-desc">{{ example.description }}</span>
        </button>
      </nav>
      <div v-if="!store.sidebarCollapsed && filteredExamples.length === 0" class="empty-hint">
        无匹配示例
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
.sidebar-search {
  padding: 10px;
  flex-shrink: 0;
}
.search-input {
  width: 100%;
  padding: 6px 10px;
  background: #0a1628;
  border: 1px solid rgba(79, 195, 247, 0.15);
  border-radius: 4px;
  color: #b0bec5;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input::placeholder {
  color: #3a5068;
}
.search-input:focus {
  border-color: #4fc3f7;
}
.sidebar-title {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #4fc3f7;
  text-transform: uppercase;
  letter-spacing: 1px;
  flex-shrink: 0;
}
.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}
.example-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-left: 3px solid transparent;
  color: #6b8cae;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  gap: 2px;
}
.example-item:hover {
  background: rgba(79, 195, 247, 0.06);
  color: #b0bec5;
}
.example-item.active {
  background: rgba(79, 195, 247, 0.08);
  color: #4fc3f7;
  border-left-color: #4fc3f7;
}
.example-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.example-desc {
  font-size: 11px;
  color: #3a5068;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.example-item.active .example-desc {
  color: #4a6580;
}
.empty-hint {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #3a5068;
}
</style>
