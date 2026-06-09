<script setup lang="ts">
import { onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const { viewer } = props

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

cities.forEach((city, i) => {
  viewer.entities.add({
    polyline: {
      positions: [beijing, Cesium.Cartesian3.fromDegrees(city.lng, city.lat, 0)],
      width: 3,
      material: colors[i],
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(113, 36, 8000000),
})

onUnmounted(() => {
  viewer.entities.removeAll()
})
</script>

<template><div /></template>
