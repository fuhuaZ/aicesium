<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer
const btnText = ref('Load Cesium World Terrain')
let originalTerrainProvider: Cesium.TerrainProvider | null = null
let originalEnableLighting = false

async function toggleTerrain() {
  try {
    viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
      requestVertexNormals: true,
    })
    viewer.scene.globe.enableLighting = true
    btnText.value = 'Terrain Loaded'
  } catch {
    btnText.value = 'Load Failed (Need Token)'
  }
}

onMounted(() => {
  originalTerrainProvider = viewer.terrainProvider
  originalEnableLighting = viewer.scene.globe.enableLighting
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(86.92, 27.98, 7000),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
  })
})

onUnmounted(() => {
  if (originalTerrainProvider) {
    viewer.terrainProvider = originalTerrainProvider
  }
  viewer.scene.globe.enableLighting = originalEnableLighting
})
</script>

<template>
  <div class="tl-overlay">
    <strong>Terrain Loading Example</strong><br /><br />
    <code class="tl-code">
      viewer.terrainProvider = await Cesium.CesiumTerrainProvider<br />
      &nbsp;&nbsp;.fromIonAssetId(1);<br />
      new Cesium.CesiumTerrainProvider({<br />
      &nbsp;&nbsp;url: 'https://.../tileset.json'<br />
      }) </code
    ><br />
    <span class="tl-desc"> Load global terrain DEM data, enable lighting/water reflection </span>
    <br /><br />
    <button class="tl-btn" @click="toggleTerrain">{{ btnText }}</button>
  </div>
</template>

<style scoped lang="scss">
.tl-overlay {
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

.tl-code {
  color: #ffa726;
  font-size: 12px;
}

.tl-desc {
  font-size: 12px;
  color: #6b8cae;
}

.tl-btn {
  padding: 6px 14px;
  background: rgba(79, 195, 247, 0.15);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 4px;
  color: #4fc3f7;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: rgba(79, 195, 247, 0.25);
  }
}
</style>
