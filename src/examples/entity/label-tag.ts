import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const styles = [
    { font: '24px sans-serif', fillColor: Cesium.Color.GOLD, outlineColor: Cesium.Color.BLACK },
    { font: '18px "Microsoft YaHei", sans-serif', fillColor: Cesium.Color.DEEPSKYBLUE },
    { font: '14px monospace', fillColor: Cesium.Color.LIME },
    { font: 'bold 20px serif', fillColor: Cesium.Color.DEEPPINK },
  ]

  styles.forEach((style, i) => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(116.4 + i * 0.02, 39.9, 0),
      label: {
        text: `Label ${i + 1}`,
        font: style.font,
        fillColor: style.fillColor,
        outlineColor: style.outlineColor as Cesium.Color | undefined,
        outlineWidth: 1,
        scale: 1.0,
        showBackground: i % 2 === 0,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.43, 39.9, 10000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
