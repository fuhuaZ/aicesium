<script setup lang="ts">
import { onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
const infoLabel = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0),
  label: {
    text: 'Left click / mouse move / right click',
    font: '14px sans-serif',
    fillColor: Cesium.Color.AQUA,
    showBackground: true,
    backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
    backgroundPadding: new Cesium.Cartesian2(8, 4),
  },
})

function showEvent(text: string, color: Cesium.Color) {
  viewer.entities.add({
    label: {
      text,
      font: '16px sans-serif',
      fillColor: color,
      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
      backgroundPadding: new Cesium.Cartesian2(10, 5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(0, -60),
    },
  })
}

handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  const cartesian = viewer.scene.pickPosition(event.position)
  if (cartesian) {
    viewer.entities.add({
      position: cartesian,
      point: { pixelSize: 6, color: Cesium.Color.LIME },
    })
    showEvent('LEFT_CLICK', Cesium.Color.LIME)
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

handler.setInputAction(() => {
  showEvent('RIGHT_CLICK', Cesium.Color.ORANGE)
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

handler.setInputAction((move: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
  const cartesian = viewer.scene.pickPosition(move.endPosition)
  if (cartesian) {
    const c = Cesium.Cartographic.fromCartesian(cartesian)
    infoLabel.label!.text =
      `${Cesium.Math.toDegrees(c.longitude).toFixed(4)}E  ` +
      `${Cesium.Math.toDegrees(c.latitude).toFixed(4)}N  ` +
      `${c.height.toFixed(1)}m`
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

onUnmounted(() => {
  handler.destroy()
  viewer.entities.removeAll()
})
</script>

<template>
  <div />
</template>
