<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NSelect, NButton } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

const positions = [
  { lng: 116.38, lat: 39.91 },
  { lng: 116.4, lat: 39.91 },
  { lng: 116.42, lat: 39.91 },
  { lng: 116.44, lat: 39.91 },
  { lng: 116.38, lat: 39.89 },
  { lng: 116.4, lat: 39.89 },
  { lng: 116.42, lat: 39.89 },
  { lng: 116.44, lat: 39.89 },
]

const dataValues = ref([85, 62, 94, 47, 73, 58, 88, 35])
const maxHeight = ref(800)
const cylRadius = ref(80)
const colorScheme = ref('thermal')

const schemeOptions = [
  { label: '热力', value: 'thermal' },
  { label: '冷暖', value: 'diverging' },
  { label: '单色', value: 'mono' },
]

const entityIds: string[] = []

function getHue(value: number, maxVal: number): number {
  const ratio = 1 - value / maxVal
  switch (colorScheme.value) {
    case 'thermal':
      return ratio * 60
    case 'diverging':
      return ratio * 240
    case 'mono':
      return 200
    default:
      return ratio * 240
  }
}

function buildChart() {
  entityIds.forEach((id) => {
    const e = viewer.entities.getById(id)
    if (e) viewer.entities.remove(e)
  })
  entityIds.length = 0

  const maxVal = Math.max(...dataValues.value)

  positions.forEach((pos, i) => {
    const value = dataValues.value[i]
    const height = (value / maxVal) * maxHeight.value
    const hue = getHue(value, maxVal)
    const id = `cc-${i}`
    viewer.entities.add({
      id,
      position: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, 0),
      cylinder: {
        length: height,
        topRadius: cylRadius.value,
        bottomRadius: cylRadius.value,
        material: Cesium.Color.fromHsl(hue / 360, 0.8, 0.5, 0.85),
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
      },
      label: {
        text: `${value}`,
        font: '12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        pixelOffset: new Cesium.Cartesian2(0, -height / 2 - 10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
    entityIds.push(id)
  })
}

buildChart()

watch([maxHeight, cylRadius, colorScheme], () => buildChart())
watch(dataValues, () => buildChart(), { deep: true })

function randomizeData() {
  dataValues.value = positions.map(() => Math.floor(Math.random() * 100) + 1)
}

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.41, 39.9, 4000),
  orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
})

onUnmounted(() => {
  entityIds.forEach((id) => {
    const e = viewer.entities.getById(id)
    if (e) viewer.entities.remove(e)
  })
  entityIds.length = 0
})
</script>

<template>
  <ExamplePanel title="柱状图表" width="280px">
    <div class="cc-row">
      <span class="cc-label">最大高度</span>
      <n-slider v-model:value="maxHeight" :min="400" :max="2000" :step="50" />
      <span class="cc-val">{{ maxHeight }}</span>
    </div>
    <div class="cc-row">
      <span class="cc-label">柱体半径</span>
      <n-slider v-model:value="cylRadius" :min="30" :max="200" :step="5" />
      <span class="cc-val">{{ cylRadius }}</span>
    </div>
    <div class="cc-row">
      <span class="cc-label">配色方案</span>
      <n-select v-model:value="colorScheme" :options="schemeOptions" size="small" />
    </div>
    <div class="cc-row" style="justify-content: flex-end; margin-top: 4px">
      <n-button size="small" @click="randomizeData">随机数据</n-button>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.cc-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.cc-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 60px;
  flex-shrink: 0;
}
.cc-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
</style>
