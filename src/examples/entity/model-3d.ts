import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const position = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 100)
  const heading = Cesium.Math.toRadians(45)

  viewer.entities.add({
    name: 'Cesium Air',
    position,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      position,
      new Cesium.HeadingPitchRoll(heading, 0, 0),
    ),
    model: {
      uri: 'https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/CesiumAir/CesiumAir.glb',
      minimumPixelSize: 64,
      maximumScale: 200,
    },
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 800),
    orientation: { heading: Cesium.Math.toRadians(90), pitch: Cesium.Math.toRadians(-30), roll: 0 },
  })

  return () => {
    viewer.entities.removeAll()
  }
}
