# Cesium 示例平台 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将数字孪生园区平台重构为 Cesium API 示例平台（ECharts 示例风格布局）

**Architecture:** Vue3 + TypeScript + Pinia + Cesium + Vite。左侧示例列表 + 右侧（上预览/下代码）双栏布局。Cesium Viewer 持久化在 App.vue，通过示例注册表驱动动态加载/卸载场景模块。

**Tech Stack:** Vue3 Composition API, TypeScript, Pinia, Vue Router, Cesium.js, highlight.js, Vite

---

## 文件结构

```
src/
├── types/
│   └── examples.ts              # 示例类型定义
├── examples/
│   ├── registry.ts              # 示例注册表（元数据）
│   ├── basic/                   # 基础入门
│   │   ├── load-basemap.ts
│   │   ├── camera-flyto.ts
│   │   ├── coordinate-pick.ts
│   │   ├── mouse-events.ts
│   │   └── cesium-inspector.ts
│   ├── entity/                  # 实体与几何体
│   │   ├── billboard.ts
│   │   ├── polyline.ts
│   │   ├── polygon.ts
│   │   ├── model-3d.ts
│   │   ├── label.ts
│   │   └── ellipsoid.ts
│   ├── visualization/           # 数据可视化
│   │   ├── primitive-geometry.ts
│   │   ├── dynamic-texture.ts
│   │   ├── migration-lines.ts
│   │   └── cylinder-chart.ts
│   ├── effects/                 # 特效与渲染
│   │   ├── particle-system.ts
│   │   ├── post-process.ts
│   │   ├── custom-shader.ts
│   │   └── water.ts
│   └── terrain/                 # 地形与分析
│       ├── terrain-load.ts
│       ├── viewshed.ts
│       ├── clipping-plane.ts
│       └── measurement.ts
├── stores/
│   └── examples.ts              # 示例相关 Pinia store
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue        # 重写：Logo + 分类Tab
│   │   ├── AppSidebar.vue       # 重写：示例列表
│   │   └── CodePanel.vue        # 新增：代码展示面板
│   └── map/
│       └── CesiumPreview.vue    # 重写：精简 Cesium 容器
├── views/
│   ├── HomeView.vue             # 新增：首页/欢迎
│   └── ExampleView.vue          # 新增：示例主布局
├── router/index.ts              # 重写
├── App.vue                      # 重写
├── assets/main.css              # 更新
└── main.ts                      # 不变
```

---

### Task 1: 清理旧文件

**Files:**
- Delete: `src/views/dashboard/DashboardView.vue`
- Delete: `src/views/heatmap/HeatmapView.vue`
- Delete: `src/views/energy/EnergyView.vue`
- Delete: `src/views/video/VideoFusionView.vue`
- Delete: `src/views/parking/ParkingView.vue`
- Delete: `src/views/alert/AlertView.vue`
- Delete: `src/views/analysis/AnalysisView.vue`
- Delete: `src/components/layout/BottomBar.vue`
- Delete: `src/components/layout/RightPanel.vue`
- Delete: `src/stores/app.ts`
- Delete: `src/stores/map.ts`

删除所有旧数字孪生相关的 views、布局组件和 stores。

```bash
Remove-Item -Recurse -Force src/views/dashboard, src/views/heatmap, src/views/energy, src/views/video, src/views/parking, src/views/alert, src/views/analysis
Remove-Item src/components/layout/BottomBar.vue, src/components/layout/RightPanel.vue, src/stores/app.ts, src/stores/map.ts
```

---

### Task 2: 创建示例类型定义

**Files:**
- Create: `src/types/examples.ts`

```typescript
export type CategoryId = 'basic' | 'entity' | 'visualization' | 'effects' | 'terrain'

export interface Category {
  id: CategoryId
  name: string
  icon: string
}

export interface ExampleMeta {
  id: string
  title: string
  description: string
  category: CategoryId
  tags: string[]
}

export interface DisposeFn {
  (): void
}

export interface ExampleModule {
  init: (viewer: Cesium.Viewer) => DisposeFn
}

export const CATEGORIES: Category[] = [
  { id: 'basic', name: '基础入门', icon: '🏠' },
  { id: 'entity', name: '实体与几何体', icon: '📐' },
  { id: 'visualization', name: '数据可视化', icon: '📊' },
  { id: 'effects', name: '特效与渲染', icon: '✨' },
  { id: 'terrain', name: '地形与分析', icon: '🌍' },
]
```

---

### Task 3: 创建示例注册表

**Files:**
- Create: `src/examples/registry.ts`

