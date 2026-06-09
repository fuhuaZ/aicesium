<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

let inspector: Cesium.CesiumInspector | null = null
const btnText = ref('Open Inspector')

function toggleInspector() {
  if (inspector) {
    inspector.destroy()
    inspector = null
    btnText.value = 'Open Inspector'
  } else {
    inspector = new Cesium.CesiumInspector(viewer.container, viewer.scene)
    btnText.value = 'Close Inspector'
  }
}

onUnmounted(() => {
  inspector?.destroy()
})
</script>

<template>
  <div class="inspector-overlay">
    <span>Cesium Inspector: view draw calls and primitives</span>
    <button class="inspector-btn" @click="toggleInspector">{{ btnText }}</button>
  </div>
</template>

<style scoped lang="scss">
.inspector-overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  color: #4fc3f7;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  border: 1px solid rgba(79, 195, 247, 0.3);
}

.inspector-btn {
  margin-top: 8px;
  padding: 6px 14px;
  background: rgba(79, 195, 247, 0.15);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 4px;
  color: #4fc3f7;
  cursor: pointer;
  display: block;
  font-size: 12px;
}
</style>
