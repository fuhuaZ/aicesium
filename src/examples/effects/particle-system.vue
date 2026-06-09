<script setup lang="ts">
import * as Cesium from 'cesium'
import { onUnmounted } from 'vue'

const props = defineProps<{ viewer: Cesium.Viewer }>()

const scene = props.viewer.scene

const particleSystem = new Cesium.ParticleSystem({
  image:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYlWNg+M9AAiYmBn5GRgY0AAB/AAv+2m/rAAAAAElFTkSuQmCC',
  startColor: Cesium.Color.DEEPSKYBLUE.withAlpha(0.8),
  endColor: Cesium.Color.WHITE.withAlpha(0.1),
  startScale: 1.0,
  endScale: 4.0,
  minimumParticleLife: 1.0,
  maximumParticleLife: 3.0,
  minimumSpeed: 20.0,
  maximumSpeed: 40.0,
  emissionRate: 30,
  lifetime: 16.0,
  emitter: new Cesium.CircleEmitter(0.5),
  modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0),
  ),
})

scene.primitives.add(particleSystem)

props.viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 600),
})

onUnmounted(() => {
  scene.primitives.remove(particleSystem)
})
</script>

<template>
  <div />
</template>
