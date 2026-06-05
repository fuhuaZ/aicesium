import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

const DESTINATIONS = [
  { lng: 116.4, lat: 39.9, height: 5000 },
  { lng: 121.47, lat: 31.23, height: 5000 },
  { lng: 113.26, lat: 23.13, height: 5000 },
  { lng: 104.07, lat: 30.57, height: 5000 },
]

export function init(viewer: Cesium.Viewer): DisposeFn {
  let currentIndex = 0
  let timerId: ReturnType<typeof setTimeout>

  function flyToNext() {
    const dest = DESTINATIONS[currentIndex % DESTINATIONS.length]
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(dest.lng, dest.lat, dest.height),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 2.5,
      complete: () => {
        timerId = setTimeout(flyToNext, 1500)
      },
    })
    currentIndex++
  }

  flyToNext()

  return () => {
    clearTimeout(timerId)
    viewer.entities.removeAll()
  }
}
