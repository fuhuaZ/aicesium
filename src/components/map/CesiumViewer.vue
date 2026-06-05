<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/map'
import * as Cesium from 'cesium'

const mapStore = useMapStore()
const container = ref<HTMLDivElement>()
let viewer: Cesium.Viewer | null = null

// 默认定位到上海张江
const DEFAULT_POSITION = {
  lng: 121.605,
  lat: 31.205,
  height: 1200,
  heading: 0,
  pitch: -45,
}

onMounted(() => {
  if (!container.value) return
  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4YTQxOTRlMy04NDhjLTRmZTctODUxZC1hZDEyNTZmYWZkMTUiLCJpZCI6MzMzOTg4LCJpYXQiOjE3NTU3NTY2NjN9.0WZ_KJGswmjBdGrIzrw6UMJi5z1wBOP_Fl8DW47NK-o'

  viewer = new Cesium.Viewer(container.value, {
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    geocoder: false,
    infoBox: false,
    selectionIndicator: false,
    sceneMode: Cesium.SceneMode.SCENE3D,
  })

    // 移除默认底图商标
    ; (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none'

  // 设置初始视角
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      DEFAULT_POSITION.lng,
      DEFAULT_POSITION.lat,
      DEFAULT_POSITION.height,
    ),
    orientation: {
      heading: Cesium.Math.toRadians(DEFAULT_POSITION.heading),
      pitch: Cesium.Math.toRadians(DEFAULT_POSITION.pitch),
      roll: 0,
    },
  })

  // 添加简单的示意建筑
  addDemoBuildings()

  // 监听相机变化 → 更新 store
  viewer.camera.changed.addEventListener(onCameraChange)
  viewer.camera.moveEnd.addEventListener(onCameraChange)

  // 帧率监听
  let lastTime = performance.now()
  let frameCount = 0
  const onFrame = () => {
    frameCount++
    const now = performance.now()
    if (now - lastTime >= 1000) {
      mapStore.setFps(frameCount)
      frameCount = 0
      lastTime = now
    }
    requestAnimationFrame(onFrame)
  }
  requestAnimationFrame(onFrame)

  // 初始触发一次
  onCameraChange()
})

onUnmounted(() => {
  if (viewer) {
    viewer.camera.changed.removeEventListener(onCameraChange)
    viewer.camera.moveEnd.removeEventListener(onCameraChange)
    viewer.destroy()
    viewer = null
  }
})

function onCameraChange() {
  if (!viewer) return
  const cartographic = viewer.camera.positionCartographic
  mapStore.updateCamera({
    lng: Cesium.Math.toDegrees(cartographic.longitude),
    lat: Cesium.Math.toDegrees(cartographic.latitude),
    height: cartographic.height,
    heading: Cesium.Math.toDegrees(viewer.camera.heading),
    pitch: Cesium.Math.toDegrees(viewer.camera.pitch),
  })
}

function addDemoBuildings() {
  if (!viewer) return

  // 中心建筑群
  const buildings = [
    { lng: 121.605, lat: 31.205, w: 80, d: 60, h: 80, color: '#1a3a5c', name: '研发中心A' },
    { lng: 121.606, lat: 31.2045, w: 50, d: 50, h: 60, color: '#1a3a5c', name: '研发中心B' },
    { lng: 121.6042, lat: 31.2045, w: 60, d: 40, h: 50, color: '#1a3a5c', name: '数据中心' },
    { lng: 121.6048, lat: 31.2058, w: 70, d: 50, h: 65, color: '#1a3a5c', name: '行政楼' },
    { lng: 121.6058, lat: 31.2058, w: 40, d: 40, h: 40, color: '#1a3a5c', name: '食堂' },
  ]

  buildings.forEach((b) => {
    viewer!.entities.add({
      name: b.name,
      position: Cesium.Cartesian3.fromDegrees(b.lng, b.lat),
      box: {
        dimensions: new Cesium.Cartesian3(b.w, b.d, b.h),
        material: Cesium.Color.fromCssColorString(b.color).withAlpha(0.85),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString('#4FC3F7').withAlpha(0.4),
        outlineWidth: 1,
      },
    })
  })

  // 地面范围示意
  viewer.entities.add({
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        121.6, 31.202, 121.61, 31.202, 121.61, 31.21, 121.6, 31.21,
      ]),
      material: Cesium.Color.fromCssColorString('#4FC3F7').withAlpha(0.05),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString('#4FC3F7').withAlpha(0.3),
      outlineWidth: 2,
    },
  })

  // 园区标签
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(121.605, 31.2035),
    label: {
      text: 'AI 智慧园区',
      font: 'bold 28px sans-serif',
      fillColor: Cesium.Color.fromCssColorString('#4FC3F7').withAlpha(0.6),
      outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -20),
      scale: 0.8,
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000),
    },
  })
}

// 暴露 viewer 给父组件通过 slot/template ref 使用
defineExpose({ getViewer: () => viewer })
</script>

<template>
  <div ref="container" class="cesium-container" />
</template>

<style scoped>
.cesium-container {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
