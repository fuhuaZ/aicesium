import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const overlay = document.createElement('div')
  overlay.style.cssText = [
    'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);',
    'background: rgba(0,0,0,0.85); color: #4fc3f7; padding: 16px 24px;',
    'border-radius: 8px; font-size: 14px; border: 1px solid rgba(79,195,247,0.3);',
    'max-width: 400px; line-height: 1.6; text-align: center; z-index: 10;',
  ].join('')
  overlay.innerHTML = [
    '<strong>CustomShader Example</strong><br><br>',
    'Use Cesium.CustomShader to modify glTF material:<br>',
    '<code style="color:#ffa726;font-size:12px">',
    'const shader = new Cesium.CustomShader({<br>',
    '  mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,<br>',
    "  fragmentShaderText: '...'<br>",
    '})',
    '</code><br>',
    '<span style="font-size:12px;color:#6b8cae">',
    'Requires 3D Tiles / Model primitive to apply the shader',
    '</span>',
  ].join('')
  viewer.container.appendChild(overlay)

  return () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
