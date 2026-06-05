<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { onMounted } from 'vue'

const app = useAppStore()
onMounted(() => app.setActiveModule('parking'))
</script>

<template>
  <div class="module-page">
    <div class="page-overlay">
      <h2>停车管理</h2>
      <p>车位实时状态 · 占用率统计 · 智能引导</p>
    </div>
    <div class="placeholder-card">
      <div class="card-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M6 5V3" />
          <path d="M18 5V3" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="16" cy="12" r="2" />
          <path d="M8 12h4" />
        </svg>
      </div>
      <p class="card-title">停车管理开发中</p>
      <p class="card-desc">
        实时展示停车场各车位占用状态，支持车辆进出记录查询、 智能空位引导和占用率趋势分析。
      </p>
    </div>
  </div>
</template>

<style scoped>
.module-page {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
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

.placeholder-card {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  background: rgba(13, 27, 42, 0.9);
  border: 1px solid rgba(79, 195, 247, 0.2);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  max-width: 360px;
}

.card-icon {
  color: #66bb6a;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  color: #90a4ae;
  margin: 0 0 8px 0;
}

.card-desc {
  font-size: 13px;
  color: #546e7a;
  line-height: 1.6;
  margin: 0;
}
</style>
