<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NColorPicker, NButton } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 响应式状态 =====================
const scale = ref(1.0)
const minimumPixelSize = ref(64)
const silhouetteColor = ref('#00ffff')
const silhouetteSize = ref(0)
const colorMix = ref(0)

// ===================== 实体引用 =====================
const position = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 100)
let currentHeading = Cesium.Math.toRadians(45)

const entity = viewer.entities.add({
  name: 'Cesium Air',
  position,
  orientation: Cesium.Transforms.headingPitchRollQuaternion(
    position,
    new Cesium.HeadingPitchRoll(currentHeading, 0, 0),
  ),
  model: {
    uri: 'https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/CesiumAir/CesiumAir.glb',
    minimumPixelSize: minimumPixelSize.value,
    maximumScale: 200,
    scale: scale.value,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 800),
  orientation: { heading: Cesium.Math.toRadians(90), pitch: Cesium.Math.toRadians(-30), roll: 0 },
})

// ===================== 控制方法 =====================
function onScaleChange(val: number) {
  scale.value = val
  if (entity.model) entity.model.scale = val
}

function onMinPixelSizeChange(val: number) {
  minimumPixelSize.value = val
  if (entity.model) entity.model.minimumPixelSize = val
}

function onSilhouetteColorChange(val: string) {
  silhouetteColor.value = val
  applySilhouette()
}

function onSilhouetteSizeChange(val: number) {
  silhouetteSize.value = val
  applySilhouette()
}

function applySilhouette() {
  if (!entity.model) return
  if (silhouetteSize.value > 0) {
    entity.model.silhouetteColor = Cesium.Color.fromCssColorString(silhouetteColor.value)
    entity.model.silhouetteSize = silhouetteSize.value
  } else {
    entity.model.silhouetteSize = 0
  }
}

function onColorMixChange(val: number) {
  colorMix.value = val
  if (!entity.model) return
  if (val <= 0) {
    entity.model.colorBlendMode = Cesium.ColorBlendMode.HIGHLIGHT
    entity.model.color = Cesium.Color.WHITE
  } else {
    entity.model.colorBlendMode = Cesium.ColorBlendMode.MIX
    entity.model.color = Cesium.Color.fromCssColorString(silhouetteColor.value).withAlpha(val)
  }
}

function resetHeading() {
  currentHeading = 0
  if (entity.orientation) {
    entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      new Cesium.HeadingPitchRoll(0, 0, 0),
    )
  }
}

// ===================== 生命周期 =====================
onUnmounted(() => {
  viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="3D模型" width="280px">
    <!-- 缩放 -->
    <div class="m3d-row">
      <span class="m3d-label">缩放 {{ scale.toFixed(1) }}</span>
      <NSlider
        :value="scale"
        :min="0.5"
        :max="5"
        :step="0.1"
        :tooltip="false"
        @update:value="onScaleChange"
      />
    </div>

    <!-- 最小像素尺寸 -->
    <div class="m3d-row">
      <span class="m3d-label">最小像素尺寸 {{ minimumPixelSize }}</span>
      <NSlider
        :value="minimumPixelSize"
        :min="16"
        :max="256"
        :step="1"
        :tooltip="false"
        @update:value="onMinPixelSizeChange"
      />
    </div>

    <!-- 轮廓颜色 -->
    <div class="m3d-row">
      <span class="m3d-label">轮廓颜色</span>
      <NColorPicker
        :value="silhouetteColor"
        :show-alpha="false"
        size="small"
        @update:value="onSilhouetteColorChange"
      />
    </div>

    <!-- 轮廓大小 -->
    <div class="m3d-row">
      <span class="m3d-label">轮廓大小 {{ silhouetteSize }} (0=无)</span>
      <NSlider
        :value="silhouetteSize"
        :min="0"
        :max="10"
        :step="0.5"
        :tooltip="false"
        @update:value="onSilhouetteSizeChange"
      />
    </div>

    <!-- 颜色混合 -->
    <div class="m3d-row">
      <span class="m3d-label">颜色混合 {{ colorMix.toFixed(2) }}</span>
      <NSlider
        :value="colorMix"
        :min="0"
        :max="1"
        :step="0.01"
        :tooltip="false"
        @update:value="onColorMixChange"
      />
    </div>

    <!-- 重置朝向 -->
    <div class="m3d-row">
      <NButton size="small" type="primary" ghost @click="resetHeading"> 重置朝向 </NButton>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.m3d-row {
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.m3d-label {
  display: block;
  font-size: 11px;
  color: vars.$exo-text-dim;
  margin-bottom: 4px;
}
</style>
