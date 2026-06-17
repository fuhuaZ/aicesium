<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let intervalId: ReturnType<typeof setInterval> | null = null

function formatTime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

function draw(): void {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const logicalW = window.innerWidth
  const logicalH = window.innerHeight

  canvas.width = logicalW * dpr
  canvas.height = logicalH * dpr

  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, logicalW, logicalH)

  const timeStr = formatTime(new Date())
  const cols = 5
  const rows = 4
  const spacingX = logicalW / cols
  const spacingY = logicalH / rows

  ctx.font = '16px Arial, Helvetica, sans-serif'
  ctx.fillStyle = 'rgba(180, 180, 180, 0.15)'
  ctx.textBaseline = 'top'

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = (i + 0.5) * spacingX
      const y = (j + 0.5) * spacingY
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-22 * Math.PI / 180)
      ctx.fillText(timeStr, 0, 0)
      ctx.restore()
    }
  }
}

function handleResize(): void {
  draw()
}

function handleVisibilityChange(): void {
  if (document.hidden) {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  } else {
    draw()
    intervalId = setInterval(draw, 1000)
  }
}

onMounted(() => {
  draw()
  intervalId = setInterval(draw, 1000)
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <Teleport to="body">
    <canvas
      ref="canvasRef"
      aria-hidden="true"
      role="presentation"
      data-watermark
    />
  </Teleport>
</template>

<style scoped>
canvas {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
}

@media print {
  canvas {
    display: none;
  }
}
</style>