```typescript
import type { ExampleMeta } from '@/types/examples'

export const exampleRegistry: ExampleMeta[] = [
  // === 基础入门 ===
  { id: 'load-basemap', title: '加载底图', description: '演示切换不同底图服务（Bing/OSM/ArcGIS）', category: 'basic', tags: ['底图', 'ImageryProvider'] },
  { id: 'camera-flyto', title: '相机飞行', description: '演示 flyTo 动画飞向指定位置', category: 'basic', tags: ['Camera', 'flyTo', '动画'] },
  { id: 'coordinate-pick', title: '坐标拾取', description: '点击地图获取经纬度和高度', category: 'basic', tags: ['拾取', '坐标', '事件'] },
  { id: 'mouse-events', title: '鼠标事件', description: '监听鼠标 LEFT_CLICK / MOUSE_MOVE / RIGHT_CLICK', category: 'basic', tags: ['事件', 'ScreenSpaceEventHandler'] },
  { id: 'cesium-inspector', title: '调试面板', description: '开启/关闭 Cesium Inspector 调试工具', category: 'basic', tags: ['调试', 'Inspector'] },

  // === 实体与几何体 ===
  { id: 'billboard', title: '点标记 Billboard', description: '使用 Billboard 添加图标标记点', category: 'entity', tags: ['Billboard', 'Entity', '图标'] },
  { id: 'polyline', title: '线段 Polyline', description: '绘制空间折线并设置颜色/宽度', category: 'entity', tags: ['Polyline', 'Entity', '折线'] },
  { id: 'polygon', title: '多边形 Polygon', description: '绘制填充多边形并设置颜色/透明度', category: 'entity', tags: ['Polygon', 'Entity', '面'] },
  { id: 'model-3d', title: '3D 模型加载', description: '加载 glTF/glb 格式的三维模型', category: 'entity', tags: ['Model', 'glTF', 'Entity'] },
  { id: 'label', title: '文字标签 Label', description: '添加文字标签并设置字体/颜色/偏移', category: 'entity', tags: ['Label', 'Entity', '文字'] },
  { id: 'ellipsoid', title: '椭球与圆柱', description: '创建 Ellipsoid 和 Cylinder 体元', category: 'entity', tags: ['Ellipsoid', 'Cylinder', 'Entity'] },

  // === 数据可视化 ===
  { id: 'primitive-geometry', title: 'Primitive 几何体', description: '使用 Primitive API 创建高性能几何体', category: 'visualization', tags: ['Primitive', 'GeometryInstance', '性能'] },
  { id: 'dynamic-texture', title: '动态纹理', description: '使用 Canvas 动态生成材质纹理', category: 'visualization', tags: ['Canvas', '纹理', 'Material', '动态'] },
  { id: 'migration-lines', title: '迁徙线动画', description: '动态弧线模拟数据流动/迁徙效果', category: 'visualization', tags: ['动画', '弧线', '流动'] },
  { id: 'cylinder-chart', title: '柱状统计图', description: '使用 Cylinder Entity 聚合生成3D柱状图', category: 'visualization', tags: ['Cylinder', '统计图', '3D图表'] },

  // === 特效与渲染 ===
  { id: 'particle-system', title: '粒子系统', description: '创建烟、火、雨等粒子特效', category: 'effects', tags: ['粒子', 'ParticleSystem', '特效'] },
  { id: 'post-process', title: '后处理特效', description: '添加泛光/夜视/黑白等后处理效果', category: 'effects', tags: ['后处理', 'PostProcessStage', '滤镜'] },
  { id: 'custom-shader', title: '自定义着色器', description: '使用 CustomShader 修改模型外观', category: 'effects', tags: ['着色器', 'CustomShader', 'WebGL'] },
  { id: 'water', title: '水面效果', description: '使用 Water.glsl 创建动态水面', category: 'effects', tags: ['水面', 'Water', '着色器'] },

  // === 地形与分析 ===
  { id: 'terrain-load', title: '地形加载', description: '加载 CesiumTerrainProvider 地形数据', category: 'terrain', tags: ['地形', 'TerrainProvider'] },
  { id: 'viewshed', title: '可视域分析', description: '计算并展示指定点的可见区域', category: 'terrain', tags: ['可视域', 'Viewshed', '分析'] },
  { id: 'clipping-plane', title: '地形开挖', description: '使用 ClippingPlane 实现地形开挖效果', category: 'terrain', tags: ['开挖', 'ClippingPlane', '剖面'] },
  { id: 'measurement', title: '空间量测', description: '量测空间距离/面积/高度', category: 'terrain', tags: ['量测', '距离', '面积', '高度'] },
]

/** 按分类过滤示例 */
export function getExamplesByCategory(category: string): ExampleMeta[] {
  return exampleRegistry.filter((e) => e.category === category)
}

/** 根据 ID 查找示例元数据 */
export function getExampleById(id: string): ExampleMeta | undefined {
  return exampleRegistry.find((e) => e.id === id)
}
```

---

### Task 4: 创建 Pinia 示例 Store

**Files:**
- Create: `src/stores/examples.ts`

```typescript
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { exampleRegistry, getExamplesByCategory } from '@/examples/registry'
import type { CategoryId, ExampleMeta, DisposeFn } from '@/types/examples'
import { CATEGORIES } from '@/types/examples'

export const useExamplesStore = defineStore('examples', () => {
  // 当前选中的分类
  const activeCategory = ref<CategoryId>('basic')
  // 当前选中的示例
  const activeExample = ref<ExampleMeta | null>(null)
  // 当前示例的清理函数
  let currentDispose: DisposeFn | null = null
  // Cesium Viewer 引用
  let viewer: Cesium.Viewer | null = null
  // 示例代码内容
  const activeCode = ref('')
  // 侧边栏展开状态
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
    // 先清理上一个示例
    if (currentDispose) {
      currentDispose()
      currentDispose = null
    }
    activeExample.value = example

    if (!viewer) return

    try {
      const module = await import(`@/examples/${example.category}/${example.id}.ts`) as { init: (v: Cesium.Viewer) => DisposeFn }
      currentDispose = module.init(viewer)
    } catch (err) {
      console.error(`加载示例 ${example.id} 失败:`, err)
    }

    // 加载源代码文本
    try {
      const codeModule = await import(`@/examples/${example.category}/${example.id}.ts?raw`)
      activeCode.value = codeModule.default as string
    } catch {
      activeCode.value = '// 无法加载源代码'
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
```

---

### Task 5: 创建 CesiumPreview 组件

**Files:**
- Create: `src/components/map/CesiumPreview.vue`

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as Cesium from 'cesium'
import { useExamplesStore } from '@/stores/examples'

const containerRef = ref<HTMLDivElement>()
const store = useExamplesStore()
let viewer: Cesium.Viewer | null = null

onMounted(() => {
  if (!containerRef.value) return

  viewer = new Cesium.Viewer(containerRef.value, {
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: true,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
    selectionIndicator: false,
  })

  // 设置初始视角（中国上空）
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(104.0, 35.0, 8000000),
  })

  store.setViewer(viewer)
})

onUnmounted(() => {
  store.dispose()
  if (viewer) {
    viewer.destroy()
    viewer = null
  }
})
</script>

<template>
  <div ref="containerRef" class="cesium-preview"></div>
</template>

<style scoped>
.cesium-preview {
  width: 100%;
  height: 100%;
}
</style>
```

---

### Task 6: 重写 AppHeader 组件

**Files:**
- Modify: `src/components/layout/AppHeader.vue`

```vue
<script setup lang="ts">
import { useExamplesStore } from '@/stores/examples'
import { useRouter } from 'vue-router'
import type { CategoryId } from '@/types/examples'

const store = useExamplesStore()
const router = useRouter()

function goHome() {
  router.push('/')
}

function selectCategory(category: CategoryId) {
  store.setCategory(category)
  const firstExample = store.currentExamples[0]
  if (firstExample) {
    store.selectExample(firstExample)
    router.push(`/example/${category}/${firstExample.id}`)
  }
}

const reservedTabs = [
  { key: 'threejs', label: 'Three.js', disabled: true },
  { key: 'webgl', label: 'WebGL', disabled: true },
] as const
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button class="sidebar-toggle" @click="store.toggleSidebar" title="切换侧边栏">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <span class="logo" @click="goHome">Cesium Examples</span>
    </div>
    <nav class="header-nav">
      <button
        v-for="cat in store.categories"
        :key="cat.id"
        class="nav-tab"
        :class="{ active: store.activeCategory === cat.id }"
        @click="selectCategory(cat.id)"
      >
        <span class="nav-icon">{{ cat.icon }}</span>
        {{ cat.name }}
      </button>
      <span class="nav-divider">|</span>
      <button
        v-for="tab in reservedTabs"
        :key="tab.key"
        class="nav-tab disabled"
        :disabled="tab.disabled"
      >
        {{ tab.label }}
      </button>
    </nav>
    <div class="header-right">
      <span class="example-count">共 {{ store.totalCount }} 个示例</span>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 12px;
  background: #111d2e;
  border-bottom: 1px solid rgba(79, 195, 247, 0.12);
  flex-shrink: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid rgba(79, 195, 247, 0.2);
  border-radius: 4px;
  color: #6b8cae;
  cursor: pointer;
  transition: all 0.2s;
}
.sidebar-toggle:hover {
  color: #4fc3f7;
  border-color: #4fc3f7;
}

