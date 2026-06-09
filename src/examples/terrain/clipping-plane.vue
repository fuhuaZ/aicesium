<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

onMounted(() => {
  Cesium.Cesium3DTileset.fromUrl(Cesium.IonResource.fromAssetId(75343) as Cesium.Resource)
    .then((tileset) => {
      viewer.scene.primitives.add(tileset)
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-74.0189, 40.6911, 800),
      })
    })
    .catch(() => {
      const el = document.getElementById('cp-err-msg')
      if (el) el.textContent += '\n(3D Tiles requires Ion Token)'
    })
})

onUnmounted(() => {
  viewer.scene.primitives.removeAll()
})
</script>

<template>
  <div class="cp-overlay">
    <strong>ClippingPlane Excavation</strong><br /><br />
    <code class="cp-code">
      const clippingPlanes = new Cesium.ClippingPlaneCollection({<br />
      &nbsp;&nbsp;planes: [new Cesium.ClippingPlane(...)],<br />
      &nbsp;&nbsp;edgeWidth: 1.0<br />
      })<br />
      tileset.clippingPlanes = clippingPlanes; </code
    ><br />
    <span id="cp-err-msg" class="cp-desc">
      Apply clipping planes to 3D Tiles / Globe for cross-section view
    </span>
  </div>
</template>

<style scoped lang="scss">
.cp-overlay {
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
  max-width: 420px;
  line-height: 1.6;
  text-align: center;
  z-index: 10;
}

.cp-code {
  color: #ffa726;
  font-size: 12px;
}

.cp-desc {
  font-size: 12px;
  color: #6b8cae;
}
</style>
