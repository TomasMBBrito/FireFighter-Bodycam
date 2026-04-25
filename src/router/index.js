import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{
      path: '/missions/create',
      component: () => import('@/views/CreateMissionView.vue')
    }],
})

export default router
