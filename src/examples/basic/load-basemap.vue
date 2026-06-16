<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'

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
      return Cesium.BingMapsImageryProvider.fromUrl(
        'https://dev.virtualearth.net',
        { mapStyle: Cesium.BingMapsStyle.AERIAL },
      )
    case 'bing-road':
      return Cesium.BingMapsImageryProvider.fromUrl(
        'https://dev.virtualearth.net',
        { mapStyle: Cesium.BingMapsStyle.ROAD },
      )
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
  <div class="bm-panel" @mousedown.stop @click.stop>
    <!-- 标题 -->
    <div class="bm-header">
      <span class="bm-title">底图切换</span>
      <span v-if="isLoading" class="bm-status">加载中…</span>
    </div>

    <!-- Provider 选择 -->
    <div class="bm-providers">
      <label
        v-for="opt in ([
          { key: 'bing-aerial', label: 'Bing Aerial' },
          { key: 'bing-road', label: 'Bing Road' },
          { key: 'osm', label: 'OpenStreetMap' },
          { key: 'arcgis', label: 'ArcGIS Imagery' },
        ] as const)"
        :key="opt.key"
        class="bm-radio"
      >
        <input
          type="radio"
          :value="opt.key"
          v-model="selectedProvider"
          :disabled="isLoading"
        />
        <span>{{ opt.label }}</span>
      </label>
    </div>

    <!-- 透明度 -->
    <div class="bm-slider-row">
      <span class="bm-slider-label">透明度</span>
      <input
        type="range"
        class="bm-slider"
        min="0"
        max="1"
        step="0.05"
        v-model.number="opacity"
      />
      <span class="bm-slider-value">{{ opacity.toFixed(2) }}</span>
    </div>

    <!-- 亮度 -->
    <div class="bm-slider-row">
      <span class="bm-slider-label">亮度</span>
      <input
        type="range"
        class="bm-slider"
        min="0.5"
        max="2"
        step="0.1"
        v-model.number="brightness"
      />
      <span class="bm-slider-value">{{ brightness.toFixed(1) }}</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="bm-error">
      {{ errorMsg }}
    </div>
  </div>
</template>

<style scoped lang="scss">
$cyan: #4fc3f7;
$bg-panel: rgba(13, 26, 45, 0.94);
$text-primary: #b0bec5;
$text-muted: #6b8cae;
$text-dim: #4a6580;

.bm-panel {
  position: absolute;
  bottom: 24px;
  left: 16px;
  width: 280px;
  background: $bg-panel;
  border: 1px solid rgba($cyan, 0.25);
  border-radius: 8px;
  padding: 14px 16px;
  color: $text-primary;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  font-size: 13px;
  z-index: 10;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  user-select: none;

  .bm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .bm-title {
    font-weight: 700;
    font-size: 14px;
    color: $cyan;
  }

  .bm-status {
    font-size: 11px;
    color: $text-dim;
  }

  .bm-providers {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
  }

  .bm-radio {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: $text-muted;
    cursor: pointer;

    input[type='radio'] {
      accent-color: $cyan;
      width: 14px;
      height: 14px;
      cursor: pointer;
    }
  }

  .bm-slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .bm-slider-label {
    font-size: 11px;
    color: $text-dim;
    min-width: 36px;
  }

  .bm-slider {
    flex: 1;
    accent-color: $cyan;
    height: 4px;
    cursor: pointer;
  }

  .bm-slider-value {
    font-size: 11px;
    color: $text-muted;
    min-width: 32px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .bm-error {
    margin-top: 6px;
    padding: 6px 8px;
    font-size: 11px;
    color: #ef5350;
    background: rgba(239, 83, 80, 0.1);
    border: 1px solid rgba(239, 83, 80, 0.25);
    border-radius: 4px;
  }
}
</style>