.logo {
  font-size: 16px;
  font-weight: 700;
  color: #4fc3f7;
  cursor: pointer;
  user-select: none;
  letter-spacing: 0.5px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 24px;
  flex: 1;
}

.nav-tab {
  padding: 6px 14px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #6b8cae;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0;
  white-space: nowrap;
}
.nav-tab:hover {
  color: #b0bec5;
  background: rgba(79, 195, 247, 0.06);
}
.nav-tab.active {
  color: #4fc3f7;
  border-bottom-color: #4fc3f7;
}
.nav-tab.disabled {
  color: #3a5068;
  cursor: not-allowed;
  opacity: 0.5;
}
.nav-tab.disabled:hover {
  background: transparent;
}

.nav-icon {
  margin-right: 4px;
  font-size: 14px;
}

.nav-divider {
  color: #253547;
  margin: 0 4px;
  user-select: none;
}

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.example-count {
  font-size: 12px;
  color: #4a6580;
}
</style>
```

---

### Task 7: 重写 AppSidebar 组件

**Files:**
- Modify: `src/components/layout/AppSidebar.vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExamplesStore } from '@/stores/examples'
import { useRouter } from 'vue-router'
import type { ExampleMeta } from '@/types/examples'

const store = useExamplesStore()
const router = useRouter()
const searchQuery = ref('')

const filteredExamples = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return store.currentExamples
  return store.currentExamples.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
  )
})

