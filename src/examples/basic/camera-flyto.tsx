// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { defineComponent, h, createApp, ref, computed, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

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

// ===================== 面板组件 =====================
const CameraFlyPanel = defineComponent({
  props: {
    viewer: { type: Object as () => Cesium.Viewer, required: true },
  },
  setup(props) {
    const viewer = props.viewer

    // ---- 响应式状态 ----
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

    // ---- 实体 ----
    const entities: Cesium.Entity[] = []

    const pathEntity = viewer.entities.add({
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(
          PATH_WAYPOINTS.flatMap((w) => [w.lng, w.lat])
        ),
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

    // ---- 计算属性 ----
    const showPresets = computed(() => mode.value === 'flyto' || mode.value === 'setview')
    const showCoords = computed(() => mode.value !== 'entity')
    const showEntity = computed(() => mode.value === 'entity')
    const showPath = computed(() => mode.value === 'path')
    const showDuration = computed(() => mode.value !== 'setview')
    const showAngles = computed(() => mode.value !== 'path')

    // ---- 方法 ----
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

    // ---- 生命周期 ----
    onUnmounted(() => {
      cancelFlight()
      viewer.entities.removeAll()
    })

    // ---- JSX 渲染 ----
    const presetBtn = (lm: Landmark) => (
      <button class="cam-preset-btn" onClick={() => fillLandmark(lm)}>
        {lm.name}
      </button>
    )

    const modeTab = (m: FlyMode, icon: string, label: string) => (
      <button class={['cam-mode-tab', { active: mode.value === m }]} onClick={() => switchMode(m)}>
        {icon} {label}
      </button>
    )

    const numberInput = (model: { value: number }, label: string, step = 1) => (
      <label class="cam-label">
        {label}
        <input
          class="cam-input"
          type="number"
          step={step}
          value={model.value}
          onInput={(e) => {
            model.value = parseFloat((e.target as HTMLInputElement).value) || 0
          }}
        />
      </label>
    )

    return () => (
      <div
        class="cam-panel"
        onMousedown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div class="cam-header">
          <span class="cam-title">📷 相机飞行控制</span>
          <span class="cam-status">{statusText.value}</span>
        </div>

        {/* 模式切换 */}
        <div class="cam-mode-bar">
          {modeTab('flyto', '✈', '飞行')}
          {modeTab('setview', '⚡', '瞬移')}
          {modeTab('entity', '🎯', '实体')}
          {modeTab('path', '🛤', '轨迹')}
        </div>

        {/* 预设城市 */}
        {showPresets.value && <div class="cam-presets">{LANDMARKS.slice(0, 6).map(presetBtn)}</div>}

        {/* 坐标输入 */}
        {showCoords.value && (
          <div class="cam-coords">
            <div class="cam-row">
              {numberInput(lng, '经度')}
              {numberInput(lat, '纬度')}
            </div>
            {numberInput(height, '高度 (m)', 100)}
          </div>
        )}

        {/* 实体选择 */}
        {showEntity.value && (
          <label class="cam-label">
            目标实体
            <select
              class="cam-input"
              value={entityTarget.value}
              onChange={(e) => {
                entityTarget.value = (e.target as HTMLSelectElement).value
              }}
            >
              {LANDMARKS.map((lm) => (
                <option value={lm.name}>{lm.name}</option>
              ))}
            </select>
          </label>
        )}

        {/* 轨迹说明 */}
        {showPath.value && <div class="cam-path-hint">🛤 将沿虚线路径依次飞行 北京→上海→广州</div>}

        {/* 角度 */}
        {showAngles.value && (
          <div class="cam-row">
            {numberInput(pitch, '俯仰角 °', 5)}
            {numberInput(heading, '方位角 °', 5)}
          </div>
        )}

        {/* 时长 */}
        {showDuration.value && numberInput(duration, '飞行时长 (秒)', 0.5)}

        {/* 操作按钮 */}
        <div class="cam-actions">
          <button class="cam-btn-start" onClick={doStart}>
            开始飞行
          </button>
          <button class="cam-btn-stop" onClick={cancelFlight}>
            停止
          </button>
        </div>
      </div>
    )
  },
})

// ===================== Init & Dispose =====================
export function init(viewer: Cesium.Viewer): DisposeFn {
  const container = viewer.container

  // 创建挂载点 + 组件应用
  const mountEl = document.createElement('div')
  const app = createApp(CameraFlyPanel, { viewer })
  app.mount(mountEl)

  // 追加样式
  const style = document.createElement('style')
  style.textContent = PANEL_CSS
  container.appendChild(style)
  container.appendChild(mountEl)

  return () => {
    app.unmount()
    container.removeChild(mountEl)
    container.removeChild(style)
  }
}

// ===================== 样式 =====================
const PANEL_CSS = /*css*/ `
.cam-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 300px;
  background: rgba(13,26,45,0.94);
  border: 1px solid rgba(79,195,247,0.25);
  border-radius: 8px;
  padding: 14px 16px;
  color: #b0bec5;
  font-family: 'Microsoft YaHei','PingFang SC',sans-serif;
  font-size: 13px;
  z-index: 10;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  pointer-events: auto;
  user-select: none;
}
.cam-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.cam-title { font-weight:700; font-size:14px; color:#4fc3f7; }
.cam-status { font-size:11px; color:#4a6580; transition:color 0.2s; }

.cam-mode-bar {
  display:flex; gap:2px; margin-bottom:10px;
  background:rgba(0,0,0,0.2); border-radius:6px; padding:3px;
}
.cam-mode-tab {
  flex:1; padding:5px 0; border:none; border-radius:4px; font-size:12px;
  background:transparent; color:#6b8cae; cursor:pointer; transition:all 0.15s;
}
.cam-mode-tab:hover { color:#b0bec5; background:rgba(79,195,247,0.06); }
.cam-mode-tab.active { background:rgba(79,195,247,0.18); color:#4fc3f7; font-weight:600; }

.cam-presets { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
.cam-preset-btn {
  padding:3px 10px; font-size:12px; background:rgba(79,195,247,0.08);
  border:1px solid rgba(79,195,247,0.2); border-radius:4px; color:#6b8cae;
  cursor:pointer; transition:all 0.15s;
}
.cam-preset-btn:hover { background:rgba(79,195,247,0.15); color:#4fc3f7; border-color:rgba(79,195,247,0.4); }

.cam-coords { margin-bottom:8px; }
.cam-row { display:flex; gap:8px; margin-bottom:6px; }

.cam-label {
  flex:1; font-size:11px; color:#4a6580; display:block; margin-bottom:6px;
}
.cam-input {
  display:block; width:100%; margin-top:2px; padding:4px 6px; font-size:12px;
  background:#0a1628; border:1px solid rgba(79,195,247,0.2); border-radius:4px;
  color:#b0bec5; outline:none; box-sizing:border-box;
}
.cam-input:focus { border-color:#4fc3f7; }

.cam-path-hint { font-size:11px; color:#6b8cae; margin-bottom:8px; }

.cam-actions { display:flex; gap:8px; margin-top:2px; }
.cam-btn-start {
  flex:1; padding:6px 0; font-size:13px; font-weight:600;
  background:rgba(79,195,247,0.15); border:1px solid rgba(79,195,247,0.35);
  border-radius:6px; color:#4fc3f7; cursor:pointer; transition:all 0.15s;
}
.cam-btn-start:hover { background:rgba(79,195,247,0.25); }
.cam-btn-stop {
  padding:6px 12px; font-size:13px;
  background:rgba(244,67,54,0.08); border:1px solid rgba(244,67,54,0.25);
  border-radius:6px; color:#ef5350; cursor:pointer; transition:all 0.15s;
}
.cam-btn-stop:hover { background:rgba(244,67,54,0.15); }
`
