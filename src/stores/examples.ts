import { ref, computed, shallowRef } from 'vue'
import type { Component } from 'vue'
import { defineStore } from 'pinia'
import { exampleRegistry, getExamplesByTech } from '@/examples/registry'
import type { TechId, ExampleMeta, DisposeFn } from '@/types/examples'
import { CATEGORIES, TECHNOLOGIES } from '@/types/examples'
import * as Cesium from 'cesium'

// .vue 组件加载器
const vueLoaders = import.meta.glob<{ default: Component }>('../examples/**/*.vue')

// 旧版 .ts/.tsx 模块加载器
const moduleLoaders = import.meta.glob('../examples/**/*.{ts,tsx}')

// 源码加载器（.vue/.tsx/.ts）
const sourceLoaders = import.meta.glob('../examples/**/*.{vue,tsx,ts}', {
  query: '?raw',
  import: 'default',
})

function resolvePath(example: ExampleMeta, ext: string) {
  return `../examples/${example.category}/${example.id}.${ext}`
}

async function loadVueComponent(example: ExampleMeta): Promise<Component | null> {
  const loader = vueLoaders[resolvePath(example, 'vue')]
  if (!loader) return null
  const mod = await loader()
  return mod.default
}

async function loadLegacyModule(example: ExampleMeta) {
  const tsxLoader = moduleLoaders[resolvePath(example, 'tsx')]
  if (tsxLoader) return tsxLoader()
  const tsLoader = moduleLoaders[resolvePath(example, 'ts')]
  if (tsLoader) return tsLoader()
  throw new Error(`Module not found: ${example.id}`)
}

async function loadSource(example: ExampleMeta): Promise<string> {
  const vueLoader = sourceLoaders[resolvePath(example, 'vue')]
  if (vueLoader) return vueLoader()
  const tsxLoader = sourceLoaders[resolvePath(example, 'tsx')]
  if (tsxLoader) return tsxLoader()
  const tsLoader = sourceLoaders[resolvePath(example, 'ts')]
  if (tsLoader) return tsLoader()
  return '// Unable to load source code'
}

export const useExamplesStore = defineStore('examples', () => {
  const activeTech = ref<TechId>('cesium')
  const activeExample = ref<ExampleMeta | null>(null)
  const activeComponent = shallowRef<Component | null>(null)
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
    activeComponent.value = null
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
    activeComponent.value = null

    if (!viewer) return

    // 优先尝试 .vue 组件
    try {
      const component = await loadVueComponent(example)
      if (component) {
        activeComponent.value = component
        const sourceCode = await loadSource(example)
        activeCode.value = sourceCode
        return
      }
    } catch {
      // .vue 不存在，回退到旧版模块
    }

    // 旧版 .ts/.tsx init() 模式
    try {
      const mod = await loadLegacyModule(example)
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
    activeComponent,
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
