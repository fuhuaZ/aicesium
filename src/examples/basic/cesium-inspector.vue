<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NButton, NSwitch } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

let inspector: Cesium.CesiumInspector | null = null
const isOpen = ref(false)
const showFPS = ref(false)
const showFrustum = ref(false)

// Save original values
const origFPS = viewer.scene.debugShowFramesPerSecond
const origFrustum = viewer.scene.debugShowFrustums

function toggleInspector() {
  if (inspector) {
    inspector.destroy()
    inspector = null
    isOpen.value = false
  } else {
    inspector = new Cesium.CesiumInspector(viewer.container, viewer.scene)
    isOpen.value = true
  }
}

function toggleFPS(val: boolean) {
  showFPS.value = val
  viewer.scene.debugShowFramesPerSecond = val
}

function toggleFrustum(val: boolean) {
  showFrustum.value = val
  viewer.scene.debugShowFrustums = val
}

onUnmounted(() => {
  inspector?.destroy()
  viewer.scene.debugShowFramesPerSecond = origFPS
  viewer.scene.debugShowFrustums = origFrustum
})
</script>

<template>
  <ExamplePanel title="场景调试" width="260px">
    <div class="ci-row">
      <span class="ci-label">Inspector</span>
      <n-button size="small" @click="toggleInspector">
        {{ isOpen ? '关闭' : '打开' }}
      </n-button>
    </div>
    <div class="ci-row">
      <span class="ci-label">显示帧率</span>
      <n-switch :value="showFPS" @update:value="toggleFPS" />
    </div>
    <div class="ci-row">
      <span class="ci-label">显示视锥</span>
      <n-switch :value="showFrustum" @update:value="toggleFrustum" />
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.ci-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ci-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
}
</style>
