<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import CodePanel from '@/components/layout/CodePanel.vue'
import CesiumPreview from '@/components/map/CesiumPreview.vue'

const panelWidth = ref(360)
const isDragging = ref(false)

function onDragStart(e: MouseEvent) {
  isDragging.value = true
  const startX = e.clientX
  const startWidth = panelWidth.value

  const onMove = (ev: MouseEvent) => {
    const delta = startX - ev.clientX
    panelWidth.value = Math.max(240, Math.min(800, startWidth + delta))
  }

  const onUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
</script>

<template>
  <div class="app-shell" :class="{ 'is-dragging': isDragging }">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-main">
        <CesiumPreview />
      </main>
      <div class="resize-handle" @mousedown="onDragStart">
        <span class="resize-grip"></span>
      </div>
      <CodePanel :style="{ width: panelWidth + 'px' }" />
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #0a1628;
}
.app-shell.is-dragging {
  cursor: ew-resize;
  user-select: none;
}
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.app-main {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #0a1628;
  min-width: 0;
}
.resize-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6px;
  cursor: ew-resize;
  background: #0d1a2d;
  border-left: 1px solid rgba(79, 195, 247, 0.15);
  border-right: 1px solid rgba(79, 195, 247, 0.08);
  flex-shrink: 0;
  transition: background 0.15s;
}
.resize-handle:hover {
  background: rgba(79, 195, 247, 0.1);
}
.resize-grip {
  display: block;
  width: 3px;
  height: 32px;
  background: rgba(79, 195, 247, 0.25);
  border-radius: 2px;
  transition: background 0.15s;
}
.resize-handle:hover .resize-grip {
  background: rgba(79, 195, 247, 0.5);
}
</style>
