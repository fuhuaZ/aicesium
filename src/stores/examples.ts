import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { exampleRegistry, getExamplesByTech } from '@/examples/registry'
import type { TechId, ExampleMeta, DisposeFn } from '@/types/examples'
import { CATEGORIES, TECHNOLOGIES } from '@/types/examples'
import * as Cesium from 'cesium'

export const useExamplesStore = defineStore('examples', () => {
  const activeTech = ref<TechId>('cesium')
  const activeExample = ref<ExampleMeta | null>(null)
  let currentDispose: DisposeFn | null = null
  let viewer: Cesium.Viewer | null = null
  const activeCode = ref('')
  const sidebarCollapsed = ref(false)

  const technologies = TECHNOLOGIES
  const categories = CATEGORIES
  const currentExamples = computed(() => getExamplesByTech(activeTech.value))
  const totalCount = exampleRegistry.length

  const techCounts = computed(() => {
    const map: Record<string, number> = {}
    for (const ex of exampleRegistry) {
      map[ex.tech] = (map[ex.tech] || 0) + 1
    }
    return map
  })

  const treeData = computed(() =>
    categories
      .map((cat) => {
        const examples = currentExamples.value.filter((e) => e.category === cat.id)
        if (examples.length === 0) return null
        return {
          label: `${cat.icon} ${cat.name} (${examples.length})`,
          key: `cat-${cat.id}`,
          children: examples.map((ex) => ({
            label: ex.title,
            key: ex.id,
            isLeaf: true,
          })),
        }
      })
      .filter(Boolean),
  )

  function setViewer(v: Cesium.Viewer) {
    viewer = v
  }

  function setTech(tech: TechId) {
    activeTech.value = tech
    activeExample.value = null
    activeCode.value = ''
    if (currentDispose) {
      currentDispose()
      currentDispose = null
    }
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
    activeTech,
    activeExample,
    activeCode,
    sidebarCollapsed,
    technologies,
    categories,
    currentExamples,
    treeData,
    totalCount,
    techCounts,
    setViewer,
    setTech,
    selectExample,
    toggleSidebar,
    dispose,
  }
})
