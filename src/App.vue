<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import RightPanel from '@/components/layout/RightPanel.vue'
import BottomBar from '@/components/layout/BottomBar.vue'
import CesiumViewer from '@/components/map/CesiumViewer.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-main">
        <CesiumViewer />
        <RouterView />
      </main>
      <RightPanel />
    </div>
    <BottomBar />
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
}

.app-main {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #0a1628;
}
</style>
