<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { onMounted } from 'vue'

const app = useAppStore()
onMounted(() => app.setActiveModule('heatmap'))
</script>

<template>
  <div class="module-page">
    <div class="page-overlay">
      <h2>人流热力</h2>
      <p>实时人员密度分布 — 基于 Web Worker 聚合计算 · CustomDataSource 批量渲染</p>
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
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="#EF5350" />
          <circle cx="15.5" cy="8.5" r="1.5" fill="#FFA726" />
          <circle cx="12" cy="14" r="1.5" fill="#66BB6A" />
          <circle cx="8.5" cy="17" r="1.5" fill="#4FC3F7" />
          <circle cx="15.5" cy="17" r="1.5" fill="#AB47BC" />
        </svg>
      </div>
      <p class="card-title">热力图层开发中</p>
      <p class="card-desc">
        将使用 Cesium CustomDataSource + PointPrimitiveCollection 进行海量点位批量渲染， 结合 Web
        Worker 后台计算聚合网格与统计数据，确保主线程流畅。
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
  color: #546e7a;
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
