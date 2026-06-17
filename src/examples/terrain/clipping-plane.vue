<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSelect, NSlider, NButton } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

const directionOptions = [
  { label: '上', value: 'up' },
  { label: '下', value: 'down' },
  { label: '东', value: 'east' },
  { label: '西', value: 'west' },
  { label: '南', value: 'south' },
  { label: '北', value: 'north' },
]

const directionMap: Record<string, Cesium.Cartesian3> = {
  up: new Cesium.Cartesian3(0, 0, -1),
  down: new Cesium.Cartesian3(0, 0, 1),
  east: new Cesium.Cartesian3(1, 0, 0),
  west: new Cesium.Cartesian3(-1, 0, 0),
  south: new Cesium.Cartesian3(0, -1, 0),
  north: new Cesium.Cartesian3(0, 1, 0),
}

const direction = ref('up')
const depth = ref(50)
const angle = ref(0)
const edgeWidth = ref(1.0)
const ionError = ref('')

let tileset: Cesium.Cesium3DTileset | null = null

function applyClippingPlanes() {
  if (!tileset) return

  const normal = directionMap[direction.value]
  const distance = -depth.value
  const plane = new Cesium.ClippingPlane(normal, distance)

  if (angle.value > 0) {
    const pitchAmount = Cesium.Math.toRadians(angle.value)
    plane.transform = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromRotationX(pitchAmount),
    )
  }

  tileset.clippingPlanes = new Cesium.ClippingPlaneCollection({
    planes: [plane],
    edgeWidth: edgeWidth.value,
    edgeColor: Cesium.Color.CYAN,
    unionClippingRegions: false,
  })
}

watch([direction, depth, angle, edgeWidth], () => {
  applyClippingPlanes()
})

function resetParams() {
  direction.value = 'up'
  depth.value = 50
  angle.value = 0
  edgeWidth.value = 1.0
  applyClippingPlanes()
}

onMounted(() => {
  Cesium.Cesium3DTileset.fromUrl(Cesium.IonResource.fromAssetId(75343) as Cesium.Resource)
    .then((ts) => {
      tileset = ts
      viewer.scene.primitives.add(tileset)
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-74.0189, 40.6911, 800),
      })
      applyClippingPlanes()
    })
    .catch(() => {
      ionError.value = '无法加载3D Tiles，请检查Ion Token是否已配置。'
    })
})

onUnmounted(() => {
  if (tileset) {
    tileset.clippingPlanes = undefined as any
    viewer.scene.primitives.remove(tileset)
    tileset = null
  }
})
</script>

<template>
  <ExamplePanel title="ClippingPlane 剖切" width="300px">
    <template v-if="ionError">
      <div class="cp-error">{{ ionError }}</div>
    </template>
    <template v-else>
      <div class="cp-row">
        <span class="cp-label">方向</span>
        <n-select v-model:value="direction" :options="directionOptions" size="small" />
      </div>
      <div class="cp-row">
        <span class="cp-label">深度</span>
        <n-slider v-model:value="depth" :min="10" :max="200" :step="1" />
        <span class="cp-val">{{ depth }}</span>
      </div>
      <div class="cp-row">
        <span class="cp-label">角度</span>
        <n-slider v-model:value="angle" :min="0" :max="45" :step="1" />
        <span class="cp-val">{{ angle }}°</span>
      </div>
      <div class="cp-row">
        <span class="cp-label">边缘宽度</span>
        <n-slider v-model:value="edgeWidth" :min="0" :max="5" :step="0.1" />
        <span class="cp-val">{{ edgeWidth.toFixed(1) }}</span>
      </div>
      <div class="cp-row" style="justify-content: flex-end; margin-top: 4px">
        <n-button size="small" @click="resetParams">重置</n-button>
      </div>
    </template>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.cp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.cp-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 56px;
  flex-shrink: 0;
}

.cp-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}

.cp-error {
  font-size: 13px;
  color: #ff8a65;
  line-height: 1.5;
  text-align: center;
  padding: 12px 0;
}
</style>
