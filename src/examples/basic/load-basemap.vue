<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NRadioGroup, NRadio, NSlider, NSelect } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 状态 =====================
type ProviderKey = 'osm' | 'arcgis'
type TerrainKey = 'ellipsoid' | 'cesium'

const terrainOptions = [
  { label: 'Ellipsoid（默认）', value: 'ellipsoid' },
  { label: 'Cesium World Terrain', value: 'cesium' },
]
const selectedProvider = ref<ProviderKey>('arcgis')
const selectedTerrain = ref<TerrainKey>('ellipsoid')
const opacity = ref(1)
const brightness = ref(1)
const errorMsg = ref('')
const terrainErrorMsg = ref('')
const isLoading = ref(false)

// ===================== Provider 创建 =====================
async function createProvider(key: ProviderKey): Promise<Cesium.ImageryProvider> {
  switch (key) {
    case 'osm':
      return Promise.resolve(
        new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/',
        }),
      )
    case 'arcgis':
      return Cesium.ArcGisMapServerImageryProvider.fromUrl(
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
      )
  }
}

// ===================== 切换底图 =====================
async function switchBasemap(key: ProviderKey) {
  isLoading.value = true
  errorMsg.value = ''
  try {
    viewer.imageryLayers.removeAll()
    const provider = await createProvider(key)
    const layer = viewer.imageryLayers.addImageryProvider(provider)
    layer.alpha = opacity.value
    layer.brightness = brightness.value
  } catch (e: any) {
    errorMsg.value = e?.message || '底图加载失败'
  } finally {
    isLoading.value = false
  }
}

// ===================== 切换地形 =====================
async function switchTerrain(key: TerrainKey) {
  terrainErrorMsg.value = ''
  if (key === 'ellipsoid') {
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
    return
  }

  const token = import.meta.env.VITE_CESIUM_ION_TOKEN
  if (!token) {
    terrainErrorMsg.value = '需要配置 VITE_CESIUM_ION_TOKEN'
    selectedTerrain.value = 'ellipsoid'
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
    return
  }

  try {
    Cesium.Ion.defaultAccessToken = token
    viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
      requestVertexNormals: true,
    })
  } catch (e: any) {
    terrainErrorMsg.value = e?.message || '地形加载失败'
    selectedTerrain.value = 'ellipsoid'
    viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
  }
}

// ===================== 监听 provider / terrain 切换 =====================
watch(selectedProvider, (key) => {
  switchBasemap(key)
})

watch(selectedTerrain, (key) => {
  switchTerrain(key)
})

// ===================== 监听透明度 / 亮度 =====================
watch(opacity, (val) => {
  const layer = viewer.imageryLayers.get(0)
  if (layer) layer.alpha = val
})

watch(brightness, (val) => {
  const layer = viewer.imageryLayers.get(0)
  if (layer) layer.brightness = val
})

// ===================== 生命周期 =====================
onMounted(() => {
  switchBasemap(selectedProvider.value)
})
</script>

<template>
  <ExamplePanel title="底图切换" width="300px">
    <div class="bm-row">
      <n-radio-group v-model:value="selectedProvider" size="small">
        <n-radio value="arcgis" :disabled="isLoading">ArcGIS Imagery</n-radio>
        <n-radio value="osm" :disabled="isLoading">OpenStreetMap</n-radio>
      </n-radio-group>
    </div>
    <div class="bm-row">
      <span class="bm-label">地形</span>
      <n-select v-model:value="selectedTerrain" :options="terrainOptions" size="small" />
    </div>
    <div class="bm-row">
      <span class="bm-label">透明度</span>
      <n-slider v-model:value="opacity" :min="0" :max="1" :step="0.05" />
      <span class="bm-val">{{ opacity.toFixed(2) }}</span>
    </div>
    <div class="bm-row">
      <span class="bm-label">亮度</span>
      <n-slider v-model:value="brightness" :min="0.5" :max="2" :step="0.1" />
      <span class="bm-val">{{ brightness.toFixed(1) }}</span>
    </div>
    <div v-if="isLoading" class="bm-status">加载中…</div>
    <div v-if="errorMsg" class="bm-error">{{ errorMsg }}</div>
    <div v-if="terrainErrorMsg" class="bm-error">{{ terrainErrorMsg }}</div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.bm-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.bm-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 40px;
  flex-shrink: 0;
}
.bm-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
.bm-status {
  font-size: 11px;
  color: vars.$exo-text-dim;
  text-align: center;
  margin-bottom: 6px;
}
.bm-error {
  font-size: 11px;
  color: #ef5350;
  padding: 6px 8px;
  background: rgba(239, 83, 80, 0.1);
  border: 1px solid rgba(239, 83, 80, 0.25);
  border-radius: 4px;
}
</style>
