<script setup lang="ts">
import * as Cesium from 'cesium'

const props = defineProps<{ viewer: Cesium.Viewer }>()
</script>

<template>
  <div class="water-overlay">
    <strong>Water.glsl Water Effect</strong>
    <br /><br />
    Cesium built-in Water shader:<br />
    <code class="code-block">
      new Cesium.Primitive({<br />
      &nbsp;&nbsp;geometryInstances: rectInstance,<br />
      &nbsp;&nbsp;appearance: new Cesium.MaterialAppearance({<br />
      &nbsp;&nbsp;&nbsp;&nbsp;material: new Cesium.Material({<br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fabric: Cesium.Material.WaterType<br />
      &nbsp;&nbsp;&nbsp;&nbsp;})<br />
      &nbsp;&nbsp;})<br />
      })
    </code>
  </div>
</template>

<style scoped lang="scss">
.water-overlay {
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
</style>
