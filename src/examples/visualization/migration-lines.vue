<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NSwitch } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 数据 =====================
const center = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
const targets = [
  { lng: 121.47, lat: 31.23 },
  { lng: 113.26, lat: 23.13 },
  { lng: 104.07, lat: 30.57 },
  { lng: 108.95, lat: 34.27 },
  { lng: 114.5, lat: 38.0 },
  { lng: 120.15, lat: 30.28 },
]
const colors = [
  Cesium.Color.DEEPSKYBLUE,
  Cesium.Color.LIME,
  Cesium.Color.ORANGE,
  Cesium.Color.MAGENTA,
  Cesium.Color.GOLD,
  Cesium.Color.HOTPINK,
]

// ===================== 响应式状态 =====================
const speed = ref(1.0)
const flowEnabled = ref(true)
const trailLength = ref(0.5)
const lineWidth = ref(3)

// ===================== 创建实体 =====================
const entities: Cesium.Entity[] = []

targets.forEach((t, i) => {
  const entity = viewer.entities.add({
    polyline: {
      positions: [center, Cesium.Cartesian3.fromDegrees(t.lng, t.lat, 0)],
      width: lineWidth.value,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: trailLength.value,
        color: colors[i],
      }),
      arcType: Cesium.ArcType.GEODESIC,
    },
  })
  entities.push(entity)
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113, 36, 8000000),
})

// ===================== 动画循环 =====================
let animId: number
let disposed = false
let startTime = performance.now()

function animate() {
  if (disposed) return
  if (flowEnabled.value) {
    const elapsed = (performance.now() - startTime) / 1000
    const power = trailLength.value * (0.5 + 0.5 * Math.sin(elapsed * speed.value))
    entities.forEach((e) => {
      if (!e.polyline) return
      const mat = e.polyline.material as Cesium.PolylineGlowMaterialProperty
      mat.glowPower = power
    })
  }
  animId = requestAnimationFrame(animate)
}
animate()

// ===================== 材质切换 =====================
function applyMaterial() {
  if (disposed) return
  entities.forEach((e, i) => {
    if (!e.polyline) return
    if (flowEnabled.value) {
      e.polyline.material = new Cesium.PolylineGlowMaterialProperty({
        glowPower: trailLength.value,
        color: colors[i],
      })
    } else {
      e.polyline.material = colors[i]
    }
  })
}

// ===================== 响应式监听 =====================
watch(flowEnabled, () => {
  applyMaterial()
})

watch(lineWidth, (val) => {
  entities.forEach((e) => {
    if (e.polyline) e.polyline.width = val
  })
})

// ===================== 生命周期 =====================
onUnmounted(() => {
  disposed = true
  cancelAnimationFrame(animId)
  viewer.entities.removeAll()
  entities.length = 0
})
</script>

<template>
  <ExamplePanel title="迁徙线" width="280px">
    <div class="ml-row">
      <span class="ml-label">动画速度 {{ speed.toFixed(1) }}</span>
      <NSlider
        :value="speed"
        :min="0.1"
        :max="5.0"
        :step="0.1"
        :tooltip="false"
        @update:value="(v: number) => (speed = v)"
      />
    </div>
    <div class="ml-row ml-row-inline">
      <span class="ml-label">流光效果</span>
      <NSwitch :value="flowEnabled" @update:value="(v: boolean) => (flowEnabled = v)" />
    </div>
    <div class="ml-row">
      <span class="ml-label">拖尾长度 {{ trailLength.toFixed(1) }}</span>
      <NSlider
        :value="trailLength"
        :min="0.1"
        :max="1.0"
        :step="0.1"
        :tooltip="false"
        @update:value="(v: number) => (trailLength = v)"
      />
    </div>
    <div class="ml-row">
      <span class="ml-label">线宽 {{ lineWidth }}</span>
      <NSlider
        :value="lineWidth"
        :min="1"
        :max="8"
        :step="1"
        :tooltip="false"
        @update:value="(v: number) => (lineWidth = v)"
      />
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.ml-row {
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.ml-row-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ml-label {
  display: block;
  font-size: 11px;
  color: vars.$exo-text-dim;
  margin-bottom: 4px;
}

.ml-row-inline .ml-label {
  margin-bottom: 0;
}
</style>
