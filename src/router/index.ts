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
      path: '/example/:tech/:category/:exampleId',
      name: 'example',
      component: () => import('@/views/ExampleView.vue'),
    },
  ],
})

export default router
