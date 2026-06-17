<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NSwitch } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const canvas = document.createElement('canvas')
canvas.width = 256
canvas.height = 256
const ctx = canvas.getContext('2d')!

// Reactive params
const speed = ref(1.0)
const paused = ref(false)
const hueShift = ref(true)
const frameCount = ref(0)

let frame = 0
let animId: number
let disposed = false

function draw() {
  if (disposed) return
  if (!paused.value) {
    frame += speed.value
    frameCount.value = Math.floor(frame)
    ctx.clearRect(0, 0, 256, 256)
    if (hueShift.value) {
      const hue = (frame * 0.5) % 360
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`
    } else {
      ctx.fillStyle = '#2196f3'
    }
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Frame: ${Math.floor(frame)}`, 128, 128)
  }
  animId = requestAnimationFrame(draw)
}
draw()

props.viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.4, 39.9),
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(116.36, 39.88, 116.44, 39.92),
    material: canvas,
  },
})

props.viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 20000),
})

onUnmounted(() => {
  disposed = true
  cancelAnimationFrame(animId)
  props.viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="动态纹理" width="280px">
    <div class="dt-row">
      <span class="dt-label">动画速度</span>
      <n-slider v-model:value="speed" :min="0.1" :max="5.0" :step="0.1" />
      <span class="dt-val">{{ speed.toFixed(1) }}</span>
    </div>
    <div class="dt-row">
      <span class="dt-label">暂停</span>
      <n-switch v-model:value="paused" />
    </div>
    <div class="dt-row">
      <span class="dt-label">色相偏移</span>
      <n-switch v-model:value="hueShift" />
    </div>
    <div class="dt-row">
      <span class="dt-label">帧计数</span>
      <span class="dt-frame">{{ frameCount }}</span>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.dt-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.dt-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 60px;
  flex-shrink: 0;
}
.dt-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
.dt-frame {
  font-size: 14px;
  font-weight: 700;
  color: vars.$exo-cyan;
  font-family: 'Consolas', monospace;
}
</style>
