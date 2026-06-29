<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/config/env'

const firefighters = ref([])
const router = useRouter()
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/User/firefighters`)
    firefighters.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch firefighters:', e)
  } finally {
    loading.value = false
  }
})

const viewMissionHistory = (firefighter) => {
  router.push({
    name: 'MissionHistoryView',
    params: { userId: firefighter.userId, firefighterId: firefighter.firefighterId }
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Firefighters</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-slate-500 text-sm">Loading...</div>

    <!-- Empty -->
    <div v-else-if="firefighters.length === 0" class="text-slate-500 text-sm">
      No firefighters found.
    </div>

    <!-- Table -->
    <Table v-else>
      <TableHeader>
        <TableRow class="border-[#1E3A5F] hover:bg-transparent">
          <TableHead class="text-slate-500 text-xs">Firefighter</TableHead>
          <TableHead class="text-slate-500 text-xs">Role</TableHead>
          <TableHead class="text-slate-500 text-xs text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="firefighter in firefighters"
          :key="firefighter.userId"
          class="border-[#1E3A5F] hover:bg-[#162035] transition-colors"
        >
          <TableCell class="py-2 text-sm font-medium text-white">{{ firefighter.name }}</TableCell>

          <TableCell class="py-2 text-sm text-slate-400">{{ firefighter.role }}</TableCell>

          <TableCell class="py-2 text-right">
            <Button
              size="sm"
              class="text-xs bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
              @click="viewMissionHistory(firefighter)"
            >
              View History
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

  </div>
</template>