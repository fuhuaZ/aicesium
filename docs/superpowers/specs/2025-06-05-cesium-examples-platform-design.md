# Cesium 示例平台 — 设计方案

## 目标

将项目从"数字孪生园区管理平台"重构为"Cesium API 功能示例平台"，类似 ECharts 官网示例页。后续可拓展 three.js、WebGL 示例。

## 整体布局 (ECharts 风格)

```
┌──────────────────────────────────────────────────────┐
│  Header: Logo + 分类Tab导航 + three.js/WebGL预留入口   │
├──────────────┬───────────────────────────────────────┤
│              │  Cesium 实时预览区域                    │
│  示例列表     │  (Viewer 持久化，切换示例动态加载场景)   │
│  (按分类)     │                                       │
│  支持搜索筛选  ├───────────────────────────────────────┤
│              │  代码展示区 (语法高亮 + 复制按钮，只读)   │
└──────────────┴───────────────────────────────────────┘
```

## 模块拆分

| 模块 | 职责 |
|------|------|
| AppHeader | Logo、分类 Tab 切换、预留 three.js/WebGL 入口 |
| AppSidebar | 当前分类下的示例列表，搜索筛选，选中高亮 |
| CesiumPreview | Cesium Viewer 持久化容器，根据选中示例动态加载/卸载场景 |
| CodePanel | 底部可折叠代码面板，highlight.js 高亮，一键复制 |
| 示例注册表 | 管理所有示例的元数据（名称、分类、描述、模块路径） |
| 示例模块 | 独立 `.ts` 文件，导出 `init(viewer)` 和 `dispose()` |

## 分类与首批示例

### 1. 基础入门
- 加载底图 (Bing/OSM/ArcGIS)
- 相机飞行 (flyTo)
- 坐标拾取 (screenSpaceEventHandler)
- 鼠标事件 (LEFT_CLICK/MOUSE_MOVE)
- 调试面板 (CesiumInspector)

### 2. 实体与几何体
- 点标记 (Billboard)
- 线段 (Polyline)
- 多边形/面 (Polygon)
- 3D 模型 (Model.fromGltf)
- 文字标签 (Label)
- 椭球体/圆柱 (Ellipsoid/Cylinder)

### 3. 数据可视化
- Primitive 几何体 (GeometryInstance)
- 动态纹理 (Canvas 生成材质)
- 迁徙线 (Polylines 动画)
- 柱状统计图 (Cylinder 聚合)

### 4. 特效与渲染
- 粒子系统 (ParticleSystem)
- 后处理特效 (PostProcessStage)
- 自定义着色器 (CustomShader)
- 水面效果 (Water Primitive)

### 5. 地形与分析
- 地形加载 (CesiumTerrainProvider)
- 可视域分析 (Viewshed)
- 开挖地形 (ClippingPlane)
- 空间量测 (距离/面积/高度)

## 数据流

```
URL 路由 (/example/:category/:exampleId)
  → 从示例注册表读取配置
  → 动态 import 示例模块
  → CesiumPreview 调用 init(viewer) 加载场景
  → CodePanel 读取源文件内容展示
  → 切换示例时先 dispose() 再 init()
```

## 示例模块规范

每个示例是一个独立文件 `src/examples/{category}/{name}.ts`：

```typescript
// 导出清理函数类型
export type DisposeFn = () => void

// 初始化场景，返回清理函数
export function init(viewer: Cesium.Viewer): DisposeFn {
  // 添加 Entity / Primitive / DataSource...
  return () => {
    // 清理资源
  }
}
```

## 示例注册表结构

```typescript
interface ExampleMeta {
  id: string
  title: string
  description: string
  category: CategoryId
  tags: string[]
}

const registry: ExampleMeta[] = [
  { id: 'load-basemap', title: '加载底图', description: '切换不同底图服务', category: 'basic', tags: ['底图','影像'] },
  // ...
]
```

## 技术选型

| 功能 | 方案 |
|------|------|
| 语法高亮 | highlight.js (或 shiki) |
| 代码读取 | Vite `import.meta.glob` 加载源文件 |
| 路由 | Vue Router, `/example/:category/:exampleId` |
| 状态管理 | Pinia (mapStore 管理 viewer 引用和当前示例) |
| 响应式 | CSS Grid 布局，可拖拽调整代码面板高度 |

## 未来拓展

- Header 预留 "three.js" / "WebGL" Tab，点击后切换渲染引擎
- 示例注册表支持引擎字段 (`engine: 'cesium' | 'three' | 'webgl'`)
- 代码面板后续可接入 Monaco Editor 实现在线编辑+运行
