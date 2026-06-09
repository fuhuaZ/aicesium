<script setup lang="ts">
import { onUnmounted } from 'vue'
import * as Cesium from 'cesium'

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

for (let i = 0; i < 4; i++) {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.38 + i * 0.03, 39.9, 0),
    ellipsoid: {
      radii: new Cesium.Cartesian3(400 + i * 100, 400 + i * 100, 600 + i * 150),
      material: materials[i],
      outline: true,
      outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
    },
  })
}

for (let i = 0; i < 3; i++) {
  viewer.entities.add({
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
}

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.43, 39.9, 5000),
  orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
})

onUnmounted(() => {
  viewer.entities.removeAll()
})
</script>

<template><div /></template>
