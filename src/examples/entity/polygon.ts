import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const areas = [
    {
      coords: [
        [116.38, 39.9],
        [116.44, 39.92],
        [116.48, 39.9],
        [116.44, 39.87],
        [116.38, 39.88],
      ],
      color: Cesium.Color.DEEPSKYBLUE.withAlpha(0.4),
      name: 'Area A',
    },
    {
      coords: [
        [116.35, 39.85],
        [116.38, 39.88],
        [116.42, 39.86],
        [116.38, 39.83],
      ],
      color: Cesium.Color.LIME.withAlpha(0.4),
      name: 'Area B',
    },
  ]

  areas.forEach((area) => {
    viewer.entities.add({
      name: area.name,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(
          area.coords.map(([lng, lat]) => Cesium.Cartesian3.fromDegrees(lng, lat)),
        ),
        material: area.color,
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.6),
        outlineWidth: 2,
        perPositionHeight: false,
        extrudedHeight: 0,
      },
      label: {
        text: area.name,
        font: '14px sans-serif',
        fillColor: Cesium.Color.WHITE,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.88, 20000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
