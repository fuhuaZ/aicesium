<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { onMounted } from 'vue'

const app = useAppStore()
onMounted(() => app.setActiveModule('energy'))
</script>

<template>
  <div class="module-page">
    <div class="page-overlay">
      <h2>能耗监控</h2>
      <p>楼宇实时能耗数据 · 分项计量 · 趋势分析</p>
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
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <p class="card-title">能耗监控开发中</p>
      <p class="card-desc">
        实时展示各楼宇电力、空调、照明等分项能耗数据， 支持历史趋势对比和异常能耗自动告警。
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
  color: #ffa726;
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
