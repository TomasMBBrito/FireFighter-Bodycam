<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/config/env'
import { api } from '@/lib/api'

const router = useRouter()
const missions = ref([])
const loading = ref(true)
const selectedType = ref('All')

const incidentTypes = ['All', 'Solo', 'Wildfire', 'Structure Fire', 'Rescue', 'Hazmat', 'Other']

const filteredMissions = computed(() => {
  if (selectedType.value === 'All') return missions.value
  return missions.value.filter(m => m.incidentType === selectedType.value)
})

const editMission = (mission) => router.push({ path: `/missions/edit/${mission.missionId}` })

const watchMissionCameras = (mission) => router.push({ path: '/missions/cameras', query: { missionId: mission.missionId } })

const watchLive = async (mission) => {
  const firefighters = await api.get(`/api/Mission/${mission.missionId}/firefighters`)
  const ids = firefighters.map(ff => ff.firefighterId).join(',')
  const names = firefighters.map(ff => ff.name).join(',')
  router.push({ path: 'firefighters/live', query: { ids, names } })
}

onMounted(async () => {
  const all = await api.get('/api/Mission/status/Active')
  for (const mission of all) {
    const ffs = await api.get(`/api/Mission/${mission.missionId}/firefighters`).catch(() => [])
    mission.streaming = ffs.length > 0 ? ffs[0].streaming : false
  }
  missions.value = all
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Missions</h1>

      <div class="flex items-center gap-2">
        <span class="text-sm text-slate-400">Type:</span>
        <select
          v-model="selectedType"
          class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-2 py-1 outline-none focus:border-blue-600 transition-colors"
        >
          <option v-for="type in incidentTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-slate-500 text-sm">Loading...</div>

    <!-- Empty -->
    <div v-else-if="filteredMissions.length === 0" class="text-slate-500 text-sm">No missions found.</div>

    <!-- Table -->
    <Table v-else>
      <TableHeader>
        <TableRow class="border-[#1E3A5F] hover:bg-transparent">
          <TableHead class="text-slate-500 text-xs">Title</TableHead>
          <TableHead class="text-slate-500 text-xs">Location</TableHead>
          <TableHead class="text-slate-500 text-xs">Type</TableHead>
          <TableHead class="text-slate-500 text-xs">Started At</TableHead>
          <TableHead class="text-slate-500 text-xs">Status</TableHead>
          <TableHead class="text-slate-500 text-xs text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="mission in filteredMissions"
          :key="mission.missionId"
          class="border-[#1E3A5F] hover:bg-[#162035] transition-colors"
        >
          <TableCell class="text-sm font-medium text-white">{{ mission.title }}</TableCell>

          <TableCell class="text-sm text-slate-400">{{ mission.location }}</TableCell>

          <TableCell>
            <Badge
              class="text-xs border"
              :class="mission.incidentType === 'Solo'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-red-950 text-red-300 border-red-900'"
            >
              {{ mission.incidentType }}
            </Badge>
          </TableCell>

          <TableCell class="text-sm text-slate-400">
            {{ new Date(mission.startedAt).toLocaleString() }}
          </TableCell>

          <TableCell>
            <Badge class="text-xs bg-emerald-950 text-emerald-400 border border-emerald-900">
              {{ mission.status }}
            </Badge>
          </TableCell>

          <TableCell class="text-right">
            <div class="flex justify-end gap-2">
              <Button
                size="sm"
                class="text-xs bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
                @click="watchMissionCameras(mission)"
              >
                Cameras
              </Button>

              <Button
                size="sm"
                class="text-xs bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
                @click="editMission(mission)"
              >
                Edit
              </Button>

              <Button
                size="sm"
                class="text-xs transition-colors"
                :class="mission.streaming
                  ? 'bg-red-700 hover:bg-red-600 text-white border-0'
                  : 'bg-[#162035] text-slate-600 border border-[#1E3A5F] cursor-not-allowed'"
                :disabled="!mission.streaming"
                @click="watchLive(mission)"
              >
                Watch Live
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

  </div>
</template>