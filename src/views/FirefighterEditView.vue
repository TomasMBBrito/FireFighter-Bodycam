<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/config/env'

const route = useRoute()
const router = useRouter()

const userId = route.params.id
const name = ref('')
const email = ref('')
const stationId = ref(null)
const stations = ref([])
const loading = ref(true)

const loadData = async () => {
  const [userRes, stationsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/User/${userId}`),
    fetch(`${API_BASE_URL}/api/Station`)
  ])
  const user = await userRes.json()
  stations.value = await stationsRes.json()
  name.value = user.name
  email.value = user.email
  stationId.value = user.stationId ?? null
  loading.value = false
}

const submit = async () => {
  const res = await fetch(`${API_BASE_URL}/api/User/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.value, email: email.value, stationId: stationId.value })
  })
  if (res.ok) router.push('/firefighters')
}

onMounted(loadData)
</script>

<template>
  <div v-if="!loading" class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Edit Firefighter</h1>
      <Button
        class="h-9 text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        @click="submit"
      >
        Save Changes
      </Button>
    </div>

    <div class="flex justify-center">
      <div class="border border-[#1E3A5F] rounded-lg overflow-hidden w-full max-w-lg">

        <div class="flex flex-col divide-y divide-[#1E3A5F]">

          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">Name</label>
            <Input
              v-model="name"
              placeholder="Name"
              class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600"
            />
          </div>

          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">Email</label>
            <Input
              v-model="email"
              placeholder="Email"
              class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600"
            />
          </div>

          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">Station</label>
            <select
              v-model="stationId"
              class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors"
            >
              <option :value="null" disabled>Select Station</option>
              <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>