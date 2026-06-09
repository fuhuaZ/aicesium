<script setup lang="ts">
import { onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const { viewer } = props

const POSITIONS = [
  { lng: 116.38, lat: 39.9, name: 'Point A' },
  { lng: 116.42, lat: 39.92, name: 'Point B' },
  { lng: 116.4, lat: 39.88, name: 'Point C' },
  { lng: 116.44, lat: 39.9, name: 'Point D' },
]

const canvas = document.createElement('canvas')
canvas.width = 32
canvas.height = 32
const ctx = canvas.getContext('2d')!
ctx.fillStyle = '#4fc3f7'
ctx.beginPath()
ctx.arc(16, 16, 12, 0, Math.PI * 2)
ctx.fill()
ctx.fillStyle = '#fff'
ctx.font = 'bold 12px sans-serif'
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('P', 16, 16)

POSITIONS.forEach((p) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
    billboard: {
      image: canvas,
      scale: 1.5,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    },
    label: {
      text: p.name,
      font: '12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      pixelOffset: new Cesium.Cartesian2(0, -20),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 30000),
})

onUnmounted(() => {
  viewer.entities.removeAll()
})
</script>

<template><div /></template>
