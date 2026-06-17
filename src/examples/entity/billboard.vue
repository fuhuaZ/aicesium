<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NColorPicker, NSelect } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 数据 =====================
const POSITIONS = [
  { lng: 116.38, lat: 39.9, name: 'Point A' },
  { lng: 116.42, lat: 39.92, name: 'Point B' },
  { lng: 116.4, lat: 39.88, name: 'Point C' },
  { lng: 116.44, lat: 39.9, name: 'Point D' },
]

// ===================== 响应式状态 =====================
const scale = ref(1.5)
const iconColor = ref('#4fc3f7')
const verticalOrigin = ref<string>('BOTTOM')
const horizontalOrigin = ref<string>('CENTER')

// ===================== Canvas 绘制 =====================
function createIcon(color: string): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = 32
  c.height = 32
  const ctx = c.getContext('2d')!
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(16, 16, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', 16, 16)
  return c
}

// ===================== 创建实体 =====================
const entities: Cesium.Entity[] = []

POSITIONS.forEach((p) => {
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
    billboard: {
      image: createIcon(iconColor.value),
      scale: scale.value,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    },
    label: {
      text: p.name,
      font: '12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      pixelOffset: new Cesium.Cartesian2(0, -20),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
  entities.push(entity)
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 30000),
})

// ===================== 控制方法 =====================
function onScaleChange(val: number) {
  scale.value = val
  entities.forEach((e) => {
    if (e.billboard) e.billboard.scale = val
  })
}

function onColorChange(val: string) {
  iconColor.value = val
  const newCanvas = createIcon(val)
  entities.forEach((e) => {
    if (e.billboard) e.billboard.image = newCanvas
  })
}

function onVerticalOriginChange(val: string) {
  verticalOrigin.value = val
  const origin = Cesium.VerticalOrigin[val as keyof typeof Cesium.VerticalOrigin]
  entities.forEach((e) => {
    if (e.billboard) e.billboard.verticalOrigin = origin
  })
}

function onHorizontalOriginChange(val: string) {
  horizontalOrigin.value = val
  const origin = Cesium.HorizontalOrigin[val as keyof typeof Cesium.HorizontalOrigin]
  entities.forEach((e) => {
    if (e.billboard) e.billboard.horizontalOrigin = origin
  })
}

// ===================== 下拉选项 =====================
const verticalOptions = [
  { label: 'BOTTOM', value: 'BOTTOM' },
  { label: 'CENTER', value: 'CENTER' },
  { label: 'TOP', value: 'TOP' },
]

const horizontalOptions = [
  { label: 'CENTER', value: 'CENTER' },
  { label: 'LEFT', value: 'LEFT' },
  { label: 'RIGHT', value: 'RIGHT' },
]

// ===================== 生命周期 =====================
onUnmounted(() => {
  viewer.entities.removeAll()
  entities.length = 0
})
</script>

<template>
  <ExamplePanel title="点标记" width="280px">
    <!-- 缩放 -->
    <div class="bb-row">
      <span class="bb-label">缩放 {{ scale.toFixed(1) }}</span>
      <NSlider
        :value="scale"
        :min="0.5"
        :max="3"
        :step="0.1"
        :tooltip="false"
        @update:value="onScaleChange"
      />
    </div>

    <!-- 图标颜色 -->
    <div class="bb-row">
      <span class="bb-label">图标颜色</span>
      <NColorPicker
        :value="iconColor"
        :show-alpha="false"
        size="small"
        @update:value="onColorChange"
      />
    </div>

    <!-- 垂直原点 -->
    <div class="bb-row">
      <span class="bb-label">垂直原点</span>
      <NSelect
        :value="verticalOrigin"
        :options="verticalOptions"
        size="small"
        @update:value="onVerticalOriginChange"
      />
    </div>

    <!-- 水平原点 -->
    <div class="bb-row">
      <span class="bb-label">水平原点</span>
      <NSelect
        :value="horizontalOrigin"
        :options="horizontalOptions"
        size="small"
        @update:value="onHorizontalOriginChange"
      />
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.bb-row {
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.bb-label {
  display: block;
  font-size: 11px;
  color: vars.$exo-text-dim;
  margin-bottom: 4px;
}
</style>
