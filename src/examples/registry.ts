import type { ExampleMeta, TechId, CategoryId } from '@/types/examples'

export const exampleRegistry: ExampleMeta[] = [
  {
    id: 'load-basemap',
    title: '加载底图',
    description: '演示切换不同底图服务（Bing/OSM/ArcGIS）',
    tech: 'cesium',
    category: 'basic',
    tags: ['底图', 'ImageryProvider'],
  },
  {
    id: 'camera-flyto',
    title: '相机飞行',
    description: '演示 flyTo 动画飞向指定位置',
    tech: 'cesium',
    category: 'basic',
    tags: ['Camera', 'flyTo', '动画'],
  },
  {
    id: 'coordinate-pick',
    title: '坐标拾取',
    description: '点击地图获取经纬度和高度',
    tech: 'cesium',
    category: 'basic',
    tags: ['拾取', '坐标', '事件'],
  },
  {
    id: 'mouse-events',
    title: '鼠标事件',
    description: '监听鼠标 LEFT_CLICK / MOUSE_MOVE / RIGHT_CLICK',
    tech: 'cesium',
    category: 'basic',
    tags: ['事件', 'ScreenSpaceEventHandler'],
  },
  {
    id: 'cesium-inspector',
    title: '调试面板',
    description: '开启/关闭 Cesium Inspector 调试工具',
    tech: 'cesium',
    category: 'basic',
    tags: ['调试', 'Inspector'],
  },
  {
    id: 'billboard',
    title: '点标记 Billboard',
    description: '使用 Billboard 添加图标标记点',
    tech: 'cesium',
    category: 'entity',
    tags: ['Billboard', 'Entity', '图标'],
  },
  {
    id: 'polyline',
    title: '线段 Polyline',
    description: '绘制空间折线并设置颜色/宽度',
    tech: 'cesium',
    category: 'entity',
    tags: ['Polyline', 'Entity', '折线'],
  },
  {
    id: 'polygon',
    title: '多边形 Polygon',
    description: '绘制填充多边形并设置颜色/透明度',
    tech: 'cesium',
    category: 'entity',
    tags: ['Polygon', 'Entity', '面'],
  },
  {
    id: 'model-3d',
    title: '3D 模型加载',
    description: '加载 glTF/glb 格式的三维模型',
    tech: 'cesium',
    category: 'entity',
    tags: ['Model', 'glTF', 'Entity'],
  },
  {
    id: 'label-tag',
    title: '文字标签 Label',
    description: '添加文字标签并设置字体/颜色/偏移',
    tech: 'cesium',
    category: 'entity',
    tags: ['Label', 'Entity', '文字'],
  },
  {
    id: 'ellipsoid',
    title: '椭球与圆柱',
    description: '创建 Ellipsoid 和 Cylinder 体元',
    tech: 'cesium',
    category: 'entity',
    tags: ['Ellipsoid', 'Cylinder', 'Entity'],
  },
  {
    id: 'primitive-geometry',
    title: 'Primitive 几何体',
    description: '使用 Primitive API 创建高性能几何体',
    tech: 'cesium',
    category: 'visualization',
    tags: ['Primitive', 'GeometryInstance'],
  },
  {
    id: 'dynamic-texture',
    title: '动态纹理',
    description: '使用 Canvas 动态生成材质纹理',
    tech: 'cesium',
    category: 'visualization',
    tags: ['Canvas', '纹理', 'Material'],
  },
  {
    id: 'migration-lines',
    title: '迁徙线动画',
    description: '动态弧线模拟数据流动/迁徙效果',
    tech: 'cesium',
    category: 'visualization',
    tags: ['动画', '弧线', '流动'],
  },
  {
    id: 'cylinder-chart',
    title: '柱状统计图',
    description: '使用 Cylinder Entity 聚合生成3D柱状图',
    tech: 'cesium',
    category: 'visualization',
    tags: ['Cylinder', '统计图', '3D图表'],
  },
  {
    id: 'particle-system',
    title: '粒子系统',
    description: '创建烟、火、雨等粒子特效',
    tech: 'cesium',
    category: 'effects',
    tags: ['粒子', 'ParticleSystem', '特效'],
  },
  {
    id: 'post-process',
    title: '后处理特效',
    description: '添加泛光/夜视/黑白等后处理效果',
    tech: 'cesium',
    category: 'effects',
    tags: ['后处理', 'PostProcessStage', '滤镜'],
  },
  {
    id: 'custom-shader',
    title: '自定义着色器',
    description: '使用 CustomShader 修改模型外观',
    tech: 'cesium',
    category: 'effects',
    tags: ['着色器', 'CustomShader', 'WebGL'],
  },
  {
    id: 'water',
    title: '水面效果',
    description: '使用 Water.glsl 创建动态水面',
    tech: 'cesium',
    category: 'effects',
    tags: ['水面', 'Water', '着色器'],
  },
  {
    id: 'terrain-load',
    title: '地形加载',
    description: '加载 CesiumTerrainProvider 地形数据',
    tech: 'cesium',
    category: 'terrain',
    tags: ['地形', 'TerrainProvider'],
  },
  {
    id: 'viewshed',
    title: '可视域分析',
    description: '计算并展示指定点的可见区域',
    tech: 'cesium',
    category: 'terrain',
    tags: ['可视域', 'Viewshed', '分析'],
  },
  {
    id: 'clipping-plane',
    title: '地形开挖',
    description: '使用 ClippingPlane 实现地形开挖效果',
    tech: 'cesium',
    category: 'terrain',
    tags: ['开挖', 'ClippingPlane', '剖面'],
  },
  {
    id: 'measurement',
    title: '空间量测',
    description: '量测空间距离/面积/高度',
    tech: 'cesium',
    category: 'terrain',
    tags: ['量测', '距离', '面积', '高度'],
  },
]

export function getExamplesByTech(tech: TechId): ExampleMeta[] {
  return exampleRegistry.filter((e) => e.tech === tech)
}

export function getExamplesByCategory(category: CategoryId, tech?: TechId): ExampleMeta[] {
  const filtered = tech ? exampleRegistry.filter((e) => e.tech === tech) : exampleRegistry
  return filtered.filter((e) => e.category === category)
}

export function getExampleById(id: string): ExampleMeta | undefined {
  return exampleRegistry.find((e) => e.id === id)
}
