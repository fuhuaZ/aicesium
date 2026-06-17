<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'
import { NButton, NRadioGroup, NRadio } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 响应式状态 =====================
const unit = ref<'m' | 'km'>('km')
const points = ref<Cesium.Cartesian3[]>([])
const handler = ref<Cesium.ScreenSpaceEventHandler | null>(
  new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas),
)

const segmentDistances = computed(() => {
  const dists: number[] = []
  for (let i = 0; i < points.value.length - 1; i++) {
    dists.push(Cesium.Cartesian3.distance(points.value[i], points.value[i + 1]))
  }
  return dists
})

const totalDistance = computed(() => segmentDistances.value.reduce((a, b) => a + b, 0))

function formatDist(meters: number): string {
  return unit.value === 'km' ? `${(meters / 1000).toFixed(3)} km` : `${meters.toFixed(2)} m`
}

function formatCoord(cartesian: Cesium.Cartesian3): string {
  const carto = Cesium.Cartographic.fromCartesian(cartesian)
  const lng = Cesium.Math.toDegrees(carto.longitude).toFixed(4)
  const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(4)
  const h = carto.height.toFixed(1)
  return `${lng}°, ${lat}°, ${h}m`
}

// ===================== 测量实体管理 =====================
function updateMeasurement() {
  viewer.entities.values
    .filter((e) => e.id?.toString().startsWith('meas-'))
    .forEach((e) => viewer.entities.remove(e))

  for (let i = 0; i < points.value.length - 1; i++) {
    const dist = Cesium.Cartesian3.distance(points.value[i], points.value[i + 1])
    const mid = Cesium.Cartesian3.lerp(
      points.value[i],
      points.value[i + 1],
      0.5,
      new Cesium.Cartesian3(),
    )
    viewer.entities.add({
      id: `meas-line-${i}`,
      polyline: {
        positions: [points.value[i], points.value[i + 1]],
        width: 3,
        material: Cesium.Color.CYAN,
      },
    })
    viewer.entities.add({
      id: `meas-label-${i}`,
      position: mid,
      label: {
        text: formatDist(dist),
        font: '12px sans-serif',
        fillColor: Cesium.Color.YELLOW,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
        backgroundPadding: new Cesium.Cartesian2(4, 2),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }

  if (points.value.length >= 2) {
    viewer.entities.add({
      id: 'meas-total',
      position: points.value[0],
      label: {
        text: `Total: ${formatDist(totalDistance.value)} (right click to finish)`,
        font: '14px sans-serif',
        fillColor: Cesium.Color.LIME,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        pixelOffset: new Cesium.Cartesian2(0, -24),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }
}

// ===================== 交互处理 =====================
handler.value!.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  const cartesian = viewer.scene.pickPosition(click.position)
  if (!cartesian) return

  points.value.push(cartesian)
  viewer.entities.add({
    position: cartesian,
    point: {
      pixelSize: 8,
      color: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    },
  })
  updateMeasurement()
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

handler.value!.setInputAction(() => {
  if (handler.value && !handler.value.isDestroyed()) {
    handler.value.destroy()
    handler.value = null
  }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.4, 39.9),
  label: {
    text: 'Left click to add point, right click to finish',
    font: '14px sans-serif',
    fillColor: Cesium.Color.YELLOW,
    showBackground: true,
    backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
    backgroundPadding: new Cesium.Cartesian2(8, 4),
  },
})

// ===================== 清空测量 =====================
function clearMeasurement() {
  points.value = []
  viewer.entities.values
    .filter((e) => e.id?.toString().startsWith('meas-'))
    .forEach((e) => viewer.entities.remove(e))
  // Re-enable handler if destroyed
  if (!handler.value || handler.value.isDestroyed()) {
    handler.value = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    handler.value.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
      const cartesian = viewer.scene.pickPosition(click.position)
      if (!cartesian) return

      points.value.push(cartesian)
      viewer.entities.add({
        position: cartesian,
        point: {
          pixelSize: 8,
          color: Cesium.Color.CYAN,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 1,
        },
      })
      updateMeasurement()
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    handler.value.setInputAction(() => {
      if (handler.value && !handler.value.isDestroyed()) {
        handler.value.destroy()
        handler.value = null
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
}

// ===================== 生命周期 =====================
onUnmounted(() => {
  if (handler.value && !handler.value.isDestroyed()) {
    handler.value.destroy()
  }
  points.value = []
  viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="空间量测" width="300px">
    <!-- 测量点列表 -->
    <div v-if="points.length > 0" class="ms-section">
      <div class="ms-section-title">测量点</div>
      <div class="ms-point-list">
        <div v-for="(pt, i) in points" :key="i" class="ms-point-item">
          <span class="ms-point-idx">{{ i + 1 }}</span>
          <span class="ms-point-coord">{{ formatCoord(pt) }}</span>
        </div>
      </div>
    </div>

    <!-- 分段距离 -->
    <div v-if="segmentDistances.length > 0" class="ms-section">
      <div class="ms-section-title">分段距离</div>
      <div class="ms-segment-list">
        <div v-for="(d, i) in segmentDistances" :key="i" class="ms-segment-item">
          <span class="ms-segment-label">{{ i + 1 }} → {{ i + 2 }}</span>
          <span class="ms-segment-value">{{ formatDist(d) }}</span>
        </div>
      </div>
    </div>

    <!-- 总距离 -->
    <div v-if="points.length >= 2" class="ms-total">
      <span class="ms-total-label">总距离</span>
      <span class="ms-total-value">{{ formatDist(totalDistance) }}</span>
    </div>

    <!-- 空状态 -->
    <div v-if="points.length === 0" class="ms-empty">左键点击添加测量点，右键结束</div>

    <!-- 操作栏 -->
    <div class="ms-actions">
      <NRadioGroup :value="unit" size="small" @update:value="(v: 'm' | 'km') => (unit = v)">
        <NRadio value="m">m</NRadio>
        <NRadio value="km">km</NRadio>
      </NRadioGroup>
      <NButton
        size="small"
        type="warning"
        ghost
        :disabled="points.length === 0"
        @click="clearMeasurement"
      >
        清空测量
      </NButton>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.ms-section {
  margin-bottom: 10px;
}

.ms-section-title {
  font-size: 11px;
  color: vars.$exo-text-dim;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ms-point-list {
  max-height: 120px;
  overflow-y: auto;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.ms-point-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(vars.$exo-cyan, 0.08);
  }
}

.ms-point-idx {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: vars.$exo-cyan;
  background: rgba(vars.$exo-cyan, 0.12);
  border-radius: 50%;
  flex-shrink: 0;
}

.ms-point-coord {
  font-size: 11px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: vars.$exo-text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-segment-list {
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.ms-segment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(vars.$exo-cyan, 0.08);
  }
}

.ms-segment-label {
  font-size: 11px;
  color: vars.$exo-text-muted;
}

.ms-segment-value {
  font-size: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #e0e0e0;
}

.ms-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: rgba(vars.$exo-cyan, 0.08);
  border: 1px solid rgba(vars.$exo-cyan, 0.2);
  border-radius: 6px;
}

.ms-total-label {
  font-size: 12px;
  color: vars.$exo-text-muted;
}

.ms-total-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Consolas', 'Monaco', monospace;
  color: vars.$exo-cyan;
}

.ms-empty {
  text-align: center;
  color: vars.$exo-text-dim;
  font-size: 12px;
  padding: 16px 0;
  margin-bottom: 10px;
}

.ms-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid rgba(vars.$exo-cyan, 0.12);
}
</style>
