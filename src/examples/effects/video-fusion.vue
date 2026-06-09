<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'

const props = defineProps<{
  viewer: Cesium.Viewer
}>()

const viewer = props.viewer

// ===================== 状态 =====================
const playing = ref(false)
const muted = ref(true)
const loop = ref(true)
const showGround = ref(true)
const showScreen = ref(true)
const showModel = ref(true)
const currentTime = ref(0)
const duration = ref(0)

// ===================== 视频元素 =====================
let videoEl: HTMLVideoElement | null = null

// ===================== 实体引用 =====================
const groundEntities: Cesium.Entity[] = []
let screenEntity: Cesium.Entity | null = null
let modelEntity: Cesium.Entity | null = null
let modelShader: Cesium.CustomShader | null = null

const centerLng = 116.4
const centerLat = 39.91

// ===================== 时间更新 =====================
let timeRaf = 0
function updateTime() {
  if (videoEl) {
    currentTime.value = videoEl.currentTime
    duration.value = videoEl.duration || 0
  }
  timeRaf = requestAnimationFrame(updateTime)
}

// ===================== 控制方法 =====================
function togglePlay() {
  if (!videoEl) return
  if (videoEl.paused) {
    videoEl.play()
    playing.value = true
  } else {
    videoEl.pause()
    playing.value = false
  }
}

function toggleMute() {
  if (!videoEl) return
  muted.value = !muted.value
  videoEl.muted = muted.value
}

function toggleLoop() {
  if (!videoEl) return
  loop.value = !loop.value
  videoEl.loop = loop.value
}

function toggleGround() {
  showGround.value = !showGround.value
  groundEntities.forEach((e) => {
    e.show = showGround.value
  })
}

function toggleScreen() {
  showScreen.value = !showScreen.value
  if (screenEntity) screenEntity.show = showScreen.value
}

function toggleModelTexture() {
  showModel.value = !showModel.value
  if (!modelEntity) return

  if (showModel.value) {
    console.log('videoEl', videoEl)

    if (videoEl) applyModelShader(videoEl)
  } else {
    removeModelShader()
  }
}

