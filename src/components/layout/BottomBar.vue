<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useMapStore } from '@/stores/map'

const app = useAppStore()
const map = useMapStore()
</script>

<template>
  <footer class="bottom-bar">
    <div class="bottom-left">
      <div class="tool-group">
        <button
          class="tool-btn"
          :class="{ active: map.activeTool === 'pan' }"
          @click="map.setTool(map.activeTool === 'pan' ? null : 'pan')"
          title="平移"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="5 9 2 12 5 15" />
            <polyline points="9 5 12 2 15 5" />
            <polyline points="15 19 12 22 9 19" />
            <polyline points="19 9 22 12 19 15" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
        </button>
        <button
          class="tool-btn"
          :class="{ active: map.activeTool === 'measure' }"
          @click="map.setTool(map.activeTool === 'measure' ? null : 'measure')"
          title="测量"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"
            />
            <path d="m14.5 12.5 2-2" />
            <path d="m11.5 9.5 2-2" />
            <path d="m8.5 6.5 2-2" />
            <path d="m17.5 15.5 2-2" />
          </svg>
        </button>
        <button
          class="tool-btn"
          :class="{ active: map.activeTool === 'pick' }"
          @click="map.setTool(map.activeTool === 'pick' ? null : 'pick')"
          title="拾取"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m15 15-2 5L9 9l11 4-5 2Z" />
            <path d="M9 9L4 20l4-2" />
          </svg>
        </button>
        <button
          class="tool-btn"
          :class="{ active: map.activeTool === 'viewshed' }"
          @click="map.setTool(map.activeTool === 'viewshed' ? null : 'viewshed')"
          title="可视域"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      <span class="sep" />

      <div class="layer-toggles">
        <button
          v-for="layer in [
            { key: 'heatmap' as const, label: '热力' },
            { key: 'video' as const, label: '视频' },
            { key: 'parking' as const, label: '停车' },
            { key: 'device' as const, label: '设备' },
          ]"
          :key="layer.key"
          class="layer-chip"
          :class="{ active: map.visibleLayers.has(layer.key) }"
          @click="map.toggleLayer(layer.key)"
        >
          {{ layer.label }}
        </button>
      </div>
    </div>

    <div class="bottom-right">
      <button class="action-btn" @click="app.openRightPanel('stats')" title="实时统计">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        统计
      </button>
      <button class="action-btn" @click="app.openRightPanel('settings')" title="图层管理">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <line x1="12" y1="22" x2="12" y2="15.5" />
          <polyline points="22 8.5 12 15.5 2 8.5" />
        </svg>
        图层
      </button>
    </div>
  </footer>
</template>

<style scoped>
.bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  background: rgba(13, 27, 42, 0.95);
  border-top: 1px solid rgba(79, 195, 247, 0.1);
  z-index: 100;
  flex-shrink: 0;
}

.bottom-left,
.bottom-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-group {
  display: flex;
  gap: 2px;
}
.tool-btn {
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
  transition: all 0.15s;
}
.tool-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  color: #90a4ae;
}
.tool-btn.active {
  background: rgba(79, 195, 247, 0.2);
  color: #4fc3f7;
}

.sep {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 8px;
}

.layer-toggles {
  display: flex;
  gap: 4px;
}
.layer-chip {
  padding: 2px 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: transparent;
  color: #546e7a;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.layer-chip:hover {
  border-color: rgba(79, 195, 247, 0.3);
  color: #90a4ae;
}
.layer-chip.active {
  border-color: #4fc3f7;
  background: rgba(79, 195, 247, 0.15);
  color: #4fc3f7;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #546e7a;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  color: #90a4ae;
}
</style>
