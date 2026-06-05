<script setup lang="ts">
import { useAppStore, type AlertItem } from '@/stores/app'
import { onMounted } from 'vue'

const app = useAppStore()
onMounted(() => app.setActiveModule('alert'))

function typeLabel(type: AlertItem['type']): string {
  return { error: '严重', warning: '警告', info: '提示' }[type]
}
function typeClass(type: AlertItem['type']): string {
  return `alert-${type}`
}
</script>

<template>
  <div class="module-page">
    <div class="page-overlay">
      <h2>告警中心</h2>
      <p>设备告警联动 · 实时推送 · 闭环处置</p>
    </div>
    <div class="alert-panel">
      <div class="panel-inner">
        <div class="panel-header">
          <span class="panel-title">活跃告警 ({{ app.alerts.length }})</span>
        </div>
        <div class="alert-list">
          <div
            v-for="alert in app.alerts"
            :key="alert.id"
            class="alert-item"
            :class="typeClass(alert.type)"
          >
            <div class="alert-left">
              <span class="alert-type-tag" :class="typeClass(alert.type)">
                {{ typeLabel(alert.type) }}
              </span>
            </div>
            <div class="alert-body">
              <p class="alert-msg">{{ alert.message }}</p>
              <p class="alert-meta">{{ alert.device }} · {{ alert.time }}</p>
            </div>
            <button class="alert-dismiss" @click="app.clearAlert(alert.id)">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.module-page {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

.page-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: auto;
}

.page-overlay h2 {
  font-size: 20px;
  font-weight: 600;
  color: #eceff1;
  margin: 0 0 4px 0;
}

.page-overlay p {
  font-size: 13px;
  color: #78909c;
  margin: 0;
}

.alert-panel {
  position: absolute;
  top: 80px;
  right: 16px;
  pointer-events: auto;
  width: 340px;
  max-height: calc(100vh - 150px);
  background: rgba(13, 27, 42, 0.95);
  border: 1px solid rgba(79, 195, 247, 0.15);
  border-radius: 10px;
  overflow: hidden;
}

.panel-inner {
  padding: 12px;
}

.panel-header {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 8px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #b0bec5;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 360px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 3px solid transparent;
}

.alert-item.alert-error {
  border-left-color: #ef5350;
}

.alert-item.alert-warning {
  border-left-color: #ffa726;
}

.alert-item.alert-info {
  border-left-color: #42a5f5;
}

.alert-type-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.alert-error .alert-type-tag {
  background: rgba(239, 83, 80, 0.15);
  color: #ef5350;
}

.alert-warning .alert-type-tag {
  background: rgba(255, 167, 38, 0.15);
  color: #ffa726;
}

.alert-info .alert-type-tag {
  background: rgba(66, 165, 245, 0.15);
  color: #42a5f5;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-msg {
  font-size: 13px;
  color: #b0bec5;
  margin: 0 0 2px 0;
}

.alert-meta {
  font-size: 11px;
  color: #546e7a;
  margin: 0;
  font-family: 'Consolas', monospace;
}

.alert-dismiss {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #546e7a;
  cursor: pointer;
  flex-shrink: 0;
}

.alert-dismiss:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #b0bec5;
}
</style>
