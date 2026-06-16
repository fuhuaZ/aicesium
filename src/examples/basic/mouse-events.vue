<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import { NButton, NTag } from 'naive-ui'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 状态 =====================
interface LogEntry {
  id: number
  type: 'LEFT_CLICK' | 'RIGHT_CLICK' | 'MOUSE_MOVE'
  time: string
  coord?: string
}

let logId = 0
const eventLog = ref<LogEntry[]>([])
const clickEntities: Cesium.Entity[] = []
const MAX_LOG = 8
const MAX_ENTITIES = 10

function pushLog(type: LogEntry['type'], coord?: string) {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  eventLog.value.push({ id: ++logId, type, time, coord })
  if (eventLog.value.length > MAX_LOG) {
    eventLog.value.shift()
  }
}

function clearAll() {
  eventLog.value = []
  clickEntities.forEach((e) => viewer.entities.remove(e))
  clickEntities.length = 0
}

// ===================== Cesium 事件 =====================
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
const infoLabel = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0),
  label: {
    text: 'Left click / mouse move / right click',
    font: '14px sans-serif',
    fillColor: Cesium.Color.AQUA,
    showBackground: true,
    backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
    backgroundPadding: new Cesium.Cartesian2(8, 4),
  },
})

handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  const cartesian = viewer.scene.pickPosition(event.position)
  if (cartesian) {
    const entity = viewer.entities.add({
      position: cartesian,
      point: { pixelSize: 6, color: Cesium.Color.LIME },
    })
    clickEntities.push(entity)
    // FIFO 超出上限移除最早的
    if (clickEntities.length > MAX_ENTITIES) {
      const removed = clickEntities.shift()!
      viewer.entities.remove(removed)
    }
    // 坐标字符串
    const c = Cesium.Cartographic.fromCartesian(cartesian)
    const coord =
      `${Cesium.Math.toDegrees(c.longitude).toFixed(4)}E, ${Cesium.Math.toDegrees(c.latitude).toFixed(4)}N, ${c.height.toFixed(1)}m`
    pushLog('LEFT_CLICK', coord)
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  const cartesian = viewer.scene.pickPosition(event.position)
  const coord = cartesian
    ? (() => {
        const c = Cesium.Cartographic.fromCartesian(cartesian)
        return `${Cesium.Math.toDegrees(c.longitude).toFixed(4)}E, ${Cesium.Math.toDegrees(c.latitude).toFixed(4)}N, ${c.height.toFixed(1)}m`
      })()
    : undefined
  pushLog('RIGHT_CLICK', coord)
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

handler.setInputAction((move: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
  const cartesian = viewer.scene.pickPosition(move.endPosition)
  if (cartesian) {
    const c = Cesium.Cartographic.fromCartesian(cartesian)
    infoLabel.label!.text =
      `${Cesium.Math.toDegrees(c.longitude).toFixed(4)}E  ` +
      `${Cesium.Math.toDegrees(c.latitude).toFixed(4)}N  ` +
      `${c.height.toFixed(1)}m`
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

onUnmounted(() => {
  handler.destroy()
  viewer.entities.removeAll()
  clickEntities.length = 0
})
</script>

<template>
  <div class="me-panel" @mousedown.stop @click.stop>
    <!-- 标题栏 -->
    <div class="me-header">
      <span class="me-title">事件日志</span>
      <NButton size="tiny" type="warning" ghost @click="clearAll">清空日志</NButton>
    </div>

    <!-- 日志列表 -->
    <div class="me-log">
      <div v-for="entry in eventLog" :key="entry.id" class="me-entry">
        <NTag
          size="small"
          :type="
            entry.type === 'LEFT_CLICK'
              ? 'success'
              : entry.type === 'RIGHT_CLICK'
                ? 'warning'
                : 'info'
          "
          :bordered="false"
          round
        >
          {{ entry.type }}
        </NTag>
        <span class="me-time">{{ entry.time }}</span>
        <span v-if="entry.coord" class="me-coord">{{ entry.coord }}</span>
      </div>
      <div v-if="eventLog.length === 0" class="me-empty">暂无事件</div>
    </div>

    <!-- 提示 -->
    <div class="me-hint">
      左键添加标记点 (最多 {{ MAX_ENTITIES }} 个) · 右键记录坐标 · 移动显示坐标
    </div>
  </div>
</template>

<style scoped lang="scss">
$cyan: #4fc3f7;
$lime: #69f0ae;
$orange: #ffab40;
$bg-panel: rgba(13, 26, 45, 0.94);
$text-primary: #b0bec5;
$text-muted: #6b8cae;
$text-dim: #4a6580;

.me-panel {
  position: absolute;
  bottom: 24px;
  left: 16px;
  width: 340px;
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

  .me-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .me-title {
    font-weight: 700;
    font-size: 14px;
    color: $cyan;
  }

  .me-log {
    max-height: 220px;
    overflow-y: auto;
    margin-bottom: 8px;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba($cyan, 0.3);
      border-radius: 2px;
    }
  }

  .me-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);

    &:last-child {
      border-bottom: none;
    }
  }

  .me-time {
    font-size: 11px;
    color: $text-dim;
    min-width: 56px;
    font-variant-numeric: tabular-nums;
  }

  .me-coord {
    font-size: 11px;
    color: $text-muted;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .me-empty {
    text-align: center;
    color: $text-dim;
    font-size: 12px;
    padding: 16px 0;
  }

  .me-hint {
    font-size: 11px;
    color: $text-dim;
    line-height: 1.5;
    border-top: 1px solid rgba($cyan, 0.1);
    padding-top: 8px;
  }
}
</style>
