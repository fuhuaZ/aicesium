import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { title: '园区总览', icon: 'dashboard' },
    },
    {
      path: '/heatmap',
      name: 'heatmap',
      component: () => import('@/views/heatmap/HeatmapView.vue'),
      meta: { title: '人流热力', icon: 'heatmap' },
    },
    {
      path: '/energy',
      name: 'energy',
      component: () => import('@/views/energy/EnergyView.vue'),
      meta: { title: '能耗监控', icon: 'energy' },
    },
    {
      path: '/video',
      name: 'video',
      component: () => import('@/views/video/VideoFusionView.vue'),
      meta: { title: '视频融合', icon: 'video' },
    },
    {
      path: '/parking',
      name: 'parking',
      component: () => import('@/views/parking/ParkingView.vue'),
      meta: { title: '停车管理', icon: 'parking' },
    },
    {
      path: '/alert',
      name: 'alert',
      component: () => import('@/views/alert/AlertView.vue'),
      meta: { title: '告警中心', icon: 'alert' },
    },
    {
      path: '/analysis',
      name: 'analysis',
      component: () => import('@/views/analysis/AnalysisView.vue'),
      meta: { title: '空间分析', icon: 'analysis' },
    },
  ],
})

export default router
