import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const scene = viewer.scene

  const bloom = scene.postProcessStages.add(
    new Cesium.PostProcessStage({
      fragmentShader: `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
        void main() {
          vec4 color = texture2D(colorTexture, v_textureCoordinates);
          float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          if (lum > 0.6) {
            gl_FragColor = color * 1.3;
          } else {
            gl_FragColor = color;
          }
        }
      `,
    }),
  )

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 5000),
  })

  const overlay = document.createElement('div')
  overlay.style.cssText = [
    'position: absolute; top: 10px; right: 10px; z-index: 10;',
    'background: rgba(0,0,0,0.8); color: #4fc3f7; padding: 8px 14px;',
    'border-radius: 4px; font-size: 12px; border: 1px solid rgba(79,195,247,0.3);',
    'pointer-events: none;',
  ].join('')
  overlay.textContent = 'Bloom effect'
  viewer.container.appendChild(overlay)

  return () => {
    scene.postProcessStages.remove(bloom)
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
