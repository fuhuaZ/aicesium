import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
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

  return () => {
    viewer.entities.removeAll()
  }
}
