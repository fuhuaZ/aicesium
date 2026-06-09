<script setup lang="ts">
import * as Cesium from 'cesium'
import { onUnmounted } from 'vue'

const props = defineProps<{ viewer: Cesium.Viewer }>()
</script>

<template>
  <div class="custom-shader-overlay">
    <strong>CustomShader Example</strong>
    <br /><br />
    Use Cesium.CustomShader to modify glTF material:<br />
    <code class="code-block">
      const shader = new Cesium.CustomShader({<br />
      &nbsp;&nbsp;mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,<br />
      &nbsp;&nbsp;fragmentShaderText: '...'<br />
      })
    </code>
    <br />
    <span class="hint">Requires 3D Tiles / Model primitive to apply the shader</span>
  </div>
</template>

<style scoped lang="scss">
.custom-shader-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: #4fc3f7;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid rgba(79, 195, 247, 0.3);
  max-width: 400px;
  line-height: 1.6;
  text-align: center;
  z-index: 10;
}

.code-block {
  color: #ffa726;
  font-size: 12px;
}

.hint {
  font-size: 12px;
  color: #6b8cae;
}
</style>
