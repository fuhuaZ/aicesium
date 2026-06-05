import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const center = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
  const points: Cesium.Cartesian3[] = []
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2
    const r = 0.01
    const lng = 116.4 + r * Math.cos(angle)
    const lat = 39.9 + r * Math.sin(angle)
    points.push(Cesium.Cartesian3.fromDegrees(lng, lat, 0))
  }

  points.forEach((p) => {
    viewer.entities.add({
      polyline: {
        positions: [center, p],
        width: 1,
        material: Cesium.Color.GREEN.withAlpha(0.4),
      },
    })
  })

  viewer.entities.add({
    position: center,
    point: {
      pixelSize: 12,
      color: Cesium.Color.GOLD,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 1,
    },
    label: {
      text: 'Observer',
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      pixelOffset: new Cesium.Cartesian2(0, -20),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 5000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
