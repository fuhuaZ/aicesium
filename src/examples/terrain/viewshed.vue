<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NColorPicker, NButton } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

const CENTER_LNG = 116.4
const CENTER_LAT = 39.9

// Default param values
const DEFAULTS = {
  observerHeight: 100,
  rayCount: 36,
  rayRadius: 0.01,
  rayColor: '#00ff00',
} as const

// Reactive params
const observerHeight = ref(DEFAULTS.observerHeight)
const rayCount = ref(DEFAULTS.rayCount)
const rayRadius = ref(DEFAULTS.rayRadius)
const rayColor = ref(DEFAULTS.rayColor)

// Track ray entity IDs for cleanup
const rayEntityIds: string[] = []
let observerEntity: Cesium.Entity | null = null

function buildRays() {
  // Remove old ray entities
  rayEntityIds.forEach((id) => {
    const e = viewer.entities.getById(id)
    if (e) viewer.entities.remove(e)
  })
  rayEntityIds.length = 0

  // Remove old observer entity
  if (observerEntity) {
    viewer.entities.remove(observerEntity)
    observerEntity = null
  }

  const center = Cesium.Cartesian3.fromDegrees(CENTER_LNG, CENTER_LAT, observerHeight.value)
  const color = Cesium.Color.fromCssColorString(rayColor.value).withAlpha(0.4)
  const count = rayCount.value
  const r = rayRadius.value

  // Create radial polylines
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const lng = CENTER_LNG + r * Math.cos(angle)
    const lat = CENTER_LAT + r * Math.sin(angle)
    const endPoint = Cesium.Cartesian3.fromDegrees(lng, lat, 0)

    const id = `vs-ray-${i}`
    viewer.entities.add({
      id,
      polyline: {
        positions: [center, endPoint],
        width: 1,
        material: color,
      },
    })
    rayEntityIds.push(id)
  }

  // Create observer point entity
  observerEntity = viewer.entities.add({
    position: center,
    point: {
      pixelSize: 12,
      color: Cesium.Color.GOLD,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 1,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: 'Observer',
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      pixelOffset: new Cesium.Cartesian2(0, -20),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
}

// Initial build
buildRays()

// Watch all 4 params and rebuild rays on change
watch(observerHeight, () => buildRays())
watch(rayCount, () => buildRays())
watch(rayRadius, () => buildRays())
watch(rayColor, () => buildRays())

// Fly to center
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(CENTER_LNG, CENTER_LAT, 5000),
})

// Reset handler
function resetObserver() {
  observerHeight.value = DEFAULTS.observerHeight
  rayCount.value = DEFAULTS.rayCount
  rayRadius.value = DEFAULTS.rayRadius
  rayColor.value = DEFAULTS.rayColor
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(CENTER_LNG, CENTER_LAT, 5000),
  })
}

onUnmounted(() => {
  rayEntityIds.forEach((id) => {
    const e = viewer.entities.getById(id)
    if (e) viewer.entities.remove(e)
  })
  rayEntityIds.length = 0
  if (observerEntity) {
    viewer.entities.remove(observerEntity)
    observerEntity = null
  }
})
</script>

<template>
  <ExamplePanel title="可视域分析" width="280px">
    <div class="vs-row">
      <span class="vs-label">观察者高度 {{ observerHeight }}</span>
      <NSlider
        :value="observerHeight"
        :min="0"
        :max="500"
        :step="1"
        :tooltip="false"
        @update:value="(v: number) => (observerHeight = v)"
      />
    </div>
    <div class="vs-row">
      <span class="vs-label">射线数量 {{ rayCount }}</span>
      <NSlider
        :value="rayCount"
        :min="8"
        :max="72"
        :step="1"
        :tooltip="false"
        @update:value="(v: number) => (rayCount = v)"
      />
    </div>
    <div class="vs-row">
      <span class="vs-label">射线半径 {{ rayRadius.toFixed(3) }}</span>
      <NSlider
        :value="rayRadius"
        :min="0.005"
        :max="0.05"
        :step="0.001"
        :tooltip="false"
        @update:value="(v: number) => (rayRadius = v)"
      />
    </div>
    <div class="vs-row">
      <span class="vs-label">射线颜色</span>
      <NColorPicker
        :value="rayColor"
        :show-alpha="false"
        size="small"
        @update:value="(v: string) => (rayColor = v)"
      />
    </div>
    <div class="vs-row vs-row-center">
      <NButton size="small" type="primary" @click="resetObserver">重置观察者</NButton>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.vs-row {
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.vs-row-center {
  display: flex;
  justify-content: center;
}

.vs-label {
  display: block;
  font-size: 11px;
  color: vars.$exo-text-dim;
  margin-bottom: 4px;
}
</style>
