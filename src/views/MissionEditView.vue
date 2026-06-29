<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/config/env'

const route = useRoute()
const router = useRouter()

const missionId = route.params.id
const mission = ref(null)
const commanders = ref([])
const firefighters = ref([])
const availableFirefighters = ref([])
const selectedFirefighter = ref('')

const incidentTypes = ['Solo', 'Wildfire', 'Structure Fire', 'Rescue', 'Hazmat', 'Other']
const statuses = ['Active', 'Completed', 'Cancelled']

const loadData = async () => {
  try {
    const [missionRes, firefightersRes, commandersRes, allFirefightersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/Mission/${missionId}`),
      fetch(`${API_BASE_URL}/api/Mission/${missionId}/firefighters`),
      fetch(`${API_BASE_URL}/api/User/commanders`),
      fetch(`${API_BASE_URL}/api/User/firefighters`)
    ])
    mission.value = await missionRes.json()
    firefighters.value = firefightersRes.ok ? await firefightersRes.json() : []
    commanders.value = await commandersRes.json()
    availableFirefighters.value = await allFirefightersRes.json()
  } catch (err) {
    console.error(err)
  }
}

const saveMission = async () => {
  const statusMap = { 'Active': 0, 'Completed': 1, 'Cancelled': 2 }
  try {
    const res = await fetch(`${API_BASE_URL}/api/Mission/${missionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: mission.value.title,
        location: mission.value.location,
        latitude: mission.value.latitude,
        longitude: mission.value.longitude,
        incidentType: mission.value.incidentType,
        status: statusMap[mission.value.status],
        commanderId: mission.value.commanderId
      })
    })
    if (!res.ok) throw new Error()
    router.push('/missions')
  } catch (err) {
    console.error(err)
    alert('Failed to save mission')
  }
}

const removeFirefighter = async (firefighterId) => {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/Mission/${missionId}/firefighters/${firefighterId}/remove`,
      { method: 'PUT' }
    )
    if (!res.ok) throw new Error()
    firefighters.value = firefighters.value.filter(x => x.firefighterId !== firefighterId)
  } catch (err) {
    console.error(err)
  }
}

const addFirefighter = async () => {
  if (!selectedFirefighter.value) return
  try {
    const res = await fetch(`${API_BASE_URL}/api/Mission/associate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missionID: missionId, firefighterID: selectedFirefighter.value })
    })
    if (!res.ok) throw new Error()
    await loadData()
    selectedFirefighter.value = ''
  } catch (err) {
    console.error(err)
    alert('Failed to add firefighter')
  }
}

onMounted(loadData)
</script>

<template>
  <div v-if="mission" class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Edit Mission</h1>
      <Button
        class="h-9 text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        @click="saveMission"
      >
        Save Changes
      </Button>
    </div>

    <!-- Fields -->
    <div class="grid grid-cols-2 gap-4">

      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-slate-500 uppercase tracking-wider">Title</label>
        <Input
          v-model="mission.title"
          class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-slate-500 uppercase tracking-wider">Location</label>
        <Input
          v-model="mission.location"
          class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-slate-500 uppercase tracking-wider">Latitude</label>
        <Input
          type="number"
          v-model="mission.latitude"
          class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-slate-500 uppercase tracking-wider">Longitude</label>
        <Input
          type="number"
          v-model="mission.longitude"
          class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-slate-500 uppercase tracking-wider">Incident Type</label>
        <select
          v-model="mission.incidentType"
          class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors"
        >
          <option v-for="type in incidentTypes" :key="type">{{ type }}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs text-slate-500 uppercase tracking-wider">Status</label>
        <select
          v-model="mission.status"
          class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors"
        >
          <option v-for="status in statuses" :key="status">{{ status }}</option>
        </select>
      </div>

      <div class="col-span-2 flex flex-col gap-1.5">
        <label class="text-xs text-slate-500 uppercase tracking-wider">Commander</label>
        <select
          v-model="mission.commanderId"
          class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors"
        >
          <option v-for="commander in commanders" :key="commander.userId" :value="commander.userId">
            {{ commander.name }}
          </option>
        </select>
      </div>

    </div>

    <!-- Firefighters -->
    <div class="border border-[#1E3A5F] rounded-lg overflow-hidden">

      <div class="px-4 py-3 border-b border-[#1E3A5F]">
        <h2 class="text-sm font-semibold text-white">Firefighters</h2>
      </div>

      <div class="flex flex-col divide-y divide-[#1E3A5F]">
        <div
          v-for="ff in firefighters"
          :key="ff.firefighterId"
          class="flex justify-between items-center px-4 py-3 hover:bg-[#162035] transition-colors"
        >
          <div>
            <p class="text-sm text-slate-200">{{ ff.name }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ ff.roleInMission }}</p>
          </div>
          <Button
            size="sm"
            class="text-xs bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 transition-colors"
            @click="removeFirefighter(ff.firefighterId)"
          >
            Remove
          </Button>
        </div>

        <div v-if="firefighters.length === 0" class="px-4 py-6 text-center text-slate-500 text-sm">
          No firefighters assigned.
        </div>
      </div>

      <!-- Add firefighter -->
      <div class="flex gap-2 p-4 border-t border-[#1E3A5F] bg-[#0D1526]">
        <select
          v-model="selectedFirefighter"
          class="flex-1 bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors"
        >
          <option value="">Select firefighter</option>
          <option v-for="ff in availableFirefighters" :key="ff.firefighterId" :value="ff.firefighterId">
            {{ ff.name }}
          </option>
        </select>
        <Button
          class="h-9 text-sm bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
          @click="addFirefighter"
        >
          Add
        </Button>
      </div>

    </div>

  </div>
</template>