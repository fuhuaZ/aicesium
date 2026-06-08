<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useExamplesStore } from '@/stores/examples'
import { getExampleById } from '@/examples/registry'

const route = useRoute()
const store = useExamplesStore()

onMounted(() => {
  const exampleId = route.params.exampleId as string
  const example = getExampleById(exampleId)
  if (example) {
    store.selectExample(example)
  }
})
</script>

<template>
  <div class="example-view">
    <div v-if="!store.activeExample" class="example-empty">
      <p>请从左侧列表选择一个示例</p>
    </div>
  </div>
</template>

<style scoped>
.example-view {
  display: none;
}

.example-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #3a5068;
  font-size: 14px;
}
</style>
