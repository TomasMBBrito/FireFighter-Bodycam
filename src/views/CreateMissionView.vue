<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'

const router = useRouter()

const title = ref('')
const location = ref('')
const incidentType = ref('')
const commanderName = ref('')
const latitude = ref('')
const longitude = ref('')
const commanders = ref([])

onMounted(async () => {
  const res = await fetch('https://localhost:7096/api/User/commanders')
  commanders.value = await res.json()
})

const submit = async () => {
  const payload = {
    title: title.value,
    location: location.value,
    incidentType: incidentType.value,
    commanderName: commanderName.value,
    latitude: parseFloat(latitude.value),
    longitude: parseFloat(longitude.value),
  }

  console.log('Sending:', payload)

  const res = await fetch('https://localhost:7096/api/Mission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const data = await res.json()
  console.log('Response:', data)

  if (res.ok) {
    router.push('/missions')
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto mt-10 flex flex-col gap-4">
    <h1 class="text-2xl font-semibold">New Mission</h1>

    <Input v-model="title" placeholder="Title" />
    <Input v-model="location" placeholder="Location" />
    <Input v-model="latitude" placeholder="Latitude  (e.g. 39.6512)" type="number" step="any" />
    <Input v-model="longitude" placeholder="Longitude (e.g. -8.8245)" type="number" step="any" />

    <Select v-model="incidentType">
      <SelectTrigger>
        <SelectValue placeholder="Incident Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Wildfire">Wildfire</SelectItem>
        <SelectItem value="Structure Fire">Structure Fire</SelectItem>
        <SelectItem value="Rescue">Rescue</SelectItem>
        <SelectItem value="Hazmat">Hazmat</SelectItem>
        <SelectItem value="Other">Other</SelectItem>
      </SelectContent>
    </Select>

    <Select v-model="commanderName">
      <SelectTrigger>
        <SelectValue placeholder="Commander" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="c in commanders" :key="c.userId" :value="c.name">
          {{ c.name }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Button @click="submit">Create Mission</Button>
  </div>
</template>