<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSelect, NSlider, NButton } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const scene = props.viewer.scene

const geoType = ref('rect')
const gridSize = ref(4)
const heightMax = ref(200)
const opacity = ref(0.8)

const geoOptions = [
  { label: '矩形', value: 'rect' },
  { label: '圆形', value: 'circle' },
  { label: '多边形', value: 'polygon' },
]

let currentPrimitive: Cesium.Primitive | null = null

function buildGeometry() {
  if (currentPrimitive) {
    scene.primitives.remove(currentPrimitive)
    currentPrimitive = null
  }

  const instances: Cesium.GeometryInstance[] = []
  const size = gridSize.value
  const step = 0.02

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const lng = 116.36 + c * step
      const lat = 39.86 + r * step
      const height = Math.random() * heightMax.value + 50
      const color = Cesium.Color.fromHsl(Math.random(), 0.7, 0.6, opacity.value)

      let geometry: Cesium.Geometry
      switch (geoType.value) {
        case 'circle':
          geometry = new Cesium.CircleGeometry({
            center: Cesium.Cartesian3.fromDegrees(lng + step / 2, lat + step / 2),
            radius: 800,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          })
          break
        case 'polygon': {
          const cx = lng + step / 2
          const cy = lat + step / 2
          const pr = 0.008
          const positions: Cesium.Cartesian3[] = []
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2
            positions.push(
              Cesium.Cartesian3.fromDegrees(cx + pr * Math.cos(a), cy + pr * Math.sin(a)),
            )
          }
          geometry = new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(positions),
            height,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          })
          break
        }
        default:
          geometry = new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(lng, lat, lng + step * 0.75, lat + step * 0.75),
            height,
            vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          })
      }

      instances.push(
        new Cesium.GeometryInstance({
          geometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(color),
          },
        }),
      )
    }
  }

  currentPrimitive = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: true,
    }),
    asynchronous: false,
  })

  scene.primitives.add(currentPrimitive)
}

buildGeometry()

watch([geoType, gridSize, heightMax, opacity], () => {
  buildGeometry()
})

function regenerate() {
  buildGeometry()
}

props.viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.42, 39.9, 6000),
  orientation: { heading: Cesium.Math.toRadians(30), pitch: Cesium.Math.toRadians(-40), roll: 0 },
})

onUnmounted(() => {
  if (currentPrimitive) {
    scene.primitives.remove(currentPrimitive)
    currentPrimitive = null
  }
})
</script>

<template>
  <ExamplePanel title="几何体" width="280px">
    <div class="pg-row">
      <span class="pg-label">几何类型</span>
      <n-select v-model:value="geoType" :options="geoOptions" size="small" />
    </div>
    <div class="pg-row">
      <span class="pg-label">网格大小</span>
      <n-slider v-model:value="gridSize" :min="2" :max="8" :step="1" />
      <span class="pg-val">{{ gridSize }}</span>
    </div>
    <div class="pg-row">
      <span class="pg-label">最大高度</span>
      <n-slider v-model:value="heightMax" :min="50" :max="500" :step="10" />
      <span class="pg-val">{{ heightMax }}</span>
    </div>
    <div class="pg-row">
      <span class="pg-label">不透明度</span>
      <n-slider v-model:value="opacity" :min="0.3" :max="1.0" :step="0.05" />
      <span class="pg-val">{{ opacity.toFixed(2) }}</span>
    </div>
    <div class="pg-row" style="justify-content: flex-end; margin-top: 4px">
      <n-button size="small" @click="regenerate">重新生成</n-button>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.pg-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.pg-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 60px;
  flex-shrink: 0;
}
.pg-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
</style>
