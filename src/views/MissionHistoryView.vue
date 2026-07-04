<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { API_BASE_URL } from '@/config/env'
import { api } from '@/lib/api'

const missions = ref([])
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const userId = route.params.userId
const firefighterId = route.params.firefighterId

onMounted(async () => {
  try {
    missions.value = await api.get(`/api/user/${userId}/missions`)
  } catch (e) {
    console.error('Failed to fetch mission history:', e)
  } finally {
    loading.value = false
  }
})

const viewFootage = (mission) => {
  router.push({
    name: 'FootageView',
    params: { missionId: mission.missionId, firefighterId }
  })
}
</script>

<template>
  <div class="p-6 flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Mission History</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-slate-500 text-sm">Loading...</div>

    <!-- Empty -->
    <div v-else-if="missions.length === 0" class="text-slate-500 text-sm">No missions found.</div>

    <!-- Table -->
    <Table v-else>
      <TableHeader>
        <TableRow class="border-[#1E3A5F] hover:bg-transparent">
          <TableHead class="text-slate-500 text-xs">Title</TableHead>
          <TableHead class="text-slate-500 text-xs">Location</TableHead>
          <TableHead class="text-slate-500 text-xs">Type</TableHead>
          <TableHead class="text-slate-500 text-xs">Status</TableHead>
          <TableHead class="text-slate-500 text-xs">Started At</TableHead>
          <TableHead class="text-slate-500 text-xs">Ended At</TableHead>
          <TableHead class="text-slate-500 text-xs text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="mission in missions"
          :key="mission.missionId"
          class="border-[#1E3A5F] hover:bg-[#162035] transition-colors"
        >
          <TableCell class="py-2 text-sm font-medium text-white">{{ mission.title }}</TableCell>

          <TableCell class="py-2 text-sm text-slate-400">{{ mission.location }}</TableCell>

          <TableCell class="py-2">
            <Badge
              class="text-xs border"
              :class="mission.incidentType === 'Solo'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-red-950 text-red-300 border-red-900'"
            >
              {{ mission.incidentType }}
            </Badge>
          </TableCell>

          <TableCell class="py-2">
            <Badge
              class="text-xs border"
              :class="mission.status === 0
                ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                : 'bg-[#162035] text-slate-500 border-[#1E3A5F]'"
            >
              {{ mission.status === 0 ? 'Active' : 'Completed' }}
            </Badge>
          </TableCell>

          <TableCell class="py-2 text-sm text-slate-400">
            {{ new Date(mission.startedAt).toLocaleString() }}
          </TableCell>

          <TableCell class="py-2 text-sm text-slate-400">
            {{ mission.endedAt ? new Date(mission.endedAt).toLocaleString() : 'Ongoing' }}
          </TableCell>

          <TableCell class="py-2 text-right">
            <Button
              size="sm"
              class="text-xs bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
              @click="viewFootage(mission)"
            >
              View Footage
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

  </div>
</template>