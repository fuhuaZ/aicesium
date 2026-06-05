<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const app = useAppStore()

interface NavItem {
  key: string
  path: string
  label: string
}

const navItems: NavItem[] = [
  { key: 'dashboard', path: '/', label: '园区总览' },
  { key: 'heatmap', path: '/heatmap', label: '人流热力' },
  { key: 'energy', path: '/energy', label: '能耗监控' },
  { key: 'video', path: '/video', label: '视频融合' },
  { key: 'parking', path: '/parking', label: '停车管理' },
  { key: 'alert', path: '/alert', label: '告警中心' },
  { key: 'analysis', path: '/analysis', label: '空间分析' },
]

function navigate(item: NavItem) {
  app.setActiveModule(item.key)
  router.push(item.path)
}
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: app.sidebarCollapsed }">
    <nav class="nav-list">
      <div
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ active: app.activeModule === item.key }"
        @click="navigate(item)"
        :title="item.label"
      >
        <!-- 园区总览 -->
        <svg
          v-if="item.key === 'dashboard'"
          class="nav-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <!-- 人流热力 -->
        <svg
          v-else-if="item.key === 'heatmap'"
          class="nav-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="2" />
          <circle cx="8" cy="16" r="2" />
          <circle cx="16" cy="16" r="3" />
        </svg>
        <!-- 能耗监控 -->
        <svg
          v-else-if="item.key === 'energy'"
          class="nav-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <!-- 视频融合 -->
        <svg
          v-else-if="item.key === 'video'"
          class="nav-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <!-- 停车管理 -->
        <svg
          v-else-if="item.key === 'parking'"
          class="nav-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="16" cy="12" r="2" />
          <path d="M8 12h4" />
        </svg>
        <!-- 告警中心 -->
        <svg
          v-else-if="item.key === 'alert'"
          class="nav-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <!-- 空间分析 -->
        <svg
          v-else-if="item.key === 'analysis'"
          class="nav-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        <span v-show="!app.sidebarCollapsed" class="nav-label">{{ item.label }}</span>
      </div>
    </nav>

    <div v-show="!app.sidebarCollapsed" class="sidebar-footer">
      <div class="sys-status">
        <div class="status-dot online" />
        <span>系统运行中</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  width: 200px;
  min-width: 200px;
  background: linear-gradient(180deg, #0d1b2a 0%, #0a1628 100%);
  border-right: 1px solid rgba(79, 195, 247, 0.1);
  transition:
    width 0.25s ease,
    min-width 0.25s ease;
  overflow: hidden;
  flex-shrink: 0;
}
.app-sidebar.collapsed {
  width: 56px;
  min-width: 56px;
}

.nav-list {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #78909c;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 14px;
}
.nav-item:hover {
  background: rgba(79, 195, 247, 0.08);
  color: #b0bec5;
}
.nav-item.active {
  background: rgba(79, 195, 247, 0.15);
  color: #4fc3f7;
}

.nav-icon {
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.sys-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #546e7a;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-dot.online {
  background: #66bb6a;
  box-shadow: 0 0 6px rgba(102, 187, 106, 0.6);
}
</style>
