<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { onMounted } from 'vue'

const app = useAppStore()
onMounted(() => app.setActiveModule('video'))
</script>

<template>
  <div class="module-page">
    <div class="page-overlay">
      <h2>视频融合</h2>
      <p>监控画面三维投影 — Primitive 自定义着色器 · 视频纹理实时映射 · WebRTC/HLS</p>
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
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </div>
      <p class="card-title">视频融合开发中</p>
      <p class="card-desc">
        获取摄像头实时视频流，通过 Cesium Primitive 自定义着色器将视频帧作为纹理，
        动态映射到三维建筑表面，实现"所见即所拍"。
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
  max-width: 380px;
}

.card-icon {
  color: #42a5f5;
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
