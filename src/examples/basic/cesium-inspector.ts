import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const overlay = document.createElement('div')
  overlay.style.cssText = [
    'position: absolute; top: 10px; left: 10px; z-index: 10;',
    'background: rgba(0,0,0,0.8); color: #4fc3f7; padding: 12px 16px;',
    'border-radius: 6px; font-size: 13px; border: 1px solid rgba(79,195,247,0.3);',
  ].join('')
  overlay.textContent = 'Cesium Inspector: view draw calls and primitives'

  const btn = document.createElement('button')
  btn.textContent = 'Open Inspector'
  btn.style.cssText = [
    'margin-top: 8px; padding: 6px 14px; background: rgba(79,195,247,0.15);',
    'border: 1px solid rgba(79,195,247,0.3); border-radius: 4px; color: #4fc3f7;',
    'cursor: pointer; display: block; font-size: 12px;',
  ].join('')

  let inspector: Cesium.CesiumInspector | null = null
  btn.addEventListener('click', () => {
    if (inspector) {
      inspector.destroy()
      inspector = null
      btn.textContent = 'Open Inspector'
    } else {
      inspector = new Cesium.CesiumInspector(viewer.container, viewer.scene)
      btn.textContent = 'Close Inspector'
    }
  })

  overlay.appendChild(btn)
  viewer.container.appendChild(overlay)

  return () => {
    inspector?.destroy()
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
