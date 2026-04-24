
import { createRouter, createWebHistory } from 'vue-router'

import MapView from '@/views/MapView.vue'
import CameraRooms from '@/views/CameraRooms.vue'
import FirefightersRoom from '@/views/FirefightersRoom.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:'/', component : MapView},
    {
      path:'/missions/:id/cameras', component : CameraRooms
    },
    {
      path:'/missions/:id/firefighters', component : FirefightersRoom
    }
  ],
})

export default router
