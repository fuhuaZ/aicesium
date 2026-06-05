<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import CodePanel from '@/components/layout/CodePanel.vue'
import CesiumPreview from '@/components/map/CesiumPreview.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-main">
        <CesiumPreview />
      </main>
    </div>
    <CodePanel />
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
}
</style>
