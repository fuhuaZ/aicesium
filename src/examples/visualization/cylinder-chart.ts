import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const data = [
    { lng: 116.38, lat: 39.91, value: 85 },
    { lng: 116.4, lat: 39.91, value: 62 },
    { lng: 116.42, lat: 39.91, value: 94 },
    { lng: 116.44, lat: 39.91, value: 47 },
    { lng: 116.38, lat: 39.89, value: 73 },
    { lng: 116.4, lat: 39.89, value: 58 },
    { lng: 116.42, lat: 39.89, value: 88 },
    { lng: 116.44, lat: 39.89, value: 35 },
  ]

  const maxValue = Math.max(...data.map((d) => d.value))

  data.forEach((d) => {
    const height = (d.value / maxValue) * 800
    const hue = (1 - d.value / maxValue) * 240
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(d.lng, d.lat, 0),
      cylinder: {
        length: height,
        topRadius: 80,
        bottomRadius: 80,
        material: Cesium.Color.fromHsl(hue / 360, 0.8, 0.5, 0.85),
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
      },
      label: {
        text: `${d.value}`,
        font: '12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        pixelOffset: new Cesium.Cartesian2(0, -height / 2 - 10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.41, 39.9, 4000),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
  })

  return () => {
    viewer.entities.removeAll()
  }
}
