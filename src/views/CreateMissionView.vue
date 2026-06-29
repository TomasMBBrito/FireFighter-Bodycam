<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/config/env'

const router = useRouter()
const title = ref('')
const location = ref('')
const incidentType = ref('')
const commanderId = ref('')
const latitude = ref('')
const longitude = ref('')
const commanders = ref([])

onMounted(async () => {
  const res = await fetch(`${API_BASE_URL}/api/User/commanders`)
  commanders.value = await res.json()
})

const submit = async () => {
  const res = await fetch(`${API_BASE_URL}/api/Mission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: title.value,
      location: location.value,
      incidentType: incidentType.value,
      commanderId: commanderId.value,
      latitude: parseFloat(latitude.value),
      longitude: parseFloat(longitude.value),
    })
  })
  if (res.ok) router.push('/missions')
}
</script>

<template>
  <div class="p-6 flex flex-col items-center gap-6">

    <div class="flex items-center justify-between w-full max-w-lg">
      <h1 class="text-lg font-semibold text-white">New Mission</h1>
      <Button
        class="h-9 text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        @click="submit"
      >
        Create Mission
      </Button>
    </div>

    <div class="border border-[#1E3A5F] rounded-lg overflow-hidden w-full max-w-lg">
      <div class="flex flex-col divide-y divide-[#1E3A5F]">

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Title</label>
          <Input v-model="title" placeholder="Title"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Location</label>
          <Input v-model="location" placeholder="Location"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Latitude</label>
          <Input v-model="latitude" placeholder="e.g. 39.6512" type="number" step="any"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Longitude</label>
          <Input v-model="longitude" placeholder="e.g. -8.8245" type="number" step="any"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Incident Type</label>
          <select v-model="incidentType"
            class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors">
            <option value="" disabled>Select type</option>
            <option value="Wildfire">Wildfire</option>
            <option value="Structure Fire">Structure Fire</option>
            <option value="Solo">Solo</option>
            <option value="Rescue">Rescue</option>
            <option value="Hazmat">Hazmat</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Commander</label>
          <select v-model="commanderId"
            class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors">
            <option value="" disabled>Select commander</option>
            <option v-for="c in commanders" :key="c.userId" :value="c.userId">{{ c.name }}</option>
          </select>
        </div>

      </div>
    </div>

  </div>
</template>