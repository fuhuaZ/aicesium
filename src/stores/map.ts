import { ref } from 'vue'
import { defineStore } from 'pinia'

export type MapTool = 'pan' | 'measure' | 'pick' | 'viewshed' | null
export type MapLayer = 'heatmap' | 'video' | 'parking' | 'device'

export const useMapStore = defineStore('map', () => {
  const activeTool = ref<MapTool>(null)
  const visibleLayers = ref<Set<MapLayer>>(new Set())
  const cameraInfo = ref({ lng: 0, lat: 0, height: 0, heading: 0, pitch: 0 })
  const selectedEntity = ref<string | null>(null)
  const fps = ref(0)

  function setTool(tool: MapTool) {
    activeTool.value = tool
  }

  function toggleLayer(layer: MapLayer) {
    if (visibleLayers.value.has(layer)) {
      visibleLayers.value.delete(layer)
    } else {
      visibleLayers.value.add(layer)
    }
    // trigger reactivity
    visibleLayers.value = new Set(visibleLayers.value)
  }

  function setLayerVisible(layer: MapLayer, visible: boolean) {
    if (visible) {
      visibleLayers.value.add(layer)
    } else {
      visibleLayers.value.delete(layer)
    }
    visibleLayers.value = new Set(visibleLayers.value)
  }

  function updateCamera(info: {
    lng: number
    lat: number
    height: number
    heading: number
    pitch: number
  }) {
    cameraInfo.value = info
  }

  function selectEntity(id: string | null) {
    selectedEntity.value = id
  }

  function setFps(value: number) {
    fps.value = value
  }

  return {
    activeTool,
    visibleLayers,
    cameraInfo,
    selectedEntity,
    fps,
    setTool,
    toggleLayer,
    setLayerVisible,
    updateCamera,
    selectEntity,
    setFps,
  }
})
