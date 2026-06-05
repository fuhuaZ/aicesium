import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const instances: Cesium.GeometryInstance[] = []

  for (let lat = 39.86; lat <= 39.94; lat += 0.02) {
    for (let lng = 116.36; lng <= 116.48; lng += 0.02) {
      instances.push(
        new Cesium.GeometryInstance({
          geometry: new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(lng, lat, lng + 0.015, lat + 0.015),
            height: Math.random() * 200 + 50,
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromHsl(Math.random(), 0.7, 0.6, 0.8),
            ),
          },
        }),
      )
    }
  }

  const primitive = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: true,
    }),
    asynchronous: false,
  })

  viewer.scene.primitives.add(primitive)

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.42, 39.9, 6000),
    orientation: { heading: Cesium.Math.toRadians(30), pitch: Cesium.Math.toRadians(-40), roll: 0 },
  })

  return () => {
    viewer.scene.primitives.remove(primitive)
  }
}
