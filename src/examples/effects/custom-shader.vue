<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider } from 'naive-ui'

const props = defineProps<{ viewer: Cesium.Viewer }>()
const viewer = props.viewer

// Custom shader with gradient based on UV + time animation
const customShader = new Cesium.CustomShader({
  mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
  fragmentShaderText: `
    uniform float u_hue1;
    uniform float u_hue2;
    uniform float u_blendIntensity;
    uniform float u_pulseSpeed;
    uniform float u_time;

    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
      float t = fsInput.attributes.texCoord_0.x;
      float pulse = sin(u_time * u_pulseSpeed) * 0.5 + 0.5;
      vec3 color1 = hsv2rgb(vec3(u_hue1 / 360.0, 0.8, 0.9));
      vec3 color2 = hsv2rgb(vec3(u_hue2 / 360.0, 0.8, 0.9));
      vec3 gradient = mix(color1, color2, t + pulse * 0.3);
      material.diffuse = mix(material.diffuse, gradient, u_blendIntensity);
    }
  `,
  uniforms: {
    u_hue1: { type: Cesium.UniformType.FLOAT, value: 200.0 },
    u_hue2: { type: Cesium.UniformType.FLOAT, value: 30.0 },
    u_blendIntensity: { type: Cesium.UniformType.FLOAT, value: 0.7 },
    u_pulseSpeed: { type: Cesium.UniformType.FLOAT, value: 1.0 },
    u_time: { type: Cesium.UniformType.FLOAT, value: 0.0 },
  },
})

const modelEntity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0),
  model: {
    uri: './models/Room.gltf',
    customShader: customShader,
    minimumPixelSize: 128,
    maximumScale: 20000,
  },
})

// Animate time uniform
let animFrame: number | null = null
let disposed = false
const startTime = performance.now()

function animateTime() {
  if (disposed) return
  const elapsed = (performance.now() - startTime) / 1000
  customShader.setUniform('u_time', elapsed)
  animFrame = requestAnimationFrame(animateTime)
}
animateTime()

// Reactive params
const hue1 = ref(200)
const hue2 = ref(30)
const blendIntensity = ref(0.7)
const pulseSpeed = ref(1.0)

watch(hue1, (v) => {
  if (disposed) return
  customShader.setUniform('u_hue1', v)
})
watch(hue2, (v) => {
  if (disposed) return
  customShader.setUniform('u_hue2', v)
})
watch(blendIntensity, (v) => {
  if (disposed) return
  customShader.setUniform('u_blendIntensity', v)
})
watch(pulseSpeed, (v) => {
  if (disposed) return
  customShader.setUniform('u_pulseSpeed', v)
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 500),
  orientation: { heading: 0, pitch: Cesium.Math.toRadians(-30), roll: 0 },
})

onUnmounted(() => {
  disposed = true
  if (animFrame !== null) cancelAnimationFrame(animFrame)
  viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="自定义着色器" width="320px">
    <div class="cs-row">
      <span class="cs-label">渐变色1色相</span>
      <n-slider v-model:value="hue1" :min="0" :max="360" :step="1" />
      <span class="cs-val">{{ hue1 }}°</span>
    </div>
    <div class="cs-row">
      <span class="cs-label">渐变色2色相</span>
      <n-slider v-model:value="hue2" :min="0" :max="360" :step="1" />
      <span class="cs-val">{{ hue2 }}°</span>
    </div>
    <div class="cs-row">
      <span class="cs-label">混合强度</span>
      <n-slider v-model:value="blendIntensity" :min="0" :max="1" :step="0.01" />
      <span class="cs-val">{{ blendIntensity.toFixed(2) }}</span>
    </div>
    <div class="cs-row">
      <span class="cs-label">脉冲速度</span>
      <n-slider v-model:value="pulseSpeed" :min="0" :max="5" :step="0.1" />
      <span class="cs-val">{{ pulseSpeed.toFixed(1) }}</span>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.cs-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.cs-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 72px;
  flex-shrink: 0;
}
.cs-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
</style>
