<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NColorPicker } from 'naive-ui'

const props = defineProps<{ viewer: Cesium.Viewer }>()
const viewer = props.viewer
const scene = viewer.scene

// Water rectangle geometry
const waterGeometry = new Cesium.RectangleGeometry({
  rectangle: Cesium.Rectangle.fromDegrees(116.35, 39.85, 116.5, 39.95),
  vertexFormat: Cesium.MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat,
})

const geometryInstance = new Cesium.GeometryInstance({ geometry: waterGeometry })

const waterMaterial = new Cesium.Material({
  fabric: {
    type: 'Water',
    uniforms: {
      baseWaterColor: new Cesium.Color(0.2, 0.3, 0.6, 0.8),
      blendColor: new Cesium.Color(0.0, 1.0, 0.699, 1.0),
      specularMap: Cesium.buildModuleUrl('Assets/Textures/water.jpg'),
      normalMap: Cesium.buildModuleUrl('Assets/Textures/waterNormals.jpg'),
      frequency: 10.0,
      animationSpeed: 0.01,
      amplitude: 1.0,
    },
  },
})

const waterPrimitive = new Cesium.Primitive({
  geometryInstances: geometryInstance,
  appearance: new Cesium.MaterialAppearance({
    material: waterMaterial,
  }),
  asynchronous: false,
})

scene.primitives.add(waterPrimitive)

// Reactive params
const waveHeight = ref(1.0)
const waterColor = ref('rgba(51, 77, 153, 0.80)')
const frequency = ref(10)
const animSpeed = ref(1.0)

watch(waveHeight, (v) => {
  waterMaterial.uniforms.amplitude = v
})
watch(waterColor, (v) => {
  waterMaterial.uniforms.baseWaterColor = Cesium.Color.fromCssColorString(v)
})
watch(frequency, (v) => {
  waterMaterial.uniforms.frequency = v
})
watch(animSpeed, (v) => {
  waterMaterial.uniforms.animationSpeed = v * 0.01
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.43, 39.9, 8000),
  orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
})

onUnmounted(() => {
  scene.primitives.remove(waterPrimitive)
})
</script>

<template>
  <ExamplePanel title="水面效果" width="320px">
    <div class="wp-row">
      <span class="wp-label">波浪高度</span>
      <n-slider v-model:value="waveHeight" :min="0" :max="10" :step="0.1" />
      <span class="wp-val">{{ waveHeight.toFixed(1) }}</span>
    </div>
    <div class="wp-row">
      <span class="wp-label">水面颜色</span>
      <n-color-picker v-model:value="waterColor" :show-alpha="true" :modes="['rgb']" size="small" />
    </div>
    <div class="wp-row">
      <span class="wp-label">波纹频率</span>
      <n-slider v-model:value="frequency" :min="1" :max="100" :step="1" />
      <span class="wp-val">{{ frequency }}</span>
    </div>
    <div class="wp-row">
      <span class="wp-label">动画速度</span>
      <n-slider v-model:value="animSpeed" :min="0" :max="5" :step="0.1" />
      <span class="wp-val">{{ animSpeed.toFixed(1) }}</span>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.wp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.wp-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 60px;
  flex-shrink: 0;
}
.wp-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
</style>
