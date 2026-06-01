<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { API_BASE_URL } from '@/config/env'

const router = useRouter()

const missions = ref([])
const loading = ref(true)

const selectedType = ref('All')

const incidentTypes = [
  'All',
  'Solo',
  'Wildfire',
  'Structure Fire',
  'Rescue',
  'Hazmat',
  'Other'
]

const filteredMissions = computed(() => {
  if (selectedType.value === 'All')
    return missions.value

  return missions.value.filter(
    m => m.incidentType === selectedType.value
  )
})

const editMission = (mission) => {
  router.push({
    path: `/missions/edit/${mission.missionId}`
  })
}

const watchMissionCameras = (mission) => {
  router.push({
    path: '/missions/cameras',
    query: {
      missionId: mission.missionId
    }
  })
}

const watchLive = async (mission) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/Mission/${mission.missionId}/firefighters`
    )

    if (!res.ok)
      return

    const firefighters = await res.json()

    const ids = firefighters
      .map(ff => ff.firefighterId)
      .join(',')

    const names = firefighters
      .map(ff => ff.name)
      .join(',')

    router.push({
      path: 'firefighters/live',
      query: { ids, names }
    })
  } catch (e) {
    console.error(
      'Failed to fetch firefighters for mission:',
      e
    )
  }
}

onMounted(async () => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/Mission/status/Active`
    )

    if (!res.ok)
      throw new Error(`HTTP ${res.status}`)

    const all = await res.json()

    for (const mission of all) {
      try {
        const ffRes = await fetch(
          `${API_BASE_URL}/api/Mission/${mission.missionId}/firefighters`
        )

        if (!ffRes.ok) {
          mission.streaming = false
          continue
        }

        const firefighters = await ffRes.json()

        mission.streaming =
          firefighters.length > 0
            ? firefighters[0].streaming
            : false

      } catch {
        mission.streaming = false
      }
    }

    missions.value = all

  } catch (e) {
    console.error('Failed to fetch missions:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6 flex flex-col gap-4">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold">
        Missions
      </h1>

      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">
          Incident Type:
        </span>

        <select v-model="selectedType" class="border rounded px-2 py-1 text-sm">
          <option v-for="type in incidentTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-muted-foreground text-sm">
      Loading...
    </div>

    <!-- Empty -->
    <div v-else-if="filteredMissions.length === 0" class="text-muted-foreground text-sm">
      No missions found.
    </div>

    <!-- Table -->
    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Started At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-for="mission in filteredMissions" :key="mission.missionId">
          <TableCell class="font-medium">
            {{ mission.title }}
          </TableCell>

          <TableCell>
            {{ mission.location }}
          </TableCell>

          <TableCell>
            <Badge variant="outline">
              {{ mission.incidentType }}
            </Badge>
          </TableCell>

          <TableCell>
            {{
              new Date(
                mission.startedAt
              ).toLocaleString()
            }}
          </TableCell>

          <TableCell>
            <Badge>
              {{ mission.status }}
            </Badge>
          </TableCell>

          <TableCell class="text-right flex justify-end gap-2">
            <Button size="sm" @click="watchMissionCameras(mission)">
              Cameras
            </Button>

            <Button size="sm" variant="outline" @click="editMission(mission)">
              Edit
            </Button>

            <Button size="sm" :disabled="!mission.streaming" @click="watchLive(mission)">
              Watch Live
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

  </div>
</template>