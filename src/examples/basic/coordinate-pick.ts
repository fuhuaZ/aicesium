import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(120, 35),
    label: {
      text: 'Click anywhere on the globe to pick coordinates',
      font: '14px sans-serif',
      fillColor: Cesium.Color.AQUA,
      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
      backgroundPadding: new Cesium.Cartesian2(8, 4),
    },
  })

  handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const cartesian = viewer.scene.pickPosition(movement.position)
    if (!cartesian) return

    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    const lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6)
    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6)
    const height = cartographic.height.toFixed(2)

    viewer.entities.add({
      position: cartesian,
      point: {
        pixelSize: 8,
        color: Cesium.Color.DEEPSKYBLUE,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
      },
      label: {
        text: `Lng:${lng} Lat:${lat} H:${height}m`,
        font: '12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a1628CC'),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        pixelOffset: new Cesium.Cartesian2(12, -8),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  return () => {
    handler.destroy()
    viewer.entities.removeAll()
  }
}