// ===================== 模型贴附 (CustomShader 替换模型纹理) =====================
function applyModelShader(_video: HTMLVideoElement) {
  if (!modelEntity || modelShader) return

  modelShader = new Cesium.CustomShader({
    mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        vec4 videoColor = texture(u_video, fsInput.attributes.texCoord_0);
        material.diffuse = mix(material.diffuse, videoColor.rgb, 0.7);
        material.alpha = 1.0;
      }
    `,
    uniforms: {
      u_video: {
        type: Cesium.UniformType.SAMPLER_2D,
        value: _video,
      },
    },
  })
  ;(modelEntity.model as any).customShader = modelShader
}

function removeModelShader() {
  if (!modelEntity) return
  modelShader = null
  ;(modelEntity.model as any).customShader = undefined
}

function formatTime(t: number) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// ===================== 创建垂直视频屏幕 (Entity.plane) =====================
function createScreenEntity(video: HTMLVideoElement) {
  // Plane 法线朝北 (UNIT_Y)，屏幕面向南方
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(centerLng + 0.015, centerLat + 0.002, 75),
    plane: {
      plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Y, 0),
      dimensions: new Cesium.Cartesian2(200, 150),
      material: video,
    },
  })
  return entity
}

// ===================== 创建地面视频投影 (Rectangle Entities) =====================
function createGroundProjection(video: HTMLVideoElement) {
  // 主地面投影区域（height: 1 避免走 GroundPrimitive 批处理，确保视频纹理正常刷新）
  const entity = viewer.entities.add({
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(
        centerLng - 0.01,
        centerLat - 0.006,
        centerLng + 0.01,
        centerLat + 0.006,
      ),
      height: 1,
      material: video,
      outline: true,
      outlineColor: Cesium.Color.CYAN.withAlpha(0.6),
      outlineWidth: 2,
    },
  })
  groundEntities.push(entity)

  // 投影区域标签
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(centerLng, centerLat - 0.007, 0),
    label: {
      text: '地面视频投影',
      font: '13px sans-serif',
      fillColor: Cesium.Color.CYAN,
      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
      backgroundPadding: new Cesium.Cartesian2(8, 4),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
  groundEntities.push(entity)
}

// ===================== 加载 3D 模型 =====================
async function loadModel() {
  try {
    const modelPos = Cesium.Cartesian3.fromDegrees(centerLng + 0.002, centerLat - 0.004, 1000)
    const heading = Cesium.Math.toRadians(225)
    const pitch = 0
    const roll = 0
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)

    modelEntity = viewer.entities.add({
      name: 'Room Model',
      position: modelPos,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(modelPos, hpr),
      model: {
        uri: '/models/Room.gltf',
        scale: 1.0,
        minimumPixelSize: 80,
        maximumScale: 500,
      },
    })

    await viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(centerLng + 0.006, centerLat - 0.003, 500),
      orientation: {
        heading: Cesium.Math.toRadians(15),
        pitch: Cesium.Math.toRadians(-35),
        roll: 0,
      },
    })
    setTimeout(() => {
      // 模型加载完成后，若视频已就绪则自动贴附
      if (videoEl && showModel.value) {
        applyModelShader(videoEl)
      }
    }, 1000)
  } catch {
    console.warn('Failed to load Room model')
  }
}

// ===================== 生命周期 =====================
onMounted(() => {
  // 创建视频元素
  videoEl = document.createElement('video')
  videoEl.src = '/video/sucai.mp4'
  videoEl.loop = loop.value
  videoEl.muted = muted.value
  videoEl.crossOrigin = 'anonymous'
  videoEl.playsInline = true

  videoEl.addEventListener('play', () => {
    playing.value = true
  })
  videoEl.addEventListener('pause', () => {
    playing.value = false
  })
  videoEl.addEventListener('loadedmetadata', () => {
    duration.value = videoEl!.duration || 0
  })
  videoEl.addEventListener('ended', () => {
    if (!loop.value) playing.value = false
  })

  // 先加载视频元数据，再创建场景元素
  videoEl.addEventListener('loadeddata', () => {
    groundEntities.length = 0
    createGroundProjection(videoEl!)
    screenEntity = createScreenEntity(videoEl!)
    videoEl!.play().catch(() => {
      // 浏览器可能阻止自动播放，用户手动点播放
    })
  })

  videoEl.load()
  updateTime()
  loadModel()
})

onUnmounted(() => {
  cancelAnimationFrame(timeRaf)
  if (videoEl) {
    videoEl.pause()
    videoEl.removeAttribute('src')
    videoEl.load()
    videoEl = null
  }
  viewer.entities.removeAll()
})
</script>

<template>
  <div class="vf-panel" @mousedown.stop @click.stop>
    <!-- 标题 -->
    <div class="vf-header">
      <span class="vf-title">视频融合</span>
      <span class="vf-status">{{ playing ? '播放中' : '已暂停' }}</span>
    </div>

    <!-- 时间条 -->
    <div class="vf-timebar">
      <span class="vf-time-text">{{ formatTime(currentTime) }}</span>
      <div class="vf-progress">
        <div
          class="vf-progress-fill"
          :style="{ width: duration > 0 ? (currentTime / duration) * 100 + '%' : '0%' }"
        />
      </div>
      <span class="vf-time-text">{{ formatTime(duration) }}</span>
    </div>

    <!-- 控制按钮 -->
    <div class="vf-controls">
      <button class="vf-btn vf-btn-play" @click="togglePlay">
        {{ playing ? '⏸ 暂停' : '▶ 播放' }}
      </button>
      <button class="vf-btn" :class="{ active: muted }" @click="toggleMute">
        {{ muted ? '🔇 静音' : '🔊 有声' }}
      </button>
      <button class="vf-btn" :class="{ active: loop }" @click="toggleLoop">
        {{ loop ? '🔁 循环' : '🔂 单次' }}
      </button>
    </div>

    <!-- 显示切换 -->
    <div class="vf-toggles">
      <label class="vf-toggle">
        <input type="checkbox" :checked="showGround" @change="toggleGround" />
        <span>地面投影</span>
      </label>
      <label class="vf-toggle">
        <input type="checkbox" :checked="showScreen" @change="toggleScreen" />
        <span>竖屏面板</span>
      </label>
      <label class="vf-toggle">
        <input type="checkbox" :checked="showModel" @change="toggleModelTexture" />
        <span>模型贴附</span>
      </label>
    </div>

    <!-- 提示 -->
    <div class="vf-hint">
      视频投射到 <strong>地面</strong> / <strong>竖直屏幕</strong> /
      <strong>Room 模型表面</strong> 上， 可通过复选框独立开关
    </div>
  </div>
</template>

<style scoped lang="scss">
$cyan: #4fc3f7;
$bg-panel: rgba(13, 26, 45, 0.94);
$text-primary: #b0bec5;
$text-muted: #6b8cae;
$text-dim: #4a6580;

.vf-panel {
  position: absolute;
  bottom: 24px;
  left: 16px;
  width: 320px;
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

  .vf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .vf-title {
    font-weight: 700;
    font-size: 14px;
    color: $cyan;
  }

  .vf-status {
    font-size: 11px;
    color: $text-dim;
  }

  .vf-timebar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .vf-time-text {
    font-size: 11px;
    color: $text-dim;
    min-width: 32px;
    text-align: center;
  }

  .vf-progress {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;

    .vf-progress-fill {
      height: 100%;
      background: $cyan;
      border-radius: 2px;
      transition: width 0.3s linear;
    }
  }

  .vf-controls {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .vf-btn {
    padding: 5px 12px;
    font-size: 12px;
    background: rgba($cyan, 0.08);
    border: 1px solid rgba($cyan, 0.2);
    border-radius: 4px;
    color: $text-muted;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
      background: rgba($cyan, 0.15);
      color: $cyan;
      border-color: rgba($cyan, 0.4);
    }

    &.active {
      background: rgba($cyan, 0.12);
      color: $cyan;
      border-color: rgba($cyan, 0.3);
    }
  }

  .vf-btn-play {
    flex: 1;
    font-weight: 600;
    padding: 6px 0;
  }

  .vf-toggles {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
  }

  .vf-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: $text-muted;
    cursor: pointer;

    input[type='checkbox'] {
      accent-color: $cyan;
      width: 14px;
      height: 14px;
      cursor: pointer;
    }
  }

  .vf-hint {
    font-size: 11px;
    color: $text-dim;
    line-height: 1.5;
    border-top: 1px solid rgba($cyan, 0.1);
    padding-top: 8px;

    strong {
      color: $text-muted;
    }
  }
}
</style>
