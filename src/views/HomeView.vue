<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useExamplesStore } from '@/stores/examples'
import { getExamplesByCategory } from '@/examples/registry'
import type { CategoryId } from '@/types/examples'

const router = useRouter()
const store = useExamplesStore()

function openCategory(category: CategoryId) {
  const examples = getExamplesByCategory(category, store.activeTech)
  const firstExample = examples[0]
  if (firstExample) {
    store.selectExample(firstExample)
    router.push(`/example/${firstExample.tech}/${category}/${firstExample.id}`)
  }
}
</script>

<template>
  <div class="home-view">
    <div class="home-hero">
      <h1 class="home-title">3D Examples Platform</h1>
      <p class="home-subtitle">
        三维技术示例平台，涵盖 Cesium / Three.js / WebGL 等技术的功能示例与最佳实践
      </p>
    </div>
    <div class="home-grid">
      <button v-for="cat in store.categories" :key="cat.id" class="home-card" @click="openCategory(cat.id)">
        <span class="card-icon">{{ cat.icon }}</span>
        <span class="card-name">{{ cat.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  gap: 40px;
}

.home-hero {
  text-align: center;
}

.home-title {
  font-size: 32px;
  font-weight: 700;
  color: #4fc3f7;
  margin: 0 0 12px;
  letter-spacing: 1px;
}

.home-subtitle {
  font-size: 14px;
  color: #4a6580;
  max-width: 520px;
  line-height: 1.6;
}

.home-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 32px;
  background: rgba(79, 195, 247, 0.04);
  border: 1px solid rgba(79, 195, 247, 0.1);
  border-radius: 8px;
  color: #b0bec5;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.home-card:hover {
  background: rgba(79, 195, 247, 0.08);
  border-color: rgba(79, 195, 247, 0.3);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 28px;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
}
</style>