function selectExample(example: ExampleMeta) {
  store.selectExample(example)
  router.push(`/example/${example.category}/${example.id}`)
}
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: store.sidebarCollapsed }">
    <div class="sidebar-inner">
      <div class="sidebar-search" v-if="!store.sidebarCollapsed">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索示例..."
          class="search-input"
        />
      </div>
      <div v-if="!store.sidebarCollapsed" class="sidebar-title">
        {{ store.categories.find(c => c.id === store.activeCategory)?.name }}
      </div>
      <nav class="sidebar-list">
        <button
          v-for="example in filteredExamples"
          :key="example.id"
          class="example-item"
          :class="{ active: store.activeExample?.id === example.id }"
          :title="store.sidebarCollapsed ? example.title : undefined"
          @click="selectExample(example)"
        >
          <span class="example-title">{{ example.title }}</span>
          <span v-if="!store.sidebarCollapsed" class="example-desc">{{ example.description }}</span>
        </button>
      </nav>
      <div v-if="!store.sidebarCollapsed && filteredExamples.length === 0" class="empty-hint">
        无匹配示例
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #0d1a2d;
  border-right: 1px solid rgba(79, 195, 247, 0.1);
  transition: width 0.25s ease;
  overflow: hidden;
}
.app-sidebar.collapsed {
  width: 48px;
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-search {
  padding: 10px;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  background: #0a1628;
  border: 1px solid rgba(79, 195, 247, 0.15);
  border-radius: 4px;
  color: #b0bec5;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}
.search-input::placeholder {
  color: #3a5068;
}
.search-input:focus {
  border-color: #4fc3f7;
}

.sidebar-title {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #4fc3f7;
  text-transform: uppercase;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.example-item {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-left: 3px solid transparent;
  color: #6b8cae;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  gap: 2px;
}
.example-item:hover {
  background: rgba(79, 195, 247, 0.06);
  color: #b0bec5;
}
.example-item.active {
  background: rgba(79, 195, 247, 0.08);
  color: #4fc3f7;
  border-left-color: #4fc3f7;
}

.example-title {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.example-desc {
  font-size: 11px;
  color: #3a5068;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.example-item.active .example-desc {
  color: #4a6580;
}

.empty-hint {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #3a5068;
}
</style>
```

---

### Task 8: 创建 CodePanel 组件

**Files:**
- Create: `src/components/layout/CodePanel.vue`

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useExamplesStore } from '@/stores/examples'

const store = useExamplesStore()
const collapsed = ref(false)
const copied = ref(false)

const displayCode = computed(() => store.activeCode || '// 请从左侧选择一个示例')

async function copyCode() {
  if (!store.activeCode) return
  try {
    await navigator.clipboard.writeText(store.activeCode)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // fallback
  }
}
</script>

<template>
  <div class="code-panel" :class="{ collapsed }">
    <div class="code-header" @click="collapsed = !collapsed">
      <div class="code-header-left">
        <span class="code-title">
          {{ store.activeExample ? store.activeExample.title : '源代码' }}
        </span>
        <span class="code-lang">TypeScript</span>
      </div>
      <div class="code-header-right">
        <button class="code-btn" v-if="store.activeCode" @click.stop="copyCode">
          {{ copied ? '已复制' : '复制' }}
        </button>
        <button class="code-btn toggle-btn" title="折叠/展开">
          {{ collapsed ? '展开' : '折叠' }}
        </button>
      </div>
    </div>
    <pre class="code-body" v-show="!collapsed"><code>{{ displayCode }}</code></pre>
  </div>
</template>

<style scoped>
.code-panel {
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(79, 195, 247, 0.15);
  background: #0a1628;
  height: 200px;
  min-height: 36px;
  transition: height 0.2s ease;
  flex-shrink: 0;
}
.code-panel.collapsed {
  height: 36px;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 12px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  background: #0d1a2d;
}
.code-header:hover {
  background: rgba(79, 195, 247, 0.04);
}

.code-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.code-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b8cae;
}

.code-lang {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(79, 195, 247, 0.1);
  color: #4fc3f7;
  border-radius: 3px;
}

.code-header-right {
  display: flex;
  gap: 4px;
}

.code-btn {
  padding: 2px 8px;
  font-size: 11px;
  background: rgba(79, 195, 247, 0.08);
  border: 1px solid rgba(79, 195, 247, 0.15);
  border-radius: 3px;
  color: #6b8cae;
  cursor: pointer;
  transition: all 0.15s;
}
.code-btn:hover {
  background: rgba(79, 195, 247, 0.15);
  color: #4fc3f7;
}

.code-body {
  flex: 1;
  overflow: auto;
  margin: 0;
  padding: 12px 16px;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #b0bec5;
  background: #0a1628;
  tab-size: 2;
  white-space: pre;
  -ms-overflow-style: none;
  scrollbar-width: thin;
}
</style>
```

---

### Task 9: 创建 ExampleView 主视图

**Files:**
- Create: `src/views/ExampleView.vue`

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useExamplesStore } from '@/stores/examples'
import { getExampleById } from '@/examples/registry'

const route = useRoute()
const store = useExamplesStore()

onMounted(() => {
  const category = route.params.category as string
  const exampleId = route.params.exampleId as string
  const example = getExampleById(exampleId)
  if (example) {
    store.setCategory(category as any)
    store.selectExample(example)
  }
})
</script>

<template>
  <div class="example-view">
    <!-- 仅作为路由占位，实际内容由 App.vue 中持久化组件渲染 -->
    <div v-if="!store.activeExample" class="example-empty">
      <p>请从左侧列表选择一个示例</p>
    </div>
  </div>
</template>

<style scoped>
.example-view {
  display: none; /* 实际布局由 App.vue 控制 */
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
```

---

### Task 10: 创建 HomeView 首页

**Files:**
- Create: `src/views/HomeView.vue`

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useExamplesStore } from '@/stores/examples'
import type { CategoryId } from '@/types/examples'

const router = useRouter()
const store = useExamplesStore()

function openCategory(category: CategoryId) {
  store.setCategory(category)
  const firstExample = store.currentExamples[0]
  if (firstExample) {
    store.selectExample(firstExample)
    router.push(`/example/${category}/${firstExample.id}`)
  }
}
</script>

<template>
  <div class="home-view">
    <div class="home-hero">
      <h1 class="home-title">Cesium Examples</h1>
      <p class="home-subtitle">Cesium.js API 功能示例集合，涵盖基础入门、实体几何体、数据可视化、特效渲染与地形分析</p>
    </div>
    <div class="home-grid">
      <button
        v-for="cat in store.categories"
        :key="cat.id"
        class="home-card"
        @click="openCategory(cat.id)"
      >
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
  max-width: 480px;
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
```

---

### Task 11: 重写路由

**Files:**
- Modify: `src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/example/:category/:exampleId',
      name: 'example',
      component: () => import('@/views/ExampleView.vue'),
    },
  ],
})

export default router
```

---

### Task 12: 更新 App.vue

**Files:**
- Modify: `src/App.vue`

```vue
<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import CodePanel from '@/components/layout/CodePanel.vue'
import CesiumPreview from '@/components/map/CesiumPreview.vue'
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <div class="app-body">
      <AppSidebar />
      <main class="app-main">
        <CesiumPreview />
      </main>
    </div>
    <CodePanel />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #0a1628;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.app-main {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #0a1628;
}
</style>
```

---

### Task 13: 更新全局样式

**Files:**
- Modify: `src/assets/main.css`

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei',
    'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #b0bec5;
  background: #0a1628;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
  width: 100%;
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(79, 195, 247, 0.15);
  border-radius: 2px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 195, 247, 0.3);
}

a {
  color: #4fc3f7;
  text-decoration: none;
}

button {
  font-family: inherit;
}

/* Cesium 信用信息隐藏 */
.cesium-viewer-bottom {
  display: none !important;
}
```

---

### Task 14: 编写示例模块 — 基础入门 (5个)

**Files:**
- Create: `src/examples/basic/load-basemap.ts`
- Create: `src/examples/basic/camera-flyto.ts`
- Create: `src/examples/basic/coordinate-pick.ts`
- Create: `src/examples/basic/mouse-events.ts`
- Create: `src/examples/basic/cesium-inspector.ts`

**`src/examples/basic/load-basemap.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const layers = [
    { name: 'Bing Aerial', provider: Cesium.IonWorldImageryStyle.AERIAL },
    { name: 'Bing Road', provider: Cesium.IonWorldImageryStyle.ROAD },
    { name: 'OpenStreetMap', provider: undefined as unknown as Cesium.IonWorldImageryStyle },
  ]

  // 默认使用 Bing Aerial
  const baseLayer = Cesium.ImageryLayer.fromProviderAsync(
    Cesium.IonImageryLayerStyle.AERIAL
  )

  let currentIndex = 0

  // 添加切换按钮的提示 entity（不可见但可交互）
  viewer.entities.add({
    id: 'basemap-hint',
    position: Cesium.Cartesian3.fromDegrees(120, 35, 5000000),
    label: {
      text: '点击左下角切换底图',
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE.withAlpha(0.7),
      style: Cesium.LabelStyle.FILL,
      outlineColor: Cesium.Color.BLACK,
    },
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/basic/camera-flyto.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

const DESTINATIONS = [
  { name: '北京', lng: 116.4, lat: 39.9, height: 5000 },
  { name: '上海', lng: 121.47, lat: 31.23, height: 5000 },
  { name: '广州', lng: 113.26, lat: 23.13, height: 5000 },
  { name: '成都', lng: 104.07, lat: 30.57, height: 5000 },
]

export function init(viewer: Cesium.Viewer): DisposeFn {
  let currentIndex = 0

  function flyToNext() {
    const dest = DESTINATIONS[currentIndex % DESTINATIONS.length]
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(dest.lng, dest.lat, dest.height),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0,
      },
      duration: 2.5,
      complete: () => {
        setTimeout(flyToNext, 1500)
      },
    })
    currentIndex++
  }

  flyToNext()

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/basic/coordinate-pick.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  const labelEntity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(120, 35),
    label: {
      text: '点击地图任意位置查看坐标',
      font: '14px sans-serif',
      fillColor: Cesium.Color.AQUA,
      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
      backgroundPadding: new Cesium.Cartesian2(8, 4),
    },
  })

  handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const cartesian = viewer.scene.pickPosition(movement.position)
    if (!cartesian) return

    const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    const lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6)
    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6)
    const height = cartographic.height.toFixed(2)

    viewer.entities.add({
      position: cartesian,
      point: {
        pixelSize: 8,
        color: Cesium.Color.DEEPSKYBLUE,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
      },
      label: {
        text: `Lng:${lng} Lat:${lat} H:${height}m`,
        font: '12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString('#0a1628CC'),
        backgroundPadding: new Cesium.Cartesian2(6, 3),
        pixelOffset: new Cesium.Cartesian2(12, -8),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  return () => {
    handler.destroy()
    viewer.entities.removeAll()
  }
}
```

**`src/examples/basic/mouse-events.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  const infoLabel = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0),
    label: {
      text: '操作: 点击 / 移动 / 右键',
      font: '14px sans-serif',
      fillColor: Cesium.Color.AQUA,
      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
      backgroundPadding: new Cesium.Cartesian2(8, 4),
    },
  })

  function showEvent(text: string, color: Cesium.Color) {
    viewer.entities.add({
      label: {
        text,
        font: '16px sans-serif',
        fillColor: color,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
        backgroundPadding: new Cesium.Cartesian2(10, 5),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        pixelOffset: new Cesium.Cartesian2(0, -60),
      },
    })
  }

  handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const cartesian = viewer.scene.pickPosition(click.position)
    if (cartesian) {
      viewer.entities.add({
        position: cartesian,
        point: { pixelSize: 6, color: Cesium.Color.LIME },
      })
      showEvent('鼠标左键点击', Cesium.Color.LIME)
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    showEvent('鼠标右键点击', Cesium.Color.ORANGE)
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

  let prevPosition: Cesium.Cartesian2 | null = null
  handler.setInputAction((move: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
    if (prevPosition && Cesium.Cartesian2.distance(prevPosition, move.endPosition) < 3) return
    prevPosition = move.endPosition.clone()

    const cartesian = viewer.scene.pickPosition(move.endPosition)
    if (cartesian) {
      const c = Cesium.Cartographic.fromCartesian(cartesian)
      infoLabel.label!.text =
        `鼠标: ${Cesium.Math.toDegrees(c.longitude).toFixed(4)}°E  ` +
        `${Cesium.Math.toDegrees(c.latitude).toFixed(4)}°N  ` +
        `${c.height.toFixed(1)}m`
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  return () => {
    handler.destroy()
    viewer.entities.removeAll()
  }
}
```

**`src/examples/basic/cesium-inspector.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute; top: 10px; left: 10px; z-index: 10;
    background: rgba(0,0,0,0.8); color: #4fc3f7; padding: 12px 16px;
    border-radius: 6px; font-size: 13px; border: 1px solid rgba(79,195,247,0.3);
  `
  overlay.textContent = 'Cesium Inspector: 查看 Draw calls / Primitives / 渲染统计'

  const btn = document.createElement('button')
  btn.textContent = '开启 Inspector'
  btn.style.cssText = `
    margin-top: 8px; padding: 6px 14px; background: rgba(79,195,247,0.15);
    border: 1px solid rgba(79,195,247,0.3); border-radius: 4px; color: #4fc3f7;
    cursor: pointer; display: block; font-size: 12px;
  `

  let inspectorMixin: Cesium.CesiumInspectorMixin | null = null
  btn.addEventListener('click', () => {
    if (inspectorMixin) {
      inspectorMixin.dropDown.destroy()
      inspectorMixin = null
      btn.textContent = '开启 Inspector'
    } else {
      inspectorMixin = viewer.extend(Cesium.viewerCesiumInspectorMixin, {})
      btn.textContent = '关闭 Inspector'
    }
  })

  overlay.appendChild(btn)
  viewer.container.appendChild(overlay)

  return () => {
    if (inspectorMixin?.dropDown) {
      inspectorMixin.dropDown.destroy()
    }
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
    viewer.entities.removeAll()
  }
}
```

---

### Task 15: 编写示例模块 — 实体与几何体 (6个)

**Files:**
- Create: `src/examples/entity/billboard.ts`
- Create: `src/examples/entity/polyline.ts`
- Create: `src/examples/entity/polygon.ts`
- Create: `src/examples/entity/model-3d.ts`
- Create: `src/examples/entity/label.ts`
- Create: `src/examples/entity/ellipsoid.ts`

**`src/examples/entity/billboard.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

const POSITIONS = [
  { lng: 116.38, lat: 39.9, name: '点 A' },
  { lng: 116.42, lat: 39.92, name: '点 B' },
  { lng: 116.4, lat: 39.88, name: '点 C' },
  { lng: 116.44, lat: 39.9, name: '点 D' },
]

export function init(viewer: Cesium.Viewer): DisposeFn {
  // 使用 Canvas 动态生成图标
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#4fc3f7'
  ctx.beginPath()
  ctx.arc(16, 16, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', 16, 16)

  POSITIONS.forEach((p) => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(p.lng, p.lat),
      billboard: {
        image: canvas,
        scale: 1.5,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
      label: {
        text: p.name,
        font: '12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 30000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/entity/polyline.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  // 北京到各城市连线
  const beijing = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
  const cities = [
    { lng: 121.47, lat: 31.23, name: '上海' },
    { lng: 113.26, lat: 23.13, name: '广州' },
    { lng: 104.07, lat: 30.57, name: '成都' },
    { lng: 108.95, lat: 34.27, name: '西安' },
  ]

  const colors = [Cesium.Color.DEEPSKYBLUE, Cesium.Color.LIME, Cesium.Color.ORANGE, Cesium.Color.MAGENTA]

  cities.forEach((city, i) => {
    viewer.entities.add({
      polyline: {
        positions: [beijing, Cesium.Cartesian3.fromDegrees(city.lng, city.lat, 0)],
        width: 3,
        material: colors[i],
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(113, 36, 8000000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/entity/polygon.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  // 绘制多个多边形区域
  const areas = [
    {
      coords: [
        [116.38, 39.9], [116.44, 39.92], [116.48, 39.9],
        [116.44, 39.87], [116.38, 39.88],
      ],
      color: Cesium.Color.DEEPSKYBLUE.withAlpha(0.4),
      name: '区域 A',
    },
    {
      coords: [
        [116.35, 39.85], [116.38, 39.88], [116.42, 39.86],
        [116.38, 39.83],
      ],
      color: Cesium.Color.LIME.withAlpha(0.4),
      name: '区域 B',
    },
  ]

  areas.forEach((area) => {
    viewer.entities.add({
      name: area.name,
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(
          area.coords.map(([lng, lat]) => Cesium.Cartesian3.fromDegrees(lng, lat))
        ),
        material: area.color,
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.6),
        outlineWidth: 2,
        perPositionHeight: false,
        extrudedHeight: 0,
      },
      label: {
        text: area.name,
        font: '14px sans-serif',
        fillColor: Cesium.Color.WHITE,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.88, 20000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/entity/model-3d.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  // 使用 Cesium Air 模型作为示例
  const position = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 100)
  const heading = Cesium.Math.toRadians(45)

  viewer.entities.add({
    name: 'Cesium Air',
    position,
    orientation: Cesium.Transforms.headingPitchRollQuaternion(
      position,
      new Cesium.HeadingPitchRoll(heading, 0, 0)
    ),
    model: {
      uri: 'https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/CesiumAir/CesiumAir.glb',
      minimumPixelSize: 64,
      maximumScale: 200,
    },
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 800),
    orientation: { heading: Cesium.Math.toRadians(90), pitch: Cesium.Math.toRadians(-30), roll: 0 },
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/entity/label.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const styles = [
    { font: '24px sans-serif', fillColor: Cesium.Color.GOLD, outlineColor: Cesium.Color.BLACK },
    { font: '18px "Microsoft YaHei", sans-serif', fillColor: Cesium.Color.DEEPSKYBLUE },
    { font: '14px monospace', fillColor: Cesium.Color.LIME },
    { font: 'bold 20px serif', fillColor: Cesium.Color.DEEPPINK },
  ]

  styles.forEach((style, i) => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(116.4 + i * 0.02, 39.9, 0),
      label: {
        text: `Label ${i + 1}`,
        font: style.font,
        fillColor: style.fillColor,
        outlineColor: style.outlineColor as Cesium.Color | undefined,
        outlineWidth: 1,
        scale: 1.0,
        showBackground: i % 2 === 0,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.43, 39.9, 10000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/entity/ellipsoid.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const materials = [
    Cesium.Color.DEEPSKYBLUE.withAlpha(0.7),
    Cesium.Color.ORANGE.withAlpha(0.7),
    Cesium.Color.LIME.withAlpha(0.7),
    Cesium.Color.MAGENTA.withAlpha(0.7),
  ]

  // 椭球体
  for (let i = 0; i < 4; i++) {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(116.38 + i * 0.03, 39.9, 0),
      ellipsoid: {
        radii: new Cesium.Cartesian3(400 + i * 100, 400 + i * 100, 600 + i * 150),
        material: materials[i],
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
      },
    })
  }

  // 圆柱体
  for (let i = 0; i < 3; i++) {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(116.4 + i * 0.04, 39.88, 0),
      cylinder: {
        length: 400 + i * 200,
        topRadius: 150 + i * 50,
        bottomRadius: 150 + i * 50,
        material: Cesium.Color.fromHsl(0.55 + i * 0.1, 0.8, 0.5, 0.7),
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.5),
      },
    })
  }

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.43, 39.9, 5000),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-35), roll: 0 },
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

---

### Task 16: 编写示例模块 — 数据可视化 (4个)

**Files:**
- Create: `src/examples/visualization/primitive-geometry.ts`
- Create: `src/examples/visualization/dynamic-texture.ts`
- Create: `src/examples/visualization/migration-lines.ts`
- Create: `src/examples/visualization/cylinder-chart.ts`

**`src/examples/visualization/primitive-geometry.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const instances: Cesium.GeometryInstance[] = []
  const colors: Cesium.Color[] = []

  // 生成矩形网格
  for (let lat = 39.86; lat <= 39.94; lat += 0.02) {
    for (let lng = 116.36; lng <= 116.48; lng += 0.02) {
      instances.push(
        new Cesium.GeometryInstance({
          geometry: new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromDegrees(lng, lat, lng + 0.015, lat + 0.015),
            height: Math.random() * 200 + 50,
          }),
          id: `${lat}-${lng}`,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromHsl(Math.random(), 0.7, 0.6, 0.8)
            ),
          },
        })
      )
    }
  }

  const primitive = new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      translucent: true,
    }),
    asynchronous: false,
  })

  viewer.scene.primitives.add(primitive)

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.42, 39.9, 6000),
    orientation: { heading: Cesium.Math.toRadians(30), pitch: Cesium.Math.toRadians(-40), roll: 0 },
  })

  return () => {
    viewer.scene.primitives.remove(primitive)
  }
}
```

**`src/examples/visualization/dynamic-texture.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  let frame = 0
  let animId: number

  function draw() {
    frame++
    ctx.clearRect(0, 0, 256, 256)
    const hue = (frame * 0.5) % 360
    ctx.fillStyle = `hsl(${hue}, 80%, 50%)`
    ctx.fillRect(0, 0, 256, 256)

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 36px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Frame: ${frame}`, 128, 128)

    animId = requestAnimationFrame(draw)
  }
  draw()

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.4, 39.9),
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(116.36, 39.88, 116.44, 39.92),
      material: canvas,
    },
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 20000),
  })

  return () => {
    cancelAnimationFrame(animId)
    viewer.entities.removeAll()
  }
}
```

**`src/examples/visualization/migration-lines.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const center = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
  const targets = [
    { lng: 121.47, lat: 31.23 },
    { lng: 113.26, lat: 23.13 },
    { lng: 104.07, lat: 30.57 },
    { lng: 108.95, lat: 34.27 },
    { lng: 114.5, lat: 38.0 },
    { lng: 120.15, lat: 30.28 },
  ]

  const colors = [
    Cesium.Color.DEEPSKYBLUE,
    Cesium.Color.LIME,
    Cesium.Color.ORANGE,
    Cesium.Color.MAGENTA,
    Cesium.Color.GOLD,
    Cesium.Color.HOTPINK,
  ]

  interfaces.push(
    ...targets.map((t, i) => {
      const entity = viewer.entities.add({
        polyline: {
          positions: [center, Cesium.Cartesian3.fromDegrees(t.lng, t.lat, 0)],
          width: 1.5,
          material: colors[i],
          arcType: Cesium.ArcType.GEODESIC,
        },
      })
      return entity
    })
  )

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(113, 36, 8000000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

等等，上面有 typo，`interfaces` 应该是 `entities`。让我修正：

**`src/examples/visualization/migration-lines.ts` (corrected):**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const center = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
  const targets = [
    { lng: 121.47, lat: 31.23 },
    { lng: 113.26, lat: 23.13 },
    { lng: 104.07, lat: 30.57 },
    { lng: 108.95, lat: 34.27 },
    { lng: 114.5, lat: 38.0 },
    { lng: 120.15, lat: 30.28 },
  ]

  const colors = [
    Cesium.Color.DEEPSKYBLUE,
    Cesium.Color.LIME,
    Cesium.Color.ORANGE,
    Cesium.Color.MAGENTA,
    Cesium.Color.GOLD,
    Cesium.Color.HOTPINK,
  ]

  targets.forEach((t, i) => {
    viewer.entities.add({
      polyline: {
        positions: [center, Cesium.Cartesian3.fromDegrees(t.lng, t.lat, 0)],
        width: 1.5,
        material: colors[i],
        arcType: Cesium.ArcType.GEODESIC,
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(113, 36, 8000000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/visualization/cylinder-chart.ts`:**
```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const data = [
    { lng: 116.38, lat: 39.91, value: 85 },
    { lng: 116.40, lat: 39.91, value: 62 },
    { lng: 116.42, lat: 39.91, value: 94 },
    { lng: 116.44, lat: 39.91, value: 47 },
    { lng: 116.38, lat: 39.89, value: 73 },
    { lng: 116.40, lat: 39.89, value: 58 },
    { lng: 116.42, lat: 39.89, value: 88 },
    { lng: 116.44, lat: 39.89, value: 35 },
  ]

  const maxValue = Math.max(...data.map((d) => d.value))

  data.forEach((d) => {
    const height = (d.value / maxValue) * 800
    const hue = (1 - d.value / maxValue) * 240 // blue(240) -> red(0)
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(d.lng, d.lat, 0),
      cylinder: {
        length: height,
        topRadius: 80,
        bottomRadius: 80,
        material: Cesium.Color.fromHsl(hue / 360, 0.8, 0.5, 0.85),
        outline: true,
        outlineColor: Cesium.Color.WHITE.withAlpha(0.3),
      },
      label: {
        text: `${d.value}`,
        font: '12px sans-serif',
        fillColor: Cesium.Color.WHITE,
        pixelOffset: new Cesium.Cartesian2(0, -height / 2 - 10),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.41, 39.9, 4000),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

---

### Task 17: 编写示例模块 — 特效与渲染 (4个)

**Files:**
- Create: `src/examples/effects/particle-system.ts`
- Create: `src/examples/effects/post-process.ts`
- Create: `src/examples/effects/custom-shader.ts`
- Create: `src/examples/effects/water.ts`

**`src/examples/effects/particle-system.ts`:**

```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const scene = viewer.scene

  const particleSystem = new Cesium.ParticleSystem({
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVQYlWNg+M9AAiYmBn5GRgY0AAB/AAv+2m/rAAAAAElFTkSuQmCC',
    // Use a simple circle texture URL
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
      Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
    ),
  })

  scene.primitives.add(particleSystem)

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 600),
  })

  return () => {
    scene.primitives.remove(particleSystem)
  }
}
```

**`src/examples/effects/post-process.ts`:**

```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const scene = viewer.scene
  const stages: Cesium.PostProcessStage[] = []

  // Bloom (泛光)
  const bloom = scene.postProcessStages.add(
    new Cesium.PostProcessStage({
      fragmentShader: `
        uniform sampler2D colorTexture;
        varying vec2 v_textureCoordinates;
        void main() {
          vec4 color = texture2D(colorTexture, v_textureCoordinates);
          float lum = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          if (lum > 0.6) {
            gl_FragColor = color * 1.3;
          } else {
            gl_FragColor = color;
          }
        }
      `,
    })
  )

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 5000),
  })

  // 添加提示 overlay
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute; top: 10px; right: 10px; z-index: 10;
    background: rgba(0,0,0,0.8); color: #4fc3f7; padding: 8px 14px;
    border-radius: 4px; font-size: 12px; border: 1px solid rgba(79,195,247,0.3);
    pointer-events: none;
  `
  overlay.textContent = '泛光效果 (Bloom)'
  viewer.container.appendChild(overlay)

  return () => {
    scene.postProcessStages.remove(bloom)
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
```

