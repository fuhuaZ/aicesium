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
