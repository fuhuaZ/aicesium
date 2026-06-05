import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const overlay = document.createElement('div')
  overlay.style.cssText = [
    'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);',
    'background: rgba(0,0,0,0.85); color: #4fc3f7; padding: 16px 24px;',
    'border-radius: 8px; font-size: 14px; border: 1px solid rgba(79,195,247,0.3);',
    'max-width: 420px; line-height: 1.6; text-align: center; z-index: 10;',
  ].join('')
  overlay.innerHTML = [
    '<strong>ClippingPlane Excavation</strong><br><br>',
    '<code style="color:#ffa726;font-size:12px">',
    'const clippingPlanes = new Cesium.ClippingPlaneCollection({<br>',
    '  planes: [new Cesium.ClippingPlane(...)],<br>',
    '  edgeWidth: 1.0<br>',
    '})<br>',
    'tileset.clippingPlanes = clippingPlanes;',
    '</code><br>',
    '<span style="font-size:12px;color:#6b8cae">',
    'Apply clipping planes to 3D Tiles / Globe for cross-section view',
    '</span>',
  ].join('')
  viewer.container.appendChild(overlay)

  Cesium.Cesium3DTileset.fromUrl(Cesium.IonResource.fromAssetId(75343) as Cesium.Resource)
    .then((tileset) => {
      viewer.scene.primitives.add(tileset)
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-74.0189, 40.6911, 800),
      })
    })
    .catch(() => {
      const span = overlay.querySelector('span')
      if (span) span.textContent += '\n(3D Tiles requires Ion Token)'
    })

  return () => {
    viewer.scene.primitives.removeAll()
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