**`src/examples/effects/custom-shader.ts`:**

```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  // CustomShader 需要 Cesium 1.96+，用于修改 3D Tiles 等模型外观
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.85); color: #4fc3f7; padding: 16px 24px;
    border-radius: 8px; font-size: 14px; border: 1px solid rgba(79,195,247,0.3);
    max-width: 400px; line-height: 1.6; text-align: center; z-index: 10;
  `
  overlay.innerHTML = `
    <strong>CustomShader 示例</strong><br><br>
    使用 Cesium.CustomShader 修改 glTF 材质：<br>
    <code style="color:#ffa726;font-size:12px">
      const shader = new Cesium.CustomShader({<br>
      &nbsp;&nbsp;mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,<br>
      &nbsp;&nbsp;fragmentShaderText: '...'<br>
      })
    </code><br>
    <span style="font-size:12px;color:#6b8cae">
      需配合 3D Tiles / Model 使用，此处展示 API 用法
    </span>
  `
  viewer.container.appendChild(overlay)

  return () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
```

**`src/examples/effects/water.ts`:**

```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  // Water.glsl 水面效果：使用 Primitive + 自定义顶点/片元着色器
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.85); color: #4fc3f7; padding: 16px 24px;
    border-radius: 8px; font-size: 14px; border: 1px solid rgba(79,195,247,0.3);
    max-width: 400px; line-height: 1.6; text-align: center; z-index: 10;
  `
  overlay.innerHTML = `
    <strong>Water.glsl 水面效果</strong><br><br>
    使用 Cesium 内置 Water 着色器：<br>
    <code style="color:#ffa726;font-size:12px">
      new Cesium.Primitive({<br>
      &nbsp;&nbsp;geometryInstances: rectInstance,<br>
      &nbsp;&nbsp;appearance: new Cesium.MaterialAppearance({<br>
      &nbsp;&nbsp;&nbsp;&nbsp;material: new Cesium.Material({<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;fabric: Cesium.Material.WaterType<br>
      &nbsp;&nbsp;&nbsp;&nbsp;})<br>
      &nbsp;&nbsp;})<br>
      })
    </code>
  `
  viewer.container.appendChild(overlay)

  return () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
```

