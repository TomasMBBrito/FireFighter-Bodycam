<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/config/env'

const router = useRouter()
const stations = ref([])

const loadStations = async () => {
  const res = await fetch(`${API_BASE_URL}/api/Station`)
  stations.value = await res.json()
}

const deleteStation = async (station) => {
  if (!confirm(`Tens a certeza que queres eliminar ${station.name}?`)) return
  const res = await fetch(`${API_BASE_URL}/api/Station/${station.id}`, { method: 'DELETE' })
  if (res.ok) {
    stations.value = stations.value.filter(s => s.id !== station.id)
  } else {
    const msg = await res.text()
    alert(msg || 'Erro ao eliminar estação')
  }
}

loadStations()
</script>

<template>
  <div class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Stations</h1>

      <Button
        class="h-9 text-sm bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
        @click="router.push('/stations/create')"
      >
        Create Station
      </Button>
    </div>

    <!-- Empty -->
    <div v-if="stations.length === 0" class="text-slate-500 text-sm">
      No stations found.
    </div>

    <!-- Table -->
    <Table v-else>
      <TableHeader>
        <TableRow class="border-[#1E3A5F] hover:bg-transparent">
          <TableHead class="text-slate-500 text-xs">Name</TableHead>
          <TableHead class="text-slate-500 text-xs">Location</TableHead>
          <TableHead class="text-slate-500 text-xs text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="station in stations"
          :key="station.stationId"
          class="border-[#1E3A5F] hover:bg-[#162035] transition-colors"
        >
          <TableCell class="py-2 text-sm font-medium text-white">{{ station.name }}</TableCell>

          <TableCell class="py-2 text-sm text-slate-400">{{ station.location }}</TableCell>

          <TableCell class="py-2 text-right">
            <div class="flex justify-end gap-2">
              <Button
                size="sm"
                class="text-xs bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
                @click="router.push(`/stations/${station.id}/edit`)"
              >
                Edit
              </Button>
              <Button
                size="sm"
                class="text-xs bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 transition-colors"
                @click="deleteStation(station)"
              >
                Delete
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

  </div>
</template>