<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import { NTag, NButton } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

const MAX_PICK_ENTITIES = 5

const lastCoord = ref<{ lng: string; lat: string; height: string } | null>(null)
const pickCount = ref(0)
const pickEntities: Cesium.Entity[] = []

const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

const hintEntity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(120, 35),
  label: {
    text: 'Click anywhere on the globe to pick coordinates',
    font: '14px sans-serif',
    fillColor: Cesium.Color.AQUA,
    showBackground: true,
    backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
    backgroundPadding: new Cesium.Cartesian2(8, 4),
  },
})

handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  const cartesian = viewer.scene.pickPosition(movement.position)
  if (!cartesian) return

  const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
  const lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6)
  const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6)
  const height = cartographic.height.toFixed(2)

  lastCoord.value = { lng, lat, height }
  pickCount.value++

  const entity = viewer.entities.add({
    position: cartesian,
    point: {
      pixelSize: 8,
      color: Cesium.Color.DEEPSKYBLUE,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    },
    label: {
      text: `Lng:${lng} Lat:${lat} H:${height}m`,
      font: '12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('#0a1628CC'),
      backgroundPadding: new Cesium.Cartesian2(6, 3),
      pixelOffset: new Cesium.Cartesian2(12, -8),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })

  pickEntities.push(entity)

  if (pickEntities.length > MAX_PICK_ENTITIES) {
    const oldest = pickEntities.shift()!
    viewer.entities.remove(oldest)
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

function clearPicks() {
  for (const entity of pickEntities) {
    viewer.entities.remove(entity)
  }
  pickEntities.length = 0
  pickCount.value = 0
  lastCoord.value = null
}

onUnmounted(() => {
  handler.destroy()
  viewer.entities.remove(hintEntity)
  for (const entity of pickEntities) {
    viewer.entities.remove(entity)
  }
  pickEntities.length = 0
})
</script>

<template>
  <div class="cp-panel" @mousedown.stop @click.stop>
    <div class="cp-header">
      <span class="cp-title">坐标拾取</span>
      <n-tag size="small" :bordered="false" type="info"> {{ pickCount }} 次 </n-tag>
    </div>

    <div v-if="lastCoord" class="cp-coord">
      <div class="cp-row">
        <span class="cp-label">经度</span>
        <span class="cp-value">{{ lastCoord.lng }}°</span>
      </div>
      <div class="cp-row">
        <span class="cp-label">纬度</span>
        <span class="cp-value">{{ lastCoord.lat }}°</span>
      </div>
      <div class="cp-row">
        <span class="cp-label">高度</span>
        <span class="cp-value">{{ lastCoord.height }} m</span>
      </div>
    </div>
    <div v-else class="cp-empty">点击地球表面拾取坐标</div>

    <div class="cp-footer">
      <n-button size="tiny" type="warning" ghost :disabled="pickCount === 0" @click="clearPicks">
        清空标记
      </n-button>
      <span class="cp-cap">{{ pickEntities.length }} / {{ MAX_PICK_ENTITIES }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
$cyan: #4fc3f7;
$bg-panel: rgba(13, 26, 45, 0.94);
$text-primary: #b0bec5;
$text-muted: #6b8cae;
$text-dim: #4a6580;

.cp-panel {
  position: absolute;
  bottom: 24px;
  left: 16px;
  width: 280px;
  background: $bg-panel;
  border: 1px solid rgba($cyan, 0.25);
  border-radius: 8px;
  padding: 14px 16px;
  color: $text-primary;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  font-size: 13px;
  z-index: 10;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  user-select: none;
}

.cp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cp-title {
  font-weight: 700;
  font-size: 14px;
  color: $cyan;
}

.cp-coord {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.cp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cp-label {
  font-size: 12px;
  color: $text-muted;
}

.cp-value {
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #e0e0e0;
}

.cp-empty {
  text-align: center;
  color: $text-dim;
  font-size: 12px;
  padding: 12px 0;
  margin-bottom: 12px;
}

.cp-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cp-cap {
  font-size: 11px;
  color: $text-dim;
}
</style>
