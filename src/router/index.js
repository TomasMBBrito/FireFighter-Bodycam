
import { createRouter, createWebHistory } from 'vue-router'

import MapView from '@/views/MapView.vue'
import CreateMissionView from '@/views/CreateMissionView.vue'
import SoloMissionsView from '@/views/SoloMissionsView.vue'
import CreateUserView from '@/views/CreateUserView.vue'
import MonitorView from '@/views/MonitorView.vue'
import FirefightersView from '@/views/FirefightersView.vue'
import FirefighterLiveView from '@/views/FirefighterLiveView.vue'
import HistoryView from '@/views/HistoryView.vue'
import MissionHistoryView from '@/views/MissionHistoryView.vue'
import FootageView from '@/views/FootageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/', component : MapView
    },
    {
      path:'/missions/cameras', component : MonitorView
    },
    {
      path: '/missions/create', component: CreateMissionView
    },
    {
      path:'/missions' , component: SoloMissionsView
    },
    {
      path: '/users/create', component: CreateUserView
    },
    {
      path:'/firefighters', component: FirefightersView
    },
    {
      path:'/firefighters/live', component: FirefighterLiveView
    },
    {
      path:'/history', component: HistoryView
    },
    {
      path:'/history/mission/:userId/:firefighterId', name: 'MissionHistoryView', component: MissionHistoryView
    },
    {
      path:'/history/footage/:missionId/:firefighterId', name: 'FootageView', component: FootageView
    },
    {
      path: '/missions/edit/:id',
      component: () => import('@/views/MissionEditView.vue')
    }
  ],
})
export default router
