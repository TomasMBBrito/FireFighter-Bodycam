
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import MapView from '@/views/MapView.vue'
import CreateMissionView from '@/views/CreateMissionView.vue'
import MissionsView from '@/views/MissionsView.vue'
import CreateUserView from '@/views/CreateUserView.vue'
import MonitorView from '@/views/MonitorView.vue'
import FirefightersView from '@/views/FirefightersView.vue'
import FirefighterLiveView from '@/views/FirefighterLiveView.vue'
import HistoryView from '@/views/HistoryView.vue'
import MissionHistoryView from '@/views/MissionHistoryView.vue'
import MissionEditView from '@/views/MissionEditView.vue'
import FootageView from '@/views/FootageView.vue'
import StationsView from '@/views/StationsView.vue'
import CreateStationView from '@/views/CreateStationView.vue'
import FirefighterEditView from '@/views/FirefighterEditView.vue'
import StationEditView from '@/views/StationEditView.vue'
import LoginView from '@/views/LoginView.vue'
import StatisticsView from '@/views/StatisticsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/', component : MapView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path:'/missions/cameras', component : MonitorView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path: '/missions/create', component: CreateMissionView, meta: { roles: ['Admin'] }
    },
    {
      path:'/missions' , component: MissionsView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path: '/users/create', component: CreateUserView, meta: { roles: ['Admin'] }
    },
    {
      path:'/firefighters', component: FirefightersView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path:'/firefighters/live', component: FirefighterLiveView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path:'/history', component: HistoryView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path:'/history/mission/:userId/:firefighterId', name: 'MissionHistoryView', component: MissionHistoryView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path:'/history/footage/:missionId/:firefighterId', name: 'FootageView', component: FootageView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path: '/missions/edit/:id', name: 'MissionEditView', component: MissionEditView, meta: { roles: ['Monitor', 'Admin'] }
    },
    {
      path: '/stations', component: StationsView, meta: { roles: ['Commander', 'Monitor', 'Admin'] }
    },
    {
      path: '/stations/create', component: CreateStationView, meta: { roles: ['Admin'] }
    },
    {
      path: '/firefighters/:id/edit', name: 'UserEditView', component: FirefighterEditView, meta: { roles: ['Monitor', 'Admin'] }
    },
    {
      path : '/stations/:id/edit', name: 'StationEditView', component: StationEditView, meta: { roles: ['Monitor', 'Admin'] }  
    },
    {
      path: '/stream-test',
      component: () => import('@/views/TestStreams.vue')
    },
    {
      path: '/login', component: LoginView
    },
    {
      path: '/statistics', component: StatisticsView, meta: { roles: ['Monitor', 'Admin'] }
    }
  ],
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore()

  // Rota pública — nunca bloquear nem verificar nada
  if (to.path === '/login') {
    if (authStore.isLoggedIn) {
      return '/' // já autenticado, não faz sentido voltar ao login
    }
    return true
  }

  // A partir daqui, todas as rotas exigem login
  if (!authStore.isLoggedIn) {
    return '/login'
  }

  // Verificação de role
  if (to.meta.roles && !to.meta.roles.includes(authStore.user.role)) {
    return from.path && from.path !== to.path ? from.path : '/'
  }

  return true
})

export default router
