<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NColorPicker, NSlider } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const { viewer } = props

// ===================== Area A 参数状态 =====================
const fillColor = ref('#00BFFF')
const fillAlpha = ref(0.4)
const outlineColor = ref('#FFFFFF')
const outlineWidth = ref(2)
const extrudedHeight = ref(0)
const height = ref(0)

// ===================== Area B (静态) =====================
viewer.entities.add({
  name: 'Area B',
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      [
        [116.35, 39.85],
        [116.38, 39.88],
        [116.42, 39.86],
        [116.38, 39.83],
      ].map(([lng, lat]) => Cesium.Cartesian3.fromDegrees(lng, lat)),
    ),
    material: Cesium.Color.LIME.withAlpha(0.4),
    outline: true,
    outlineColor: Cesium.Color.WHITE.withAlpha(0.6),
    outlineWidth: 2,
    perPositionHeight: false,
    extrudedHeight: 0,
  },
  label: {
    text: 'Area B',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    showBackground: true,
    backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
  },
})

// ===================== Area A (受控) =====================
const areaA = viewer.entities.add({
  name: 'Area A',
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      [
        [116.38, 39.9],
        [116.44, 39.92],
        [116.48, 39.9],
        [116.44, 39.87],
        [116.38, 39.88],
      ].map(([lng, lat]) => Cesium.Cartesian3.fromDegrees(lng, lat)),
    ),
    material: Cesium.Color.DEEPSKYBLUE.withAlpha(0.4),
    outline: true,
    outlineColor: Cesium.Color.WHITE.withAlpha(0.6),
    outlineWidth: 2,
    perPositionHeight: false,
    extrudedHeight: 0,
    height: 0,
  },
  label: {
    text: 'Area A',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    showBackground: true,
    backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
  },
})

// ===================== Watchers =====================
watch(fillColor, (color) => {
  if (!areaA.polygon) return
  areaA.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(fillAlpha.value)
})

watch(fillAlpha, (alpha) => {
  if (!areaA.polygon) return
  areaA.polygon.material = Cesium.Color.fromCssColorString(fillColor.value).withAlpha(alpha)
})

watch(outlineColor, (color) => {
  if (!areaA.polygon) return
  areaA.polygon.outlineColor = Cesium.Color.fromCssColorString(color).withAlpha(0.6)
})

watch(outlineWidth, (w) => {
  if (!areaA.polygon) return
  areaA.polygon.outlineWidth = new Cesium.ConstantProperty(w)
})

watch(extrudedHeight, (h) => {
  if (!areaA.polygon) return
  areaA.polygon.extrudedHeight = new Cesium.ConstantProperty(h)
})

watch(height, (h) => {
  if (!areaA.polygon) return
  areaA.polygon.height = new Cesium.ConstantProperty(h)
})

// ===================== 相机 =====================
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.88, 20000),
})

// ===================== 生命周期 =====================
onUnmounted(() => {
  viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="多边形">
    <!-- 填充颜色 -->
    <div class="poly-row">
      <span class="poly-label">填充颜色</span>
      <NColorPicker v-model:value="fillColor" :modes="['hex']" :show-alpha="false" size="small" />
    </div>

    <!-- 填充透明度 -->
    <div class="poly-row">
      <span class="poly-label">填充透明度 {{ fillAlpha.toFixed(2) }}</span>
      <NSlider v-model:value="fillAlpha" :min="0" :max="1" :step="0.01" />
    </div>

    <!-- 轮廓颜色 -->
    <div class="poly-row">
      <span class="poly-label">轮廓颜色</span>
      <NColorPicker
        v-model:value="outlineColor"
        :modes="['hex']"
        :show-alpha="false"
        size="small"
      />
    </div>

    <!-- 轮廓宽度 -->
    <div class="poly-row">
      <span class="poly-label">轮廓宽度 {{ outlineWidth }}</span>
      <NSlider v-model:value="outlineWidth" :min="0" :max="5" :step="1" />
    </div>

    <!-- 拉伸高度 -->
    <div class="poly-row">
      <span class="poly-label">拉伸高度 {{ extrudedHeight }}m</span>
      <NSlider v-model:value="extrudedHeight" :min="0" :max="50000" :step="100" />
    </div>

    <!-- 离地高度 -->
    <div class="poly-row">
      <span class="poly-label">离地高度 {{ height }}m</span>
      <NSlider v-model:value="height" :min="0" :max="10000" :step="100" />
    </div>
  </ExamplePanel>
</template>

<style lang="scss" scoped>
@use '@/styles/example-vars' as vars;

.poly-row {
  margin-bottom: 10px;
}

.poly-label {
  display: block;
  font-size: 11px;
  color: vars.$exo-text-dim;
  margin-bottom: 4px;
}
</style>
