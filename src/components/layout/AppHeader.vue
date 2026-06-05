<script setup lang="ts">
import { useExamplesStore } from '@/stores/examples'
import { useRouter } from 'vue-router'
import type { CategoryId } from '@/types/examples'

const store = useExamplesStore()
const router = useRouter()

function goHome() {
  router.push('/')
}

function selectCategory(category: CategoryId) {
  store.setCategory(category)
  const firstExample = store.currentExamples[0]
  if (firstExample) {
    store.selectExample(firstExample)
    router.push(`/example/${category}/${firstExample.id}`)
  }
}

const reservedTabs = [
  { key: 'threejs', label: 'Three.js', disabled: true },
  { key: 'webgl', label: 'WebGL', disabled: true },
]
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="store.toggleSidebar">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <span class="logo" @click="goHome">Cesium Examples</span>
    </div>
    <nav class="header-nav">
      <button v-for="cat in store.categories" :key="cat.id" class="nav-tab"
        :class="{ active: store.activeCategory === cat.id }" @click="selectCategory(cat.id)">
        <span class="nav-icon">{{ cat.icon }}</span>
        {{ cat.name }}
      </button>
      <span class="nav-divider">|</span>
      <button v-for="tab in reservedTabs" :key="tab.key" class="nav-tab disabled" :disabled="tab.disabled">
        {{ tab.label }}
      </button>
    </nav>
    <div class="header-right">
      <span class="example-count">共 {{ store.totalCount }} 个示例</span>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 12px;
  background: #111d2e;
  border-bottom: 1px solid rgba(79, 195, 247, 0.12);
  flex-shrink: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid rgba(79, 195, 247, 0.2);
  border-radius: 4px;
  color: #6b8cae;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-toggle:hover {
  color: #4fc3f7;
  border-color: #4fc3f7;
}

.logo {
  font-size: 16px;
  font-weight: 700;
  color: #4fc3f7;
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.5px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 24px;
  flex: 1;
}

.nav-tab {
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b8cae;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0;
  white-space: nowrap;
}

.nav-tab:hover {
  color: #b0bec5;
  background: rgba(79, 195, 247, 0.06);
}

.nav-tab.active {
  color: #4fc3f7;
  border-bottom-color: #4fc3f7;
}

.nav-tab.disabled {
  color: #3a5068;
  cursor: not-allowed;
  opacity: 0.5;
}

.nav-tab.disabled:hover {
  background: transparent;
}

.nav-icon {
  margin-right: 4px;
  font-size: 14px;
}

.nav-divider {
  color: #253547;
  margin: 0 4px;
  user-select: none;
}

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.example-count {
  font-size: 12px;
  color: #4a6580;
}
</style>