---

### Task 18: 编写示例模块 — 地形与分析 (4个)

**Files:**
- Create: `src/examples/terrain/terrain-load.ts`
- Create: `src/examples/terrain/viewshed.ts`
- Create: `src/examples/terrain/clipping-plane.ts`
- Create: `src/examples/terrain/measurement.ts`

**`src/examples/terrain/terrain-load.ts`:**

```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.85); color: #4fc3f7; padding: 16px 24px;
    border-radius: 8px; font-size: 14px; border: 1px solid rgba(79,195,247,0.3);
    max-width: 420px; line-height: 1.6; text-align: center; z-index: 10;
  `
  overlay.innerHTML = `
    <strong>地形加载示例</strong><br><br>
    <code style="color:#ffa726;font-size:12px">
      viewer.terrainProvider = await Cesium.CesiumTerrainProvider<br>
      &nbsp;&nbsp;.fromIonAssetId(1);<br>
      // 或使用自定义 URL<br>
      new Cesium.CesiumTerrainProvider({<br>
      &nbsp;&nbsp;url: 'https://.../tileset.json'<br>
      })
    </code><br>
    <span style="font-size:12px;color:#6b8cae">
      加载全球地形 DEM 数据，启用光照/水面反射
    </span>
    <br><br>
    <button id="btn-toggle-terrain" style="
      padding:6px 14px; background:rgba(79,195,247,0.15);
      border:1px solid rgba(79,195,247,0.3); border-radius:4px;
      color:#4fc3f7; cursor:pointer; font-size:12px;
    ">点击加载 Cesium World Terrain</button>
  `
  viewer.container.appendChild(overlay)

  const btn = overlay.querySelector('#btn-toggle-terrain')!
  btn.addEventListener('click', async () => {
    try {
      viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
        requestVertexNormals: true,
      })
      viewer.scene.globe.enableLighting = true
      ;(btn as HTMLButtonElement).textContent = '地形已加载'
    } catch {
      ;(btn as HTMLButtonElement).textContent = '加载失败 (需 Token)'
    }
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(86.92, 27.98, 7000), // 珠峰附近
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 },
  })

  return () => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
