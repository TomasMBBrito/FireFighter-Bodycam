
import { createRouter, createWebHistory } from 'vue-router'

import MapView from '@/views/MapView.vue'
import CreateMissionView from '@/views/CreateMissionView.vue'
import MonitorView from '@/views/MonitorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:'/', component : MapView},
    {
      path:'/missions/cameras', component : MonitorView
    },
    {
      path: '/missions/create', component: CreateMissionView
    },
  ],
})

export default router
