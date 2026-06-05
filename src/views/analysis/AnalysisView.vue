<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { onMounted } from 'vue'

const app = useAppStore()
onMounted(() => app.setActiveModule('analysis'))
</script>

<template>
  <div class="module-page">
    <div class="page-overlay">
      <h2>空间分析</h2>
      <p>天际线遮挡 · 可视域计算 · 烟雾扩散模拟 — Turf.js + Web Worker + 射线检测</p>
    </div>
    <div class="toolbar">
      <button class="analysis-btn">
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
        可视域分析
      </button>
      <button class="analysis-btn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        天际线
      </button>
      <button class="analysis-btn">
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
        </svg>
        空间测量
      </button>
      <button class="analysis-btn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 2v20M2 12h20" />
          <circle cx="12" cy="12" r="8" stroke-dasharray="4 2" />
        </svg>
        扩散模拟
      </button>
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
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      </div>
      <p class="card-title">空间分析工具开发中</p>
      <p class="card-desc">
        利用 Cesium Scene 拾取与射线检测，结合 Turf.js 进行三维空间几何运算。
        支持可视域分析、天际线遮挡计算、烟雾扩散模拟等高级空间分析。
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

.toolbar {
  position: absolute;
  top: 80px;
  left: 16px;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.analysis-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(13, 27, 42, 0.9);
  color: #78909c;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.analysis-btn:hover {
  border-color: rgba(79, 195, 247, 0.3);
  color: #4fc3f7;
  background: rgba(79, 195, 247, 0.08);
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
  max-width: 400px;
}

.card-icon {
  color: #ab47bc;
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
