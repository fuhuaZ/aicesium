<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

// ===================== 数据定义 =====================
interface Landmark {
  name: string
  lng: number
  lat: number
  height: number
}

const LANDMARKS: Landmark[] = [
  { name: '北京', lng: 116.4, lat: 39.9, height: 3000 },
  { name: '上海', lng: 121.47, lat: 31.23, height: 3000 },
  { name: '广州', lng: 113.26, lat: 23.13, height: 3000 },
  { name: '成都', lng: 104.07, lat: 30.57, height: 3000 },
  { name: '东京', lng: 139.69, lat: 35.69, height: 3000 },
  { name: '纽约', lng: -74.01, lat: 40.71, height: 5000 },
  { name: '巴黎', lng: 2.35, lat: 48.86, height: 3000 },
  { name: '悉尼', lng: 151.21, lat: -33.87, height: 5000 },
]

const PATH_WAYPOINTS = [
  { lng: 116.4, lat: 39.9, h: 8000 },
  { lng: 120.0, lat: 37.0, h: 6000 },
  { lng: 121.47, lat: 31.23, h: 4000 },
  { lng: 118.0, lat: 27.0, h: 6000 },
  { lng: 113.26, lat: 23.13, h: 4000 },
]

type FlyMode = 'flyto' | 'setview' | 'entity' | 'path'

// ===================== 响应式状态 =====================
const viewer = props.viewer

const mode = ref<FlyMode>('flyto')
const lng = ref(116.4)
const lat = ref(39.9)
const height = ref(3000)
const pitch = ref(-45)
const heading = ref(0)
const duration = ref(3)
const entityTarget = ref('北京')
const statusText = ref('就绪')
const pathIndex = ref(0)
const pathFlying = ref(false)

let flyTimer: ReturnType<typeof setTimeout> | null = null

// ===================== 实体 =====================
const entities: Cesium.Entity[] = []

const pathEntity = viewer.entities.add({
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray(PATH_WAYPOINTS.flatMap((w) => [w.lng, w.lat])),
    width: 2,
    material: new Cesium.PolylineDashMaterialProperty({
      color: Cesium.Color.fromCssColorString('#ff9800'),
      gapColor: Cesium.Color.TRANSPARENT,
      dashLength: 16,
    }),
    clampToGround: false,
  },
  show: false,
})

const pathMarker = viewer.entities.add({
  point: { pixelSize: 10, color: Cesium.Color.fromCssColorString('#ff9800') },
  show: false,
})

LANDMARKS.forEach((lm) => {
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lm.lng, lm.lat, 0),
    point: {
      pixelSize: 12,
      color: Cesium.Color.fromCssColorString('#4fc3f7'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: lm.name,
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString('#0a1628'),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -16),
    },
  })
  entities.push(entity)
})

// ===================== 计算属性 =====================
const showPresets = computed(() => mode.value === 'flyto' || mode.value === 'setview')
const showCoords = computed(() => mode.value !== 'entity')
const showEntity = computed(() => mode.value === 'entity')
const showPath = computed(() => mode.value === 'path')
const showDuration = computed(() => mode.value !== 'setview')
const showAngles = computed(() => mode.value !== 'path')

// ===================== 方法 =====================
function setStatus(msg: string) {
  statusText.value = msg
}

function cancelFlight() {
  viewer.camera.cancelFlight()
  if (flyTimer) {
    clearTimeout(flyTimer)
    flyTimer = null
  }
  pathFlying.value = false
  setStatus('已停止')
}

function fillLandmark(lm: Landmark) {
  lng.value = lm.lng
  lat.value = lm.lat
  height.value = lm.height
}

function switchMode(m: FlyMode) {
  cancelFlight()
  mode.value = m
  pathEntity.show = m === 'path'
  pathMarker.show = m === 'path'
}

function getDestination() {
  return Cesium.Cartesian3.fromDegrees(lng.value, lat.value, height.value)
}

