<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NSwitch, NColorPicker } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const { viewer } = props

// ===================== 状态 =====================
const fontSize = ref(18)
const fillColor = ref('#4fc3f7')
const scale = ref(1.0)
const showBackground = ref(true)
const backgroundColor = ref('#000000')

// ===================== 实体 =====================
const labelEntities: Cesium.Entity[] = []

const styles = [
  { text: 'Label 1', outlineColor: Cesium.Color.BLACK },
  { text: 'Label 2' },
  { text: 'Label 3' },
  { text: 'Label 4' },
]

styles.forEach((style, i) => {
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.4 + i * 0.02, 39.9, 0),
    label: {
      text: style.text,
      font: `${fontSize.value}px sans-serif`,
      fillColor: Cesium.Color.fromCssColorString(fillColor.value),
      outlineColor: style.outlineColor as Cesium.Color | undefined,
      outlineWidth: 1,
      scale: scale.value,
      showBackground: showBackground.value,
      backgroundColor: Cesium.Color.fromCssColorString(backgroundColor.value).withAlpha(0.5),
      backgroundPadding: new Cesium.Cartesian2(8, 4),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
  labelEntities.push(entity)
})

// ===================== 同步所有实体 =====================
function applyToAll(fn: (entity: Cesium.Entity) => void) {
  labelEntities.forEach(fn)
}

watch(fontSize, (val) => {
  applyToAll((e) => {
    if (e.label) e.label.font = `${val}px sans-serif`
  })
})

watch(fillColor, (val) => {
  applyToAll((e) => {
    if (e.label) e.label.fillColor = Cesium.Color.fromCssColorString(val)
  })
})

watch(scale, (val) => {
  applyToAll((e) => {
    if (e.label) e.label.scale = val
  })
})

watch(showBackground, (val) => {
  applyToAll((e) => {
    if (e.label) e.label.showBackground = val
  })
})

watch(backgroundColor, (val) => {
  if (!showBackground.value) return
  applyToAll((e) => {
    if (e.label) e.label.backgroundColor = Cesium.Color.fromCssColorString(val).withAlpha(0.5)
  })
})

// ===================== 相机 =====================
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.43, 39.9, 10000),
})

onUnmounted(() => {
  viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="文字标签" width="300px">
    <!-- 字体大小 -->
    <div class="lt-row">
      <span class="lt-label">字体大小</span>
      <span class="lt-value">{{ fontSize }}px</span>
    </div>
    <NSlider v-model:value="fontSize" :min="10" :max="36" :step="1" />

    <!-- 填充颜色 -->
    <div class="lt-row">
      <span class="lt-label">填充颜色</span>
      <NColorPicker v-model:value="fillColor" size="small" :show-alpha="false" :modes="['hex']" />
    </div>

    <!-- 缩放 -->
    <div class="lt-row">
      <span class="lt-label">缩放</span>
      <span class="lt-value">{{ scale.toFixed(1) }}</span>
    </div>
    <NSlider v-model:value="scale" :min="0.5" :max="3.0" :step="0.1" />

    <!-- 显示背景 -->
    <div class="lt-row">
      <span class="lt-label">显示背景</span>
      <NSwitch v-model:value="showBackground" size="small" />
    </div>

    <!-- 背景颜色 -->
    <div class="lt-row" :class="{ 'lt-disabled': !showBackground }">
      <span class="lt-label">背景颜色</span>
      <NColorPicker
        v-model:value="backgroundColor"
        size="small"
        :show-alpha="false"
        :modes="['hex']"
        :disabled="!showBackground"
      />
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.lt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 4px;
}

.lt-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
}

.lt-value {
  font-size: 11px;
  color: vars.$exo-text-dim;
  font-variant-numeric: tabular-nums;
}

.lt-disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
