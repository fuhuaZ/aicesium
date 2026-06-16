<script setup lang="ts">
defineProps<{
  title: string
  width?: string
}>()
</script>

<template>
  <div class="exo-panel" :style="{ width: width || '280px' }" @mousedown.stop @click.stop>
    <div class="exo-header">
      <span class="exo-title">{{ title }}</span>
      <slot name="header-right" />
    </div>
    <div class="exo-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/example-vars' as vars;

.exo-panel {
  position: absolute;
  bottom: 24px;
  left: 16px;
  background: vars.$exo-bg-panel;
  border: 1px solid vars.$exo-border-color;
  border-radius: 8px;
  padding: 14px 16px;
  color: vars.$exo-text-primary;
  font-family: vars.$exo-font-family;
  font-size: 13px;
  z-index: 10;
  backdrop-filter: blur(8px);
  box-shadow: vars.$exo-shadow;
  user-select: none;
  max-height: 80vh;
  overflow-y: auto;
}

.exo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.exo-title {
  font-weight: 700;
  font-size: 14px;
  color: vars.$exo-cyan;
}

.exo-content {
  // default slot area
}
</style>
