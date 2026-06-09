<script setup lang="ts">
import * as Cesium from 'cesium'
import { onUnmounted } from 'vue'

const props = defineProps<{ viewer: Cesium.Viewer }>()

const scene = props.viewer.scene

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

props.viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 5000),
})

onUnmounted(() => {
  scene.postProcessStages.remove(bloom)
})
</script>

<template>
  <div class="bloom-label">Bloom effect</div>
</template>

<style scoped lang="scss">
.bloom-label {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  color: #4fc3f7;
  padding: 8px 14px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid rgba(79, 195, 247, 0.3);
  pointer-events: none;
}
</style>