```

**`src/examples/terrain/viewshed.ts`:**

```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  // 可视域分析：演示概念 + API
  const center = Cesium.Cartesian3.fromDegrees(116.4, 39.9, 0)
  const points: Cesium.Cartesian3[] = []
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2
    const r = 0.01
    const lng = 116.4 + r * Math.cos(angle)
    const lat = 39.9 + r * Math.sin(angle)
    points.push(Cesium.Cartesian3.fromDegrees(lng, lat, 0))
  }

  points.forEach((p) => {
    viewer.entities.add({
      polyline: {
        positions: [center, p],
        width: 1,
        material: Cesium.Color.GREEN.withAlpha(0.4),
      },
    })
  })

  viewer.entities.add({
    position: center,
    point: { pixelSize: 12, color: Cesium.Color.GOLD, outlineColor: Cesium.Color.BLACK, outlineWidth: 1 },
    label: { text: '观察点', font: '14px sans-serif', fillColor: Cesium.Color.WHITE, pixelOffset: new Cesium.Cartesian2(0, -20), disableDepthTestDistance: Number.POSITIVE_INFINITY },
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 5000),
  })

  return () => {
    viewer.entities.removeAll()
  }
}
```

**`src/examples/terrain/clipping-plane.ts`:**

```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.85); color: #4fc3f7; padding: 16px 24px;
    border-radius: 8px; font-size: 14px; border: 1px solid rgba(79,195,247,0.3);
    max-width: 420px; line-height: 1.6; text-align: center; z-index: 10;
  `
  overlay.innerHTML = `
    <strong>ClippingPlane 地形开挖</strong><br><br>
    <code style="color:#ffa726;font-size:12px">
      const clippingPlanes = new Cesium.ClippingPlaneCollection({<br>
      &nbsp;&nbsp;planes: [new Cesium.ClippingPlane(...)],<br>
      &nbsp;&nbsp;edgeWidth: 1.0<br>
      })<br>
      tileset.clippingPlanes = clippingPlanes;
    </code><br>
    <span style="font-size:12px;color:#6b8cae">
      对 3D Tiles / Globe 应用裁剪平面实现剖面开挖
    </span>
  `
  viewer.container.appendChild(overlay)

  // 加载一个简单的 3D Tileset 演示（如果可能）
  Cesium.Cesium3DTileset.fromUrl(
    Cesium.IonResource.fromAssetId(75343) as Cesium.Resource
  ).then((tileset) => {
    viewer.scene.primitives.add(tileset)
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-74.0189, 40.6911, 800),
    })
  }).catch(() => {
    overlay.querySelector('span')!.textContent += '\n(3D Tiles 加载需要 Ion Token)'
  })

  return () => {
    viewer.scene.primitives.removeAll()
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
  }
}
```

