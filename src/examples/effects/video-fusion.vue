<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import ExamplePanel from '@/components/examples/ExamplePanel.vue'

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

// ===================== 模型视频纹理 (Canvas + raf) =====================
let modelTextureCanvas: HTMLCanvasElement | null = null
let modelTextureCtx: CanvasRenderingContext2D | null = null
let modelTextureRaf = 0
let modelTextureSize = { w: 0, h: 0 }

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
    if (videoEl) applyModelShader(videoEl)
  } else {
    removeModelShader()
  }
}

// ===================== 模型贴附 (CustomShader 替换模型纹理) =====================
function applyModelShader(video: HTMLVideoElement) {
  if (!modelEntity || modelShader) return

  // 初始化 canvas（限制尺寸以控制性能）
  const maxSize = 1080
  const vw = video.videoWidth || maxSize
  const vh = video.videoHeight || maxSize
  const ratio = Math.min(maxSize / vw, maxSize / vh, 1)
  const cw = Math.max(1, Math.floor(vw * ratio))
  const ch = Math.max(1, Math.floor(vh * ratio))

  modelTextureCanvas = document.createElement('canvas')
  modelTextureCanvas.width = cw
  modelTextureCanvas.height = ch
  modelTextureCtx = modelTextureCanvas.getContext('2d', { willReadFrequently: true })
  modelTextureSize = { w: cw, h: ch }

  // 占位 1×1 像素，确保 shader 可创建
  const placeholder = new Uint8Array([0, 0, 0, 0])
  const initialUniform = new Cesium.TextureUniform({
    typedArray: placeholder,
    width: 1,
    height: 1,
    pixelFormat: Cesium.PixelFormat.RGBA,
    pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
  })

  modelShader = new Cesium.CustomShader({
    mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        // ScreenSurface vertices are marked red (COLOR_0.r = 1.0);
        // all other meshes are black (COLOR_0.r = 0.0).
        // Only apply video texture to the screen.
        if (fsInput.attributes.color_0.r > 0.5) {
          vec4 textureColor = texture(u_normalMap, fsInput.attributes.texCoord_0);
          material.diffuse = textureColor.rgb;
          material.alpha = 1.0;
        }
      }
    `,
    uniforms: {
      u_normalMap: {
        type: Cesium.UniformType.SAMPLER_2D,
        value: initialUniform,
      },
    },
  })
  ;(modelEntity.model as any).customShader = modelShader

  startModelTextureLoop(video)
}

function startModelTextureLoop(video: HTMLVideoElement) {
  const tick = () => {
    if (
      modelShader &&
      modelTextureCtx &&
      modelTextureCanvas &&
      video.readyState >= 2 &&
      !video.paused &&
      !video.ended
    ) {
      const { w, h } = modelTextureSize
      try {
        modelTextureCtx.drawImage(video, 0, 0, w, h)
        const imageData = modelTextureCtx.getImageData(0, 0, w, h)
        const newUniform = new Cesium.TextureUniform({
          typedArray: new Uint8Array(imageData.data.buffer),
          width: w,
          height: h,
          pixelFormat: Cesium.PixelFormat.RGBA,
          pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE,
        })
        ;(modelShader as any).setUniform('u_normalMap', newUniform)
      } catch {
        // 跨域或解码异常时跳过该帧
      }
    }
    modelTextureRaf = requestAnimationFrame(tick)
  }
  modelTextureRaf = requestAnimationFrame(tick)
}

function stopModelTextureLoop() {
  if (modelTextureRaf) {
    cancelAnimationFrame(modelTextureRaf)
    modelTextureRaf = 0
  }
  modelTextureCanvas = null
  modelTextureCtx = null
  modelTextureSize = { w: 0, h: 0 }
}

function removeModelShader() {
  stopModelTextureLoop()
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
    const modelPos = Cesium.Cartesian3.fromDegrees(centerLng + 0.002, centerLat - 0.004, 1500)
    const heading = Cesium.Math.toRadians(315)
    const pitch = 0
    const roll = 0
    const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)

    modelEntity = viewer.entities.add({
      name: 'Computer Model',
      position: modelPos,
      orientation: Cesium.Transforms.headingPitchRollQuaternion(modelPos, hpr),
      model: {
        uri: '/models/computer.glb',
        scale: 3.0,
        minimumPixelSize: 500,
        maximumScale: 5000,
      },
    })

    await viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(centerLng + 0.004, centerLat - 0.002, 1200),
      orientation: {
        heading: Cesium.Math.toRadians(135),
        pitch: Cesium.Math.toRadians(-15),
        roll: 0,
      },
    })
    // 模型加载完成后，若视频已就绪则自动贴附
    if (videoEl && videoEl.readyState >= 2 && showModel.value) {
      applyModelShader(videoEl)
    }
  } catch {
    console.warn('Failed to load Computer model')
  }
}

// ===================== 生命周期 =====================
onMounted(() => {
  // 1) 创建视频元素，先不设 src
  videoEl = document.createElement('video')
  videoEl.loop = loop.value
  videoEl.muted = muted.value
  videoEl.crossOrigin = 'anonymous'
  videoEl.playsInline = true

  // 2) 定义回调
  const onLoadedData = () => {
    if (!videoEl) return
    groundEntities.length = 0
    createGroundProjection(videoEl)
    screenEntity = createScreenEntity(videoEl)
    videoEl.play().catch(() => {
      // 浏览器可能阻止自动播放，用户手动点播放
    })
    // 视频就绪后，若模型已加载且未贴附，则补贴附
    if (showModel.value && modelEntity && !modelShader) {
      applyModelShader(videoEl)
    }
  }
  const onLoadedMeta = () => {
    if (videoEl) duration.value = videoEl.duration || 0
  }

  // 3) 先注册全部监听器
  videoEl.addEventListener('play', () => {
    playing.value = true
  })
  videoEl.addEventListener('pause', () => {
    playing.value = false
  })
  videoEl.addEventListener('loadedmetadata', onLoadedMeta)
  videoEl.addEventListener('ended', () => {
    if (!loop.value) playing.value = false
  })
  videoEl.addEventListener('loadeddata', onLoadedData)

  // 4) 后赋 src 并 load
  videoEl.src = '/video/sucai.mp4'
  videoEl.load()

  // 5) 缓存兜底：若已就绪 (HAVE_CURRENT_DATA=2)，同步触发回调
  if (videoEl.readyState >= 2) {
    onLoadedMeta()
    onLoadedData()
  }

  updateTime()
  loadModel()
})

onUnmounted(() => {
  cancelAnimationFrame(timeRaf)
  timeRaf = 0

  stopModelTextureLoop()

  const v = videoEl
  videoEl = null
  if (v) {
    v.pause()
    v.src = ''
    v.load()
  }

  screenEntity = null
  modelEntity = null
  modelShader = null
  groundEntities.length = 0

  viewer.entities.removeAll()
})
</script>

<template>
  <ExamplePanel title="视频融合" width="320px">
    <template #header-right>
      <span class="vf-status">{{ playing ? '播放中' : '已暂停' }}</span>
    </template>

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
      <strong>电脑屏幕</strong> 上， 可通过复选框独立开关
    </div>
  </ExamplePanel>
</template>

<style scoped lang="scss">
@use '@/styles/example-vars' as vars;

.vf-status {
  font-size: 11px;
  color: vars.$exo-text-dim;
}

.vf-timebar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.vf-time-text {
  font-size: 11px;
  color: vars.$exo-text-dim;
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
    background: vars.$exo-cyan;
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

  &.active {
    background: rgba(vars.$exo-cyan, 0.12);
    color: vars.$exo-cyan;
    border-color: rgba(vars.$exo-cyan, 0.3);
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
  color: vars.$exo-text-muted;
  cursor: pointer;

  input[type='checkbox'] {
    accent-color: vars.$exo-cyan;
    width: 14px;
    height: 14px;
    cursor: pointer;
  }
}

.vf-hint {
  font-size: 11px;
  color: vars.$exo-text-dim;
  line-height: 1.5;
  border-top: 1px solid rgba(vars.$exo-cyan, 0.1);
  padding-top: 8px;

  strong {
    color: vars.$exo-text-muted;
  }
}
</style>
