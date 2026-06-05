<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useMapStore } from '@/stores/map'

const app = useAppStore()
const map = useMapStore()
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button class="icon-btn" @click="app.toggleSidebar()" title="折叠侧边栏">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div class="logo">
        <svg class="logo-icon" width="28" height="28" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="10" fill="url(#logo-grad)" />
          <path d="M14 34L24 14L34 34H14Z" fill="white" opacity="0.9" />
          <path d="M20 28H28L30 34H18L20 28Z" fill="white" />
          <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stop-color="#4FC3F7" />
              <stop offset="100%" stop-color="#1565C0" />
            </linearGradient>
          </defs>
        </svg>
        <span class="logo-text">AI-Cesium</span>
      </div>
    </div>

    <div class="header-center">
      <div class="camera-info">
        <span class="info-item">经度 {{ map.cameraInfo.lng.toFixed(4) }}°</span>
        <span class="info-sep">|</span>
        <span class="info-item">纬度 {{ map.cameraInfo.lat.toFixed(4) }}°</span>
        <span class="info-sep">|</span>
        <span class="info-item">高度 {{ (map.cameraInfo.height / 1000).toFixed(1) }}km</span>
        <span class="info-sep">|</span>
        <span class="info-item">FPS {{ map.fps }}</span>
      </div>
    </div>

    <div class="header-right">
      <div class="alert-badge" @click="$router.push('/alert')">
        <svg
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
        <span v-if="app.unreadAlertCount > 0" class="badge">{{ app.unreadAlertCount }}</span>
      </div>
      <div class="time-display">
        {{ new Date().toLocaleTimeString('zh-CN', { hour12: false }) }}
      </div>
      <div class="user-avatar">
        <span>管</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 12px;
  background: linear-gradient(135deg, #0d1b2a 0%, #1b2838 100%);
  border-bottom: 1px solid rgba(79, 195, 247, 0.15);
  z-index: 100;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(90deg, #4fc3f7, #29b6f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #90a4ae;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn:hover {
  background: rgba(79, 195, 247, 0.1);
  color: #4fc3f7;
}

.header-center {
  display: flex;
  align-items: center;
}

.camera-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #78909c;
  font-family: 'Consolas', 'Monaco', monospace;
}

.info-sep {
  color: rgba(255, 255, 255, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.alert-badge {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #90a4ae;
  cursor: pointer;
  transition: all 0.2s;
}
.alert-badge:hover {
  background: rgba(255, 152, 0, 0.1);
  color: #ffb74d;
}
.badge {
  position: absolute;
  top: 0;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  background: #ef5350;
  color: #fff;
}

.time-display {
  font-size: 13px;
  color: #78909c;
  font-family: 'Consolas', 'Monaco', monospace;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4fc3f7, #1565c0);
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}
</style>
