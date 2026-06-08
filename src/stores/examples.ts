import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { exampleRegistry, getExamplesByTech } from '@/examples/registry'
import type { TechId, ExampleMeta, DisposeFn } from '@/types/examples'
import { CATEGORIES, TECHNOLOGIES } from '@/types/examples'
import * as Cesium from 'cesium'

const moduleLoaders = import.meta.glob('../examples/**/*.{ts,tsx}')
const sourceLoaders = import.meta.glob('../examples/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
})

function resolveModulePath(example: ExampleMeta, ext: string) {
  return `../examples/${example.category}/${example.id}.${ext}`
}

async function loadModule(example: ExampleMeta) {
  const tsxLoader = moduleLoaders[resolveModulePath(example, 'tsx')]
  if (tsxLoader) return tsxLoader()
  const tsLoader = moduleLoaders[resolveModulePath(example, 'ts')]
  if (tsLoader) return tsLoader()
  throw new Error(`Module not found: ${example.id}`)
}

async function loadSource(example: ExampleMeta): Promise<string> {
  const tsxLoader = sourceLoaders[resolveModulePath(example, 'tsx')]
  if (tsxLoader) return tsxLoader()
  const tsLoader = sourceLoaders[resolveModulePath(example, 'ts')]
  if (tsLoader) return tsLoader()
  return '// Unable to load source code'
}

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
      .filter(Boolean)
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
      const mod = await loadModule(example)
      currentDispose = mod.init(viewer)
    } catch (err) {
      console.error('Failed to load example:', example.id, err)
    }

    const sourceCode = await loadSource(example)
    activeCode.value = sourceCode
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
