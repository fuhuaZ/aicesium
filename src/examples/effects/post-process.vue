<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NRadioGroup, NRadio, NSlider } from 'naive-ui'

const props = defineProps<{ viewer: Cesium.Viewer }>()
const scene = props.viewer.scene

type EffectType = 'bloom' | 'nightVision' | 'grayscale' | 'none'

const effectType = ref<EffectType>('bloom')
const bloomThreshold = ref(0.6)
const bloomIntensity = ref(1.3)

let currentStage: Cesium.PostProcessStage | null = null

const fragmentShaders: Record<Exclude<EffectType, 'none'>, string> = {
  bloom: `
    uniform sampler2D colorTexture;
    uniform float threshold;
    uniform float intensity;
    in vec2 v_textureCoordinates;
    void main() {
      vec4 color = texture(colorTexture, v_textureCoordinates);
      float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      if (lum > threshold) {
        out_FragColor = color * intensity;
      } else {
        out_FragColor = color;
      }
    }
  `,
  nightVision: `
    uniform sampler2D colorTexture;
    in vec2 v_textureCoordinates;
    void main() {
      vec4 color = texture(colorTexture, v_textureCoordinates);
      float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      out_FragColor = vec4(0.1, lum, 0.1, 1.0);
    }
  `,
  grayscale: `
    uniform sampler2D colorTexture;
    in vec2 v_textureCoordinates;
    void main() {
      vec4 color = texture(colorTexture, v_textureCoordinates);
      float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      out_FragColor = vec4(vec3(lum), 1.0);
    }
  `,
}

function applyEffect(type: EffectType) {
  // Remove existing stage
  if (currentStage) {
    scene.postProcessStages.remove(currentStage)
    currentStage = null
  }
  if (type === 'none') return

  const uniforms: Record<string, any> = {}
  if (type === 'bloom') {
    uniforms.threshold = bloomThreshold.value
    uniforms.intensity = bloomIntensity.value
  }

  currentStage = scene.postProcessStages.add(
    new Cesium.PostProcessStage({
      fragmentShader: fragmentShaders[type],
      uniforms,
    }),
  )
}

// Initial apply
applyEffect(effectType.value)

// Watch effect type changes
watch(effectType, (v) => applyEffect(v))

// Watch bloom params
watch(bloomThreshold, (v) => {
  if (currentStage && effectType.value === 'bloom') {
    currentStage.uniforms.threshold = v
  }
})
watch(bloomIntensity, (v) => {
  if (currentStage && effectType.value === 'bloom') {
    currentStage.uniforms.intensity = v
  }
})

props.viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 5000),
})

onUnmounted(() => {
  if (currentStage) {
    scene.postProcessStages.remove(currentStage)
    currentStage = null
  }
})
</script>

<template>
  <ExamplePanel title="后处理效果" width="320px">
    <div class="pp-row">
      <span class="pp-label">效果类型</span>
      <n-radio-group v-model:value="effectType" size="small">
        <n-radio value="bloom">泛光</n-radio>
        <n-radio value="nightVision">夜视</n-radio>
        <n-radio value="grayscale">黑白</n-radio>
        <n-radio value="none">无</n-radio>
      </n-radio-group>
    </div>
    <template v-if="effectType === 'bloom'">
      <div class="pp-row">
        <span class="pp-label">亮度阈值</span>
        <n-slider v-model:value="bloomThreshold" :min="0" :max="1" :step="0.01" />
        <span class="pp-val">{{ bloomThreshold.toFixed(2) }}</span>
      </div>
      <div class="pp-row">
        <span class="pp-label">增强系数</span>
        <n-slider v-model:value="bloomIntensity" :min="1.0" :max="3.0" :step="0.01" />
        <span class="pp-val">{{ bloomIntensity.toFixed(2) }}</span>
      </div>
    </template>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.pp-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.pp-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 60px;
  flex-shrink: 0;
}
.pp-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
</style>