function doStart() {
  cancelFlight()

  switch (mode.value) {
    case 'setview': {
      viewer.camera.setView({
        destination: getDestination(),
        orientation: {
          heading: Cesium.Math.toRadians(heading.value),
          pitch: Cesium.Math.toRadians(pitch.value),
          roll: 0,
        },
      })
      setStatus('瞬移完成')
      break
    }

    case 'flyto': {
      setStatus('飞行中...')
      viewer.camera.flyTo({
        destination: getDestination(),
        orientation: {
          heading: Cesium.Math.toRadians(heading.value),
          pitch: Cesium.Math.toRadians(pitch.value),
          roll: 0,
        },
        duration: duration.value,
        complete: () => setStatus('飞行到达'),
        cancel: () => setStatus('飞行取消'),
      })
      break
    }

    case 'entity': {
      const lm = LANDMARKS.find((l) => l.name === entityTarget.value)
      if (!lm) {
        setStatus('未选择实体')
        return
      }
      const target = entities.find((e) => e.position && e.label?.text?.getValue() === lm.name)
      if (target) {
        setStatus(`飞向 ${lm.name}...`)
        viewer.flyTo(target, {
          duration: duration.value,
          offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-30), lm.height),
          complete: () => setStatus(`已到达 ${lm.name}`),
          cancel: () => setStatus('飞行取消'),
        })
      }
      break
    }

    case 'path': {
      pathFlying.value = true
      pathIndex.value = 0
      pathEntity.show = true
      pathMarker.show = true
      flyNextPath()
      break
    }
  }
}

function flyNextPath() {
  if (!pathFlying.value || pathIndex.value >= PATH_WAYPOINTS.length) {
    pathFlying.value = false
    setStatus('轨迹飞行完成')
    return
  }
  const wp = PATH_WAYPOINTS[pathIndex.value]!
  setStatus(`轨迹飞行 ${pathIndex.value + 1}/${PATH_WAYPOINTS.length}`)
  pathMarker.position = Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat, 0)
  pathMarker.show = true

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(wp.lng, wp.lat, wp.h),
    orientation: {
      heading: Cesium.Math.toRadians(pathIndex.value * 30),
      pitch: Cesium.Math.toRadians(-35),
      roll: 0,
    },
    duration: duration.value,
    complete: () => {
      pathIndex.value++
      if (pathFlying.value) flyTimer = setTimeout(flyNextPath, 300)
    },
    cancel: () => {
      pathFlying.value = false
      setStatus('轨迹取消')
    },
  })
}

