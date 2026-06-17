<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NColorPicker } from 'naive-ui'

const props = defineProps<{ viewer: Cesium.Viewer }>()
const scene = props.viewer.scene

const particleSystem = new Cesium.ParticleSystem({
  image:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYlWNg+M9AAiYmBn5GRgY0AAB/AAv+2m/rAAAAAElFTkSuQmCC',
  startColor: Cesium.Color.DEEPSKYBLUE.withAlpha(0.8),
  endColor: Cesium.Color.WHITE.withAlpha(0.1),
  startScale: 1.0,
  endScale: 4.0,
  minimumParticleLife: 1.0,
  maximumParticleLife: 3.0,
  minimumSpeed: 20.0,
  maximumSpeed: 40.0,
  emissionRate: 30,
  lifetime: 16.0,
  emitter: new Cesium.CircleEmitter(0.5),
  modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0),
  ),
})

scene.primitives.add(particleSystem)

// Reactive params
const emissionRate = ref(30)
const minSpeed = ref(20)
const maxSpeed = ref(40)
const minLife = ref(1.0)
const maxLife = ref(3.0)
const startColor = ref('rgba(0, 191, 255, 0.80)')
const endColor = ref('rgba(255, 255, 255, 0.10)')
const startScale = ref(1.0)
const endScale = ref(4.0)

watch(emissionRate, (v) => {
  particleSystem.emissionRate = v
})
watch(minSpeed, (v) => {
  particleSystem.minimumSpeed = v
})
watch(maxSpeed, (v) => {
  particleSystem.maximumSpeed = v
})
watch(minLife, (v) => {
  particleSystem.minimumParticleLife = v
})
watch(maxLife, (v) => {
  particleSystem.maximumParticleLife = v
})
watch(startColor, (v) => {
  particleSystem.startColor = Cesium.Color.fromCssColorString(v)
})
watch(endColor, (v) => {
  particleSystem.endColor = Cesium.Color.fromCssColorString(v)
})
watch(startScale, (v) => {
  particleSystem.startScale = v
})
watch(endScale, (v) => {
  particleSystem.endScale = v
})

props.viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 600),
})

onUnmounted(() => {
  scene.primitives.remove(particleSystem)
})
</script>

<template>
  <ExamplePanel title="粒子系统" width="320px">
    <div class="ps-row">
      <span class="ps-label">发射速率</span>
      <n-slider v-model:value="emissionRate" :min="1" :max="100" :step="1" />
      <span class="ps-val">{{ emissionRate }}</span>
    </div>
    <div class="ps-row">
      <span class="ps-label">最小速度</span>
      <n-slider v-model:value="minSpeed" :min="5" :max="80" :step="1" />
      <span class="ps-val">{{ minSpeed }}</span>
    </div>
    <div class="ps-row">
      <span class="ps-label">最大速度</span>
      <n-slider v-model:value="maxSpeed" :min="10" :max="100" :step="1" />
      <span class="ps-val">{{ maxSpeed }}</span>
    </div>
    <div class="ps-row">
      <span class="ps-label">最小生命</span>
      <n-slider v-model:value="minLife" :min="0.5" :max="5" :step="0.1" />
      <span class="ps-val">{{ minLife.toFixed(1) }}</span>
    </div>
    <div class="ps-row">
      <span class="ps-label">最大生命</span>
      <n-slider v-model:value="maxLife" :min="1" :max="8" :step="0.1" />
      <span class="ps-val">{{ maxLife.toFixed(1) }}</span>
    </div>
    <div class="ps-row">
      <span class="ps-label">起始颜色</span>
      <n-color-picker v-model:value="startColor" :show-alpha="true" :modes="['rgb']" size="small" />
    </div>
    <div class="ps-row">
      <span class="ps-label">结束颜色</span>
      <n-color-picker v-model:value="endColor" :show-alpha="true" :modes="['rgb']" size="small" />
    </div>
    <div class="ps-row">
      <span class="ps-label">起始缩放</span>
      <n-slider v-model:value="startScale" :min="0.5" :max="5" :step="0.1" />
      <span class="ps-val">{{ startScale.toFixed(1) }}</span>
    </div>
    <div class="ps-row">
      <span class="ps-label">结束缩放</span>
      <n-slider v-model:value="endScale" :min="1" :max="10" :step="0.1" />
      <span class="ps-val">{{ endScale.toFixed(1) }}</span>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.ps-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.ps-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 60px;
  flex-shrink: 0;
}
.ps-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
</style>
