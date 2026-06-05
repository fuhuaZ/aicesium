import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const center = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
  const targets = [
    { lng: 121.47, lat: 31.23 },
    { lng: 113.26, lat: 23.13 },
    { lng: 104.07, lat: 30.57 },
    { lng: 108.95, lat: 34.27 },
    { lng: 114.5, lat: 38.0 },
    { lng: 120.15, lat: 30.28 },
  ]
  const colors = [
    Cesium.Color.DEEPSKYBLUE,
    Cesium.Color.LIME,
    Cesium.Color.ORANGE,
    Cesium.Color.MAGENTA,
    Cesium.Color.GOLD,
    Cesium.Color.HOTPINK,
  ]

  targets.forEach((t, i) => {
    viewer.entities.add({
      polyline: {
        positions: [center, Cesium.Cartesian3.fromDegrees(t.lng, t.lat, 0)],
        width: 1.5,
        material: colors[i],
        arcType: Cesium.ArcType.GEODESIC,
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(113, 36, 8000000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
