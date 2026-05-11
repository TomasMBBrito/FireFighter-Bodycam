<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const router = useRouter()
const missions = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('https://localhost:7096/api/Mission/status/Active')
    const all = await res.json()
    missions.value = all.filter(m => m.incidentType === 'Solo')
  } catch (e) {
    console.error('Failed to fetch solo missions:', e)
  } finally {
    loading.value = false
  }
})

const watchLive = async (mission) => {
  try {
    const res = await fetch(`https://localhost:7096/api/Mission/${mission.missionId}/firefighters`)
    const firefighters = await res.json()

    const ids = firefighters.map(ff => ff.firefighterId).join(',')
    const names = firefighters.map(ff => ff.name).join(',')

    router.push({
      path: 'firefighters/live',
      query: { ids, names }
    })
  } catch (e) {
    console.error('Failed to fetch firefighters for mission:', e)
  }
}
</script>

<template>
  <div class="p-6 flex flex-col gap-4">
    <div class="flex items-center gap-2">
      <h1 class="text-xl font-bold">Solo Missions</h1>
    </div>

    <div v-if="loading" class="text-muted-foreground text-sm">Loading...</div>

    <div v-else-if="missions.length === 0" class="text-muted-foreground text-sm">
      No active solo missions found.
    </div>

    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>Firefighter</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Started At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="mission in missions" :key="mission.missionId">
          <TableCell class="font-medium">{{ mission.title }}</TableCell>
          <TableCell>{{ mission.location }}</TableCell>
          <TableCell>{{ new Date(mission.startedAt).toLocaleString() }}</TableCell>
          <TableCell>
            <Badge>{{ mission.status }}</Badge>
          </TableCell>
          <TableCell class="text-right">
            <Button size="sm" @click="watchLive(mission)">
              Watch Live
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>