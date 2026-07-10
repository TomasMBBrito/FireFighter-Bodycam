<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'

const stats = ref(null)
const loading = ref(true)

onMounted(async () => {
  stats.value = await api.get('/api/Statistics')
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Statistics</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-slate-500 text-sm">Loading...</div>

    <!-- Stats -->
    <div v-else class="grid grid-cols-2 gap-4">

      <div class="border border-[#1E3A5F] rounded-lg p-5 bg-[#0D1526] flex flex-col gap-1">
        <p class="text-xs text-slate-500 uppercase tracking-wider">Total Missions</p>
        <p class="text-3xl font-bold text-white">{{ stats.totalMissions }}</p>
      </div>

      <div class="border border-[#1E3A5F] rounded-lg p-5 bg-[#0D1526] flex flex-col gap-1">
        <p class="text-xs text-slate-500 uppercase tracking-wider">Active Missions</p>
        <p class="text-3xl font-bold text-emerald-400">{{ stats.activeMissions }}</p>
      </div>

      <div class="border border-[#1E3A5F] rounded-lg p-5 bg-[#0D1526] flex flex-col gap-1">
        <p class="text-xs text-slate-500 uppercase tracking-wider">Completed Missions</p>
        <p class="text-3xl font-bold text-blue-400">{{ stats.completedMissions }}</p>
      </div>

      <div class="border border-[#1E3A5F] rounded-lg p-5 bg-[#0D1526] flex flex-col gap-1">
        <p class="text-xs text-slate-500 uppercase tracking-wider">Total Firefighters</p>
        <p class="text-3xl font-bold text-white">{{ stats.totalFirefighters }}</p>
      </div>

      <div class="border border-[#1E3A5F] rounded-lg p-5 bg-[#0D1526] flex flex-col gap-1">
        <p class="text-xs text-slate-500 uppercase tracking-wider">Total Commanders</p>
        <p class="text-3xl font-bold text-white">{{ stats.totalCommanders }}</p>
      </div>

      <div class="border border-[#1E3A5F] rounded-lg p-5 bg-[#0D1526] flex flex-col gap-1">
        <p class="text-xs text-slate-500 uppercase tracking-wider">Total Monitors</p>
        <p class="text-3xl font-bold text-white">{{ stats.totalMonitors }}</p>
      </div>

      <div class="border border-[#1E3A5F] rounded-lg p-5 bg-[#0D1526] flex flex-col gap-1">
        <p class="text-xs text-slate-500 uppercase tracking-wider">Total Administrators</p>
        <p class="text-3xl font-bold text-white">{{ stats.totalAdmins }}</p>
      </div>

      <div class="border border-[#1E3A5F] rounded-lg p-5 bg-[#0D1526] flex flex-col gap-1">
        <p class="text-xs text-slate-500 uppercase tracking-wider">Total Stations</p>
        <p class="text-3xl font-bold text-white">{{ stats.totalStations }}</p>
      </div>

    </div>
  </div>
</template>