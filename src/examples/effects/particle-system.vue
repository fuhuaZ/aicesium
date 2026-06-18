<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NColorPicker } from 'naive-ui'
import particleImg from './particle-flame.png'

const props = defineProps<{ viewer: Cesium.Viewer }>()
const scene = props.viewer.scene

let particleSystem: Cesium.ParticleSystem | null = null
let cancelled = false

onMounted(async () => {
  let height = 100

  try {
    const cartographic = Cesium.Cartographic.fromDegrees(116.4, 39.9)
    const [updated] = await Cesium.sampleTerrainMostDetailed(
      props.viewer.terrainProvider,
      [cartographic],
    )
    if (!cancelled && updated && props.viewer && !props.viewer.isDestroyed()) {
      height = (updated.height ?? 0) + 100
    } else {
      return
    }
  } catch {
    // fallback
  }

  if (cancelled || !props.viewer || props.viewer.isDestroyed()) return

  particleSystem = new Cesium.ParticleSystem({
    image: particleImg,
    imageSize: new Cesium.Cartesian2(80, 80),  // 匹配火焰粒子贴图 82x77
    startColor: Cesium.Color.ORANGERED.withAlpha(0.9),
    endColor: Cesium.Color.ORANGE.withAlpha(0.6),
    startScale: 2.0,
    endScale: 3.0,
    minimumParticleLife: 1.0,
    maximumParticleLife: 3.0,
    minimumSpeed: 20.0,
    maximumSpeed: 40.0,
    emissionRate: 30,
    lifetime: 16.0,
    loop: true,
    emitter: new Cesium.CircleEmitter(10),
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(116.4, 39.9, height),
    ),
  })

  scene.primitives.add(particleSystem)

  props.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 600),
  })
})

// Reactive params
const emissionRate = ref(30)
const minSpeed = ref(20)
const maxSpeed = ref(40)
const minLife = ref(1.0)
const maxLife = ref(3.0)
const startColor = ref('rgba(255, 69, 0, 0.90)')
const endColor = ref('rgba(255, 165, 0, 0.60)')
const startScale = ref(2.0)
const endScale = ref(3.0)

watch(emissionRate, (v) => {
  if (particleSystem) particleSystem.emissionRate = v
})
watch(minSpeed, (v) => {
  if (particleSystem) particleSystem.minimumSpeed = v
})
watch(maxSpeed, (v) => {
  if (particleSystem) particleSystem.maximumSpeed = v
})
watch(minLife, (v) => {
  if (particleSystem) particleSystem.minimumParticleLife = v
})
watch(maxLife, (v) => {
  if (particleSystem) particleSystem.maximumParticleLife = v
})
watch(startColor, (v) => {
  if (particleSystem) particleSystem.startColor = Cesium.Color.fromCssColorString(v)
})
watch(endColor, (v) => {
  if (particleSystem) particleSystem.endColor = Cesium.Color.fromCssColorString(v)
})
watch(startScale, (v) => {
  if (particleSystem) particleSystem.startScale = v
})
watch(endScale, (v) => {
  if (particleSystem) particleSystem.endScale = v
})

onUnmounted(() => {
  cancelled = true
  if (particleSystem) {
    scene.primitives.remove(particleSystem)
    particleSystem = null
  }
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
