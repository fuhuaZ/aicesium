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
    '<strong>Terrain Loading Example</strong><br><br>',
    '<code style="color:#ffa726;font-size:12px">',
    'viewer.terrainProvider = await Cesium.CesiumTerrainProvider<br>',
    '  .fromIonAssetId(1);<br>',
    'new Cesium.CesiumTerrainProvider({<br>',
    "  url: 'https://.../tileset.json'<br>",
    '})',
    '</code><br>',
    '<span style="font-size:12px;color:#6b8cae">',
    'Load global terrain DEM data, enable lighting/water reflection',
    '</span>',
    '<br><br>',
    '<button id="btn-toggle-terrain" style="',
    'padding:6px 14px; background:rgba(79,195,247,0.15);',
    'border:1px solid rgba(79,195,247,0.3); border-radius:4px;',
    'color:#4fc3f7; cursor:pointer; font-size:12px;',
    '">Load Cesium World Terrain</button>',
  ].join('')
  viewer.container.appendChild(overlay)

  const btn = overlay.querySelector('#btn-toggle-terrain')!
  btn.addEventListener('click', async () => {
    try {
      viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
        requestVertexNormals: true,
      })
      viewer.scene.globe.enableLighting = true
      ;(btn as HTMLButtonElement).textContent = 'Terrain Loaded'
    } catch {
      ;(btn as HTMLButtonElement).textContent = 'Load Failed (Need Token)'
    }
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(86.92, 27.98, 7000),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
  })

  return () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
