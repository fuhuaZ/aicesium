<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import { useExamplesStore } from '@/stores/examples'

const containerRef = ref<HTMLDivElement>()
const store = useExamplesStore()
let viewer: Cesium.Viewer | null = null

onMounted(() => {
  if (!containerRef.value) return

  viewer = new Cesium.Viewer(containerRef.value, {
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: true,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
    selectionIndicator: false,
  })

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(104.0, 35.0, 8000000),
  })

  store.setViewer(viewer)
})

onUnmounted(() => {
  store.dispose()
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<template>
  <div ref="containerRef" class="cesium-preview"></div>
</template>

<style scoped lang="scss">
.cesium-preview {
  width: 100%;
  height: 100%;
}
</style>
