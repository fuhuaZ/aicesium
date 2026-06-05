import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  let frame = 0
  let animId: number

  function draw() {
    frame++
    ctx.clearRect(0, 0, 256, 256)
    const hue = (frame * 0.5) % 360
    ctx.fillStyle = `hsl(${hue}, 80%, 50%)`
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Frame: ${frame}`, 128, 128)
    animId = requestAnimationFrame(draw)
  }
  draw()

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.4, 39.9),
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(116.36, 39.88, 116.44, 39.92),
      material: canvas,
    },
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 20000),
  })

  return () => {
    cancelAnimationFrame(animId)
    viewer.entities.removeAll()
  }
}
