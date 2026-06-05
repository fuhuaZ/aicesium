<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { onMounted } from 'vue'

const app = useAppStore()
onMounted(() => app.setActiveModule('dashboard'))
</script>

<template>
  <div class="page-overlay">
    <h2>园区总览</h2>
    <p>实时监控园区运行状态，单击建筑查看详情</p>
  </div>
</template>

<style scoped>
.page-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  pointer-events: none;
  z-index: 10;
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
</style>
