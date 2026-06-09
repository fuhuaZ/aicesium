<script setup lang="ts">
import { onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(120, 35, 5000000),
  label: {
    text: 'Click the layer picker at bottom-left to switch basemap',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE.withAlpha(0.7),
    style: Cesium.LabelStyle.FILL,
    outlineColor: Cesium.Color.BLACK,
  },
})

onUnmounted(() => {
  viewer.entities.removeAll()
})
</script>

<template>
  <div />
</template>
