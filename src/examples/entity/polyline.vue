<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NColorPicker, NSwitch, NSelect } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 数据 =====================
const beijing = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
const cities = [
  { lng: 121.47, lat: 31.23 },
  { lng: 113.26, lat: 23.13 },
  { lng: 104.07, lat: 30.57 },
  { lng: 108.95, lat: 34.27 },
]
const colors = [
  Cesium.Color.DEEPSKYBLUE,
  Cesium.Color.LIME,
  Cesium.Color.ORANGE,
  Cesium.Color.MAGENTA,
]

// ===================== 响应式状态 =====================
const lineWidth = ref(3)
const lineColor = ref('#00bfff')
const clampToGround = ref(false)
const lineStyle = ref<'solid' | 'dash'>('solid')

// ===================== 创建实体 =====================
const entities: Cesium.Entity[] = []

cities.forEach((city, i) => {
  const entity = viewer.entities.add({
    polyline: {
      positions: [beijing, Cesium.Cartesian3.fromDegrees(city.lng, city.lat, 0)],
      width: lineWidth.value,
      material: colors[i],
      clampToGround: clampToGround.value,
    },
  })
  entities.push(entity)
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113, 36, 8000000),
})

// ===================== 线型选项 =====================
const lineStyleOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dash' },
]

// ===================== 工具方法 =====================
function cesiumColorFromHex(hex: string): Cesium.Color {
  return Cesium.Color.fromCssColorString(hex)
}

function applyMaterial() {
  const color = cesiumColorFromHex(lineColor.value)
  entities.forEach((e) => {
    if (!e.polyline) return
    if (lineStyle.value === 'dash') {
      e.polyline.material = new Cesium.PolylineDashMaterialProperty({
        color,
        dashLength: 16,
      })
    } else {
      e.polyline.material = color
    }
  })
}

// ===================== 响应式监听 =====================
watch(lineWidth, (val) => {
  entities.forEach((e) => {
    if (e.polyline) e.polyline.width = val
  })
})

watch(lineColor, () => {
  applyMaterial()
})

watch(clampToGround, (val) => {
  entities.forEach((e) => {
    if (e.polyline) e.polyline.clampToGround = val
  })
})

watch(lineStyle, () => {
  applyMaterial()
})

// ===================== 生命周期 =====================
onUnmounted(() => {
  viewer.entities.removeAll()
  entities.length = 0
})
</script>

<template>
  <ExamplePanel title="线段" width="280px">
    <!-- 宽度 -->
    <div class="pl-row">
      <span class="pl-label">宽度 {{ lineWidth }}</span>
      <NSlider
        :value="lineWidth"
        :min="1"
        :max="10"
        :step="1"
        :tooltip="false"
        @update:value="(v: number) => (lineWidth = v)"
      />
    </div>

    <!-- 颜色 -->
    <div class="pl-row">
      <span class="pl-label">颜色</span>
      <NColorPicker
        :value="lineColor"
        :show-alpha="false"
        size="small"
        @update:value="(v: string) => (lineColor = v)"
      />
    </div>

    <!-- 贴地 -->
    <div class="pl-row pl-row-inline">
      <span class="pl-label">贴地</span>
      <NSwitch :value="clampToGround" @update:value="(v: boolean) => (clampToGround = v)" />
    </div>

    <!-- 线型 -->
    <div class="pl-row">
      <span class="pl-label">线型</span>
      <NSelect
        :value="lineStyle"
        :options="lineStyleOptions"
        size="small"
        @update:value="(v: 'solid' | 'dash') => (lineStyle = v)"
      />
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.pl-row {
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.pl-row-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pl-label {
  display: block;
  font-size: 11px;
  color: vars.$exo-text-dim;
  margin-bottom: 4px;
}

.pl-row-inline .pl-label {
  margin-bottom: 0;
}
</style>
