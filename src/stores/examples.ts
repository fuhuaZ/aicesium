import { ref } from 'vue'
import { defineStore } from 'pinia'
import { exampleRegistry, getExamplesByCategory } from '@/examples/registry'
import type { CategoryId, ExampleMeta, DisposeFn } from '@/types/examples'
import { CATEGORIES } from '@/types/examples'

export const useExamplesStore = defineStore('examples', () => {
  const activeCategory = ref<CategoryId>('basic')
  const activeExample = ref<ExampleMeta | null>(null)
  let currentDispose: DisposeFn | null = null
  let viewer: Cesium.Viewer | null = null
  const activeCode = ref('')
  const sidebarCollapsed = ref(false)

  const categories = CATEGORIES
  const currentExamples = ref(getExamplesByCategory(activeCategory.value))
  const totalCount = exampleRegistry.length

  function setViewer(v: Cesium.Viewer) {
    viewer = v
  }

  function setCategory(category: CategoryId) {
    activeCategory.value = category
    currentExamples.value = getExamplesByCategory(category)
  }

  async function selectExample(example: ExampleMeta) {
    if (currentDispose) {
      currentDispose()
      currentDispose = null
    }
    activeExample.value = example

    if (!viewer) return

    try {
      const mod = (await import(`@/examples/${example.category}/${example.id}.ts`)) as {
        init: (v: Cesium.Viewer) => DisposeFn
      }
      currentDispose = mod.init(viewer)
    } catch (err) {
      console.error('Failed to load example:', example.id, err)
    }

    try {
      const raw = await import(`@/examples/${example.category}/${example.id}.ts?raw`)
      activeCode.value = raw.default as string
    } catch {
      activeCode.value = '// Unable to load source code'
    }
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function dispose() {
    if (currentDispose) {
      currentDispose()
      currentDispose = null
    }
  }

  return {
    activeCategory,
    activeExample,
    activeCode,
    sidebarCollapsed,
    categories,
    currentExamples,
    totalCount,
    setViewer,
    setCategory,
    selectExample,
    toggleSidebar,
    dispose,
  }
})
