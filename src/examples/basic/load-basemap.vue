<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NRadioGroup, NRadio, NSlider } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 状态 =====================
type ProviderKey = 'bing-aerial' | 'bing-road' | 'osm' | 'arcgis'

const selectedProvider = ref<ProviderKey>('bing-aerial')
const opacity = ref(1)
const brightness = ref(1)
const errorMsg = ref('')
const isLoading = ref(false)

// 保存初始底图用于恢复
let originalLayers: Cesium.ImageryLayer[] = []

// ===================== Provider 创建 =====================
async function createProvider(key: ProviderKey): Promise<Cesium.ImageryProvider> {
  switch (key) {
    case 'bing-aerial':
      return Cesium.BingMapsImageryProvider.fromUrl('https://dev.virtualearth.net', {
        mapStyle: Cesium.BingMapsStyle.AERIAL,
      })
    case 'bing-road':
      return Cesium.BingMapsImageryProvider.fromUrl('https://dev.virtualearth.net', {
        mapStyle: Cesium.BingMapsStyle.ROAD,
      })
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

// ===================== 监听 provider 切换 =====================
watch(selectedProvider, (key) => {
  switchBasemap(key)
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
  // 保存初始底图
  const count = viewer.imageryLayers.length
  for (let i = 0; i < count; i++) {
    originalLayers.push(viewer.imageryLayers.get(i))
  }
  // 切换到默认底图
  switchBasemap(selectedProvider.value)
})

onUnmounted(() => {
  // 恢复初始底图
  viewer.imageryLayers.removeAll()
  for (const layer of originalLayers) {
    try {
      viewer.imageryLayers.add(layer.provider, viewer.imageryLayers.length)
      const added = viewer.imageryLayers.get(viewer.imageryLayers.length - 1)
      added.alpha = layer.alpha
      added.brightness = layer.brightness
      added.show = layer.show
    } catch {
      // 恢复失败时静默处理
    }
  }
  originalLayers = []
})
</script>

<template>
  <ExamplePanel title="底图切换" width="300px">
    <div class="bm-row">
      <n-radio-group v-model:value="selectedProvider" size="small">
        <n-radio value="bing-aerial" :disabled="isLoading">Bing Aerial</n-radio>
        <n-radio value="bing-road" :disabled="isLoading">Bing Road</n-radio>
        <n-radio value="osm" :disabled="isLoading">OpenStreetMap</n-radio>
        <n-radio value="arcgis" :disabled="isLoading">ArcGIS Imagery</n-radio>
      </n-radio-group>
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