**`src/examples/terrain/measurement.ts`:**

```typescript
import * as Cesium from 'cesium'
import type { DisposeFn } from '@/types/examples'

export function init(viewer: Cesium.Viewer): DisposeFn {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  const points: Cesium.Cartesian3[] = []

  function updateMeasurement() {
    // 移除旧的测距线
    viewer.entities.values.filter(e => e.id?.toString().startsWith('meas-')).forEach(e => viewer.entities.remove(e))

    for (let i = 0; i < points.length - 1; i++) {
      const dist = Cesium.Cartesian3.distance(points[i], points[i + 1])
      const mid = Cesium.Cartesian3.lerp(points[i], points[i + 1], 0.5, new Cesium.Cartesian3())
      viewer.entities.add({
        id: `meas-line-${i}`,
        polyline: { positions: [points[i], points[i + 1]], width: 3, material: Cesium.Color.CYAN },
      })
      viewer.entities.add({
        id: `meas-label-${i}`,
        position: mid,
        label: {
          text: `${(dist / 1000).toFixed(3)} km`,
          font: '12px sans-serif',
          fillColor: Cesium.Color.YELLOW,
          showBackground: true,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
          backgroundPadding: new Cesium.Cartesian2(4, 2),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      })
    }

    // 总距离
    if (points.length >= 2) {
      let total = 0
      for (let i = 0; i < points.length - 1; i++) total += Cesium.Cartesian3.distance(points[i], points[i + 1])
      viewer.entities.add({
        id: 'meas-total',
        position: points[0],
        label: {
          text: `总距离: ${(total / 1000).toFixed(3)} km (点击继续, 右键结束)`,
          font: '14px sans-serif',
          fillColor: Cesium.Color.LIME,
          showBackground: true,
          backgroundColor: Cesium.Color.BLACK.withAlpha(0.7),
          backgroundPadding: new Cesium.Cartesian2(6, 3),
          pixelOffset: new Cesium.Cartesian2(0, -24),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      })
    }
  }

  handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    const cartesian = viewer.scene.pickPosition(click.position)
    if (!cartesian) return

    points.push(cartesian)
    viewer.entities.add({
      id: `meas-pt-${points.length}`,
      position: cartesian,
      point: { pixelSize: 8, color: Cesium.Color.CYAN, outlineColor: Cesium.Color.WHITE, outlineWidth: 1 },
    })
    updateMeasurement()
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

  handler.setInputAction(() => {
    handler.destroy()
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(116.4, 39.9),
    label: {
      text: '左键添加测点, 右键结束',
      font: '14px sans-serif',
      fillColor: Cesium.Color.YELLOW,
      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
      backgroundPadding: new Cesium.Cartesian2(8, 4),
    },
  })

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 15000),
  })

  return () => {
    handler.destroy()
    viewer.entities.removeAll()
  }
}
```

---

### Task 19: 最终验证

运行完整验证确保项目可构建且无类型错误。

```bash
npx eslint --fix
npx vue-tsc --build
npx vite build
```

期望：ESLint 零错误，vue-tsc 零类型错误，vite build 成功（所有示例模块正确拆分）。

---

### Task 20: 删除旧的 CesiumViewer.vue（已替换为 CesiumPreview.vue）

```bash
Remove-Item src/components/map/CesiumViewer.vue
```