<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NSlider, NColorPicker, NSwitch } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const { viewer } = props

const materials = [
  Cesium.Color.DEEPSKYBLUE.withAlpha(0.7),
  Cesium.Color.ORANGE.withAlpha(0.7),
  Cesium.Color.LIME.withAlpha(0.7),
  Cesium.Color.MAGENTA.withAlpha(0.7),
]

let firstEllipsoid: Cesium.Entity | null = null
let firstCylinder: Cesium.Entity | null = null

for (let i = 0; i < 4; i++) {
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.38 + i * 0.03, 39.9, 0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(400 + i * 100, 400 + i * 100, 600 + i * 150),
      material: materials[i],
      outline: true,
      outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
    },
  })
  if (i === 0) firstEllipsoid = entity
}

for (let i = 0; i < 3; i++) {
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.4 + i * 0.04, 39.88, 0),
    cylinder: {
      length: 400 + i * 200,
      topRadius: 150 + i * 50,
      bottomRadius: 150 + i * 50,
      material: Cesium.Color.fromHsl(0.55 + i * 0.1, 0.8, 0.5, 0.7),
      outline: true,
      outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
    },
  })
  if (i === 0) firstCylinder = entity
}

function cesiumColorToRgba(c: Cesium.Color): string {
  return `rgba(${Math.round(c.red * 255)}, ${Math.round(c.green * 255)}, ${Math.round(c.blue * 255)}, ${c.alpha.toFixed(2)})`
}

const ellRadiiX = ref(400)
const ellRadiiY = ref(400)
const ellRadiiZ = ref(600)
const ellColor = ref(cesiumColorToRgba(materials[0]))
const ellOutline = ref(true)

const cylLength = ref(400)
const cylTopRadius = ref(150)
const cylBottomRadius = ref(150)
const cylColor = ref(cesiumColorToRgba(Cesium.Color.fromHsl(0.55, 0.8, 0.5, 0.7)))

watch(ellRadiiX, (v) => {
  if (!firstEllipsoid?.ellipsoid) return
  const c = firstEllipsoid.ellipsoid.radii as Cesium.Cartesian3
  firstEllipsoid.ellipsoid.radii = new Cesium.Cartesian3(v, c.y, c.z)
})
watch(ellRadiiY, (v) => {
  if (!firstEllipsoid?.ellipsoid) return
  const c = firstEllipsoid.ellipsoid.radii as Cesium.Cartesian3
  firstEllipsoid.ellipsoid.radii = new Cesium.Cartesian3(c.x, v, c.z)
})
watch(ellRadiiZ, (v) => {
  if (!firstEllipsoid?.ellipsoid) return
  const c = firstEllipsoid.ellipsoid.radii as Cesium.Cartesian3
  firstEllipsoid.ellipsoid.radii = new Cesium.Cartesian3(c.x, c.y, v)
})
watch(ellColor, (v) => {
  if (!firstEllipsoid?.ellipsoid) return
  firstEllipsoid.ellipsoid.material = Cesium.Color.fromCssColorString(v)
})
watch(ellOutline, (v) => {
  if (!firstEllipsoid?.ellipsoid) return
  firstEllipsoid.ellipsoid.outline = v
})

watch(cylLength, (v) => {
  if (!firstCylinder?.cylinder) return
  firstCylinder.cylinder.length = v
})
watch(cylTopRadius, (v) => {
  if (!firstCylinder?.cylinder) return
  firstCylinder.cylinder.topRadius = v
})
watch(cylBottomRadius, (v) => {
  if (!firstCylinder?.cylinder) return
  firstCylinder.cylinder.bottomRadius = v
})
watch(cylColor, (v) => {
  if (!firstCylinder?.cylinder) return
  firstCylinder.cylinder.material = Cesium.Color.fromCssColorString(v)
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.43, 39.9, 5000),
  orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
})

onUnmounted(() => {
  viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="椭球与圆柱" width="320px">
    <div class="ell-group-title">椭球</div>
    <div class="ell-row">
      <span class="ell-label">半径X</span
      ><n-slider v-model:value="ellRadiiX" :min="100" :max="2000" :step="10" /><span
        class="ell-val"
        >{{ ellRadiiX }}</span
      >
    </div>
    <div class="ell-row">
      <span class="ell-label">半径Y</span
      ><n-slider v-model:value="ellRadiiY" :min="100" :max="2000" :step="10" /><span
        class="ell-val"
        >{{ ellRadiiY }}</span
      >
    </div>
    <div class="ell-row">
      <span class="ell-label">半径Z</span
      ><n-slider v-model:value="ellRadiiZ" :min="100" :max="2000" :step="10" /><span
        class="ell-val"
        >{{ ellRadiiZ }}</span
      >
    </div>
    <div class="ell-row">
      <span class="ell-label">颜色</span
      ><n-color-picker v-model:value="ellColor" :show-alpha="true" :modes="['rgb']" size="small" />
    </div>
    <div class="ell-row">
      <span class="ell-label">轮廓线</span><n-switch v-model:value="ellOutline" />
    </div>
    <div class="ell-group-title ell-group-gap">圆柱</div>
    <div class="ell-row">
      <span class="ell-label">长度</span
      ><n-slider v-model:value="cylLength" :min="200" :max="3000" :step="10" /><span
        class="ell-val"
        >{{ cylLength }}</span
      >
    </div>
    <div class="ell-row">
      <span class="ell-label">顶半径</span
      ><n-slider v-model:value="cylTopRadius" :min="50" :max="500" :step="5" /><span
        class="ell-val"
        >{{ cylTopRadius }}</span
      >
    </div>
    <div class="ell-row">
      <span class="ell-label">底半径</span
      ><n-slider v-model:value="cylBottomRadius" :min="50" :max="500" :step="5" /><span
        class="ell-val"
        >{{ cylBottomRadius }}</span
      >
    </div>
    <div class="ell-row">
      <span class="ell-label">颜色</span
      ><n-color-picker v-model:value="cylColor" :show-alpha="true" :modes="['rgb']" size="small" />
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;
.ell-group-title {
  font-weight: 600;
  font-size: 12px;
  color: vars.$exo-cyan;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}
.ell-group-gap {
  margin-top: 14px;
}
.ell-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.ell-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
  min-width: 48px;
  flex-shrink: 0;
}
.ell-val {
  font-size: 11px;
  color: vars.$exo-text-dim;
  min-width: 36px;
  text-align: right;
  flex-shrink: 0;
}
</style>
