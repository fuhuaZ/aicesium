<script setup lang="ts">
import { useExamplesStore } from '@/stores/examples'
import { useRouter } from 'vue-router'
import type { TechId } from '@/types/examples'

const store = useExamplesStore()
const router = useRouter()

function goHome() {
  router.push('/')
}

function selectTech(tech: TechId) {
  store.setTech(tech)
  router.push('/')
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="store.toggleSidebar">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <span class="logo" @click="goHome">3D Examples</span>
    </div>
    <nav class="header-nav">
      <n-button
        v-for="tech in store.technologies"
        :key="tech.id"
        :type="store.activeTech === tech.id ? 'primary' : 'default'"
        :disabled="!tech.enabled"
        size="small"
        :quaternary="store.activeTech !== tech.id"
        @click="selectTech(tech.id)"
      >
        <template #icon>
          <span class="nav-icon">{{ tech.icon }}</span>
        </template>
        {{ tech.name }}
        <span v-if="store.techCounts[tech.id]" class="tech-count">
          {{ store.techCounts[tech.id] }}
        </span>
      </n-button>
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
  gap: 4px;
  margin-left: 24px;
  flex: 1;
}

.nav-icon {
  font-size: 14px;
  margin-right: 2px;
}

.tech-count {
  font-size: 10px;
  margin-left: 4px;
  opacity: 0.7;
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