// ===================== 生命周期 =====================
onUnmounted(() => {
  cancelFlight()
  viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="相机飞行" width="320px">
    <template #header-right>
      <span class="cam-status">{{ statusText }}</span>
    </template>

    <!-- 模式切换 -->
    <div class="cam-mode-bar">
      <button
        v-for="m in [
          { id: 'flyto' as FlyMode, icon: '✈', label: '飞行' },
          { id: 'setview' as FlyMode, icon: '⚡', label: '瞬移' },
          { id: 'entity' as FlyMode, icon: '🎯', label: '实体' },
          { id: 'path' as FlyMode, icon: '🛤', label: '轨迹' },
        ]"
        :key="m.id"
        class="cam-mode-tab"
        :class="{ active: mode === m.id }"
        @click="switchMode(m.id)"
      >
        {{ m.icon }} {{ m.label }}
      </button>
    </div>

    <!-- 预设城市 -->
    <div v-if="showPresets" class="cam-presets">
      <button
        v-for="lm in LANDMARKS.slice(0, 6)"
        :key="lm.name"
        class="cam-preset-btn"
        @click="fillLandmark(lm)"
      >
        {{ lm.name }}
      </button>
    </div>

    <!-- 坐标输入 -->
    <div v-if="showCoords" class="cam-coords">
      <div class="cam-row">
        <label class="cam-label">
          经度
          <input v-model.number="lng" type="number" class="cam-input" />
        </label>
        <label class="cam-label">
          纬度
          <input v-model.number="lat" type="number" class="cam-input" />
        </label>
      </div>
      <label class="cam-label">
        高度 (m)
        <input v-model.number="height" type="number" step="100" class="cam-input" />
      </label>
    </div>

    <!-- 实体选择 -->
    <label v-if="showEntity" class="cam-label">
      目标实体
      <select v-model="entityTarget" class="cam-input">
        <option v-for="lm in LANDMARKS" :key="lm.name" :value="lm.name">
          {{ lm.name }}
        </option>
      </select>
    </label>

    <!-- 轨迹说明 -->
    <div v-if="showPath" class="cam-path-hint">🛤 将沿虚线路径依次飞行 北京→上海→广州</div>

    <!-- 角度 -->
    <div v-if="showAngles" class="cam-row">
      <label class="cam-label">
        俯仰角 °
        <input v-model.number="pitch" type="number" step="5" class="cam-input" />
      </label>
      <label class="cam-label">
        方位角 °
        <input v-model.number="heading" type="number" step="5" class="cam-input" />
      </label>
    </div>

    <!-- 时长 -->
    <label v-if="showDuration" class="cam-label">
      飞行时长 (秒)
      <input v-model.number="duration" type="number" step="0.5" class="cam-input" />
    </label>

    <!-- 操作按钮 -->
    <div class="cam-actions">
      <button class="cam-btn-start" @click="doStart">开始飞行</button>
      <button class="cam-btn-stop" @click="cancelFlight">停止</button>
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.cam-status {
  font-size: 11px;
  color: vars.$exo-text-dim;
  transition: color 0.2s;
}

.cam-mode-bar {
  display: flex;
  gap: 2px;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 3px;
}

.cam-mode-tab {
  flex: 1;
  padding: 5px 0;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  background: transparent;
  color: vars.$exo-text-muted;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: vars.$exo-text-primary;
    background: rgba(vars.$exo-cyan, 0.06);
  }

  &.active {
    background: rgba(vars.$exo-cyan, 0.18);
    color: vars.$exo-cyan;
    font-weight: 600;
  }
}

.cam-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.cam-preset-btn {
  padding: 3px 10px;
  font-size: 12px;
  background: rgba(vars.$exo-cyan, 0.08);
  border: 1px solid rgba(vars.$exo-cyan, 0.2);
  border-radius: 4px;
  color: vars.$exo-text-muted;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(vars.$exo-cyan, 0.15);
    color: vars.$exo-cyan;
    border-color: rgba(vars.$exo-cyan, 0.4);
  }
}

.cam-coords {
  margin-bottom: 8px;
}

.cam-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.cam-label {
  flex: 1;
  font-size: 11px;
  color: vars.$exo-text-dim;
  display: block;
  margin-bottom: 6px;
}

.cam-input {
  display: block;
  width: 100%;
  margin-top: 2px;
  padding: 4px 6px;
  font-size: 12px;
  background: #0a1628;
  border: 1px solid rgba(vars.$exo-cyan, 0.2);
  border-radius: 4px;
  color: vars.$exo-text-primary;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: vars.$exo-cyan;
  }
}

.cam-path-hint {
  font-size: 11px;
  color: vars.$exo-text-muted;
  margin-bottom: 8px;
}

.cam-actions {
  display: flex;
  gap: 8px;
  margin-top: 2px;
}

.cam-btn-start {
  flex: 1;
  padding: 6px 0;
  font-size: 13px;
  font-weight: 600;
  background: rgba(vars.$exo-cyan, 0.15);
  border: 1px solid rgba(vars.$exo-cyan, 0.35);
  border-radius: 6px;
  color: vars.$exo-cyan;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(vars.$exo-cyan, 0.25);
  }
}

.cam-btn-stop {
  padding: 6px 12px;
  font-size: 13px;
  background: rgba(244, 67, 54, 0.08);
  border: 1px solid rgba(244, 67, 54, 0.25);
  border-radius: 6px;
  color: #ef5350;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgba(244, 67, 54, 0.15);
  }
}
</style>
