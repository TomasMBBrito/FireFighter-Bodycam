<script setup lang="ts">
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
const commanders = ref<{ userId: string, name: string }[]>([])

onMounted(async () => {
  //FIX the localhost after burro
  const resGetCommanders = await fetch('https://localhost:7096/api/User/commanders')
  commanders.value = await resGetCommanders.json()
  console.log(commanders.value)
})


const submit = async () => {
  await fetch('https://localhost:7096/api/mission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: title.value,
      location: location.value,
      incidentType: incidentType.value,
      commanderName: commanderName.value,
    })
  })

  router.push('/missions')
}
</script>

<template>
  <div class="max-w-lg mx-auto mt-10 flex flex-col gap-4">
    <h1 class="text-2xl font-semibold">New Mission</h1>

    <Input v-model="title" placeholder="Title" />
    <Input v-model="location" placeholder="Location" />

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