<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
const points: Cesium.Cartesian3[] = []

function updateMeasurement() {
  viewer.entities.values
    .filter((e) => e.id?.toString().startsWith('meas-'))
    .forEach((e) => viewer.entities.remove(e))

  for (let i = 0; i < points.length - 1; i++) {
    const dist = Cesium.Cartesian3.distance(points[i], points[i + 1])
    const mid = Cesium.Cartesian3.lerp(points[i], points[i + 1], 0.5, new Cesium.Cartesian3())
    viewer.entities.add({
      id: `meas-line-${i}`,
      polyline: { positions: [points[i], points[i + 1]], width: 3, material: Cesium.Color.CYAN },
    })
    viewer.entities.add({
      id: `meas-label-${i}`,
      position: mid,
      label: {
        text: `${(dist / 1000).toFixed(3)} km`,
        font: '12px sans-serif',
        fillColor: Cesium.Color.YELLOW,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
        backgroundPadding: new Cesium.Cartesian2(4, 2),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }

  if (points.length >= 2) {
    let total = 0
    for (let i = 0; i < points.length - 1; i++) {
      total += Cesium.Cartesian3.distance(points[i], points[i + 1])
    }
    viewer.entities.add({
      id: 'meas-total',
      position: points[0],
      label: {
        text: `Total: ${(total / 1000).toFixed(3)} km (right click to finish)`,
        font: '14px sans-serif',
        fillColor: Cesium.Color.LIME,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        pixelOffset: new Cesium.Cartesian2(0, -24),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }
}

handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  const cartesian = viewer.scene.pickPosition(click.position)
  if (!cartesian) return

  points.push(cartesian)
  viewer.entities.add({
    position: cartesian,
    point: {
      pixelSize: 8,
      color: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    },
  })
  updateMeasurement()
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

handler.setInputAction(() => {
  handler.destroy()
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.4, 39.9),
  label: {
    text: 'Left click to add point, right click to finish',
    font: '14px sans-serif',
    fillColor: Cesium.Color.YELLOW,
    showBackground: true,
    backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
    backgroundPadding: new Cesium.Cartesian2(8, 4),
  },
})

onMounted(() => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 15000),
  })
})

onUnmounted(() => {
  if (!handler.isDestroyed()) {
    handler.destroy()
  }
  points.length = 0
  viewer.entities.removeAll()
})
</script>

<template>
  <div />
</template>
