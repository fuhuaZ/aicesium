<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSelect, NSwitch } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 响应式状态 =====================
const terrainOptions = [
  { label: 'Ellipsoid（默认）', value: 'ellipsoid' },
  { label: 'Cesium World Terrain', value: 'cesium' },
]
const terrainType = ref<string>('ellipsoid')
const enableLighting = ref(false)
const waterReflection = ref(false)
const ionError = ref('')

let originalTerrainProvider: Cesium.TerrainProvider | null = null
let originalEnableLighting = false
let originalShowGroundAtmosphere = false

// ===================== 地形切换 =====================
async function loadCesiumTerrain() {
  try {
    ionError.value = ''
    viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
      requestVertexNormals: true,
    })
  } catch {
    ionError.value = '需要 Ion Token'
    terrainType.value = 'ellipsoid'
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
  }
}

watch(terrainType, (val) => {
  if (val === 'cesium') {
    loadCesiumTerrain()
  } else {
    ionError.value = ''
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
  }
})

// ===================== 开关监听 =====================
watch(enableLighting, (val) => {
  viewer.scene.globe.enableLighting = val
})

watch(waterReflection, (val) => {
  viewer.scene.globe.showGroundAtmosphere = val
})

// ===================== 生命周期 =====================
onMounted(() => {
  originalTerrainProvider = viewer.terrainProvider
  originalEnableLighting = viewer.scene.globe.enableLighting
  originalShowGroundAtmosphere = viewer.scene.globe.showGroundAtmosphere
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(86.92, 27.98, 7000),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
  })
})

onUnmounted(() => {
  if (originalTerrainProvider) {
    viewer.terrainProvider = originalTerrainProvider
  }
  viewer.scene.globe.enableLighting = originalEnableLighting
  viewer.scene.globe.showGroundAtmosphere = originalShowGroundAtmosphere
})
</script>

<template>
  <ExamplePanel title="地形加载" width="280px">
    <template v-if="ionError">
      <div class="tl-error">{{ ionError }}</div>
    </template>
    <div class="tl-row">
      <span class="tl-label">地形</span>
      <n-select v-model:value="terrainType" :options="terrainOptions" size="small" />
    </div>
    <div class="tl-row tl-row-inline">
      <span class="tl-label">启用光照</span>
      <n-switch v-model:value="enableLighting" size="small" />
    </div>
    <div class="tl-row tl-row-inline">
      <span class="tl-label">水面反射</span>
      <n-switch v-model:value="waterReflection" size="small" />
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.tl-row {
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.tl-row-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tl-label {
  display: block;
  font-size: 12px;
  color: vars.$exo-text-muted;
  margin-bottom: 4px;
}

.tl-row-inline .tl-label {
  margin-bottom: 0;
}

.tl-error {
  font-size: 13px;
  color: #ff8a65;
  line-height: 1.5;
  text-align: center;
  padding: 8px 0;
  margin-bottom: 8px;
}
</style>
