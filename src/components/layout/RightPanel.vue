<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { useMapStore } from '@/stores/map'

const app = useAppStore()
const map = useMapStore()

const panelTitle = computed(() => {
  switch (app.rightPanelType) {
    case 'info':
      return '实体信息'
    case 'stats':
      return '实时统计'
    case 'settings':
      return '图层设置'
    default:
      return ''
  }
})

const layers = [
  { key: 'heatmap' as const, label: '人流热力', color: '#EF5350' },
  { key: 'video' as const, label: '视频融合', color: '#42A5F5' },
  { key: 'parking' as const, label: '停车状态', color: '#66BB6A' },
  { key: 'device' as const, label: '设备点位', color: '#FFA726' },
]
</script>

<template>
  <Transition name="panel-slide">
    <aside v-if="app.rightPanelVisible" class="right-panel">
      <div class="panel-header">
        <h3>{{ panelTitle }}</h3>
        <button class="close-btn" @click="app.closeRightPanel()">
          <svg
            width="16"
            height="16"
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

      <div class="panel-content">
        <!-- 实体信息 -->
        <template v-if="app.rightPanelType === 'info'">
          <div v-if="!map.selectedEntity" class="empty-state">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              opacity="0.3"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="13" y2="13" />
            </svg>
            <p>点击地图上的实体查看详情</p>
          </div>
          <div v-else class="entity-info">
            <div class="info-row">
              <span class="label">ID</span><span class="value">{{ map.selectedEntity }}</span>
            </div>
            <div class="info-row">
              <span class="label">类型</span><span class="value">建筑</span>
            </div>
            <div class="info-row">
              <span class="label">状态</span><span class="value status-ok">正常</span>
            </div>
          </div>
        </template>

        <!-- 实时统计 -->
        <template v-if="app.rightPanelType === 'stats'">
          <div class="stat-cards">
            <div class="stat-card">
              <div class="stat-value">1,284</div>
              <div class="stat-label">在线设备</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">47.2<span class="unit">kWh</span></div>
              <div class="stat-label">实时能耗</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">86<span class="unit">%</span></div>
              <div class="stat-label">停车占用</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">3</div>
              <div class="stat-label">活跃告警</div>
            </div>
          </div>
        </template>

        <!-- 图层设置 -->
        <template v-if="app.rightPanelType === 'settings'">
          <div class="layer-list">
            <div
              v-for="layer in layers"
              :key="layer.key"
              class="layer-item"
              :class="{ active: map.visibleLayers.has(layer.key) }"
              @click="map.toggleLayer(layer.key)"
            >
              <span class="layer-dot" :style="{ background: layer.color }" />
              <span class="layer-label">{{ layer.label }}</span>
              <span class="layer-toggle">
                <span class="toggle-track">
                  <span class="toggle-thumb" :class="{ on: map.visibleLayers.has(layer.key) }" />
                </span>
              </span>
            </div>
          </div>
        </template>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
.right-panel {
  width: 280px;
  min-width: 280px;
  background: linear-gradient(180deg, #0d1b2a 0%, #0a1628 100%);
  border-left: 1px solid rgba(79, 195, 247, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.panel-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #b0bec5;
  margin: 0;
}
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #546e7a;
  cursor: pointer;
  transition: all 0.2s;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #b0bec5;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #546e7a;
  text-align: center;
  gap: 12px;
  font-size: 13px;
}

.entity-info .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 13px;
}
.info-row .label {
  color: #78909c;
}
.info-row .value {
  color: #b0bec5;
  font-family: 'Consolas', monospace;
}
.status-ok {
  color: #66bb6a !important;
}

.stat-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 14px;
  text-align: center;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #4fc3f7;
  font-family: 'Consolas', monospace;
}
.stat-value .unit {
  font-size: 14px;
  font-weight: 400;
  color: #78909c;
  margin-left: 2px;
}
.stat-label {
  font-size: 12px;
  color: #78909c;
  margin-top: 4px;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.layer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}
.layer-item:hover {
  background: rgba(255, 255, 255, 0.03);
}
.layer-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.layer-label {
  flex: 1;
  font-size: 13px;
  color: #90a4ae;
}
.toggle-track {
  display: block;
  width: 34px;
  height: 20px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #546e7a;
  transition: all 0.2s;
}
.toggle-thumb.on {
  left: 16px;
  background: #4fc3f7;
}

.panel-slide-leave-active {
  transition: all 0.2s ease;
}
.panel-slide-leave-to {
  width: 0;
  min-width: 0;
  opacity: 0;
}
</style>
