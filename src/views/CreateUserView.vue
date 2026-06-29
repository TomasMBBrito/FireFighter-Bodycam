<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/config/env'

const router = useRouter()
const username = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('')
const stationId = ref(null)
const stations = ref([])

const needsStation = computed(() =>
  role.value === 'Firefighter' || role.value === 'Vehicle'
)

const loadStations = async () => {
  const res = await fetch(`${API_BASE_URL}/api/Station`)
  stations.value = await res.json()
}

const submit = async () => {
  const res = await fetch(`${API_BASE_URL}/api/User`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: username.value,
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
      ...(needsStation.value && { stationId: stationId.value })
    })
  })
  if (res.ok) router.push('/firefighters')
}

onMounted(loadStations)
</script>

<template>
  <div class="p-6 flex flex-col items-center gap-6">

    <div class="flex items-center justify-between w-full max-w-lg">
      <h1 class="text-lg font-semibold text-white">New User</h1>
      <Button
        class="h-9 text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        @click="submit"
      >
        Create User
      </Button>
    </div>

    <div class="border border-[#1E3A5F] rounded-lg overflow-hidden w-full max-w-lg">
      <div class="flex flex-col divide-y divide-[#1E3A5F]">

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Username</label>
          <Input v-model="username" placeholder="Username"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Name</label>
          <Input v-model="name" placeholder="Name"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Email</label>
          <Input v-model="email" placeholder="Email"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Password</label>
          <Input v-model="password" placeholder="Password" type="password"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Role</label>
          <select v-model="role"
            class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors">
            <option value="" disabled>Select role</option>
            <option value="Commander">Commander</option>
            <option value="Monitor">Monitor</option>
            <option value="Firefighter">Firefighter</option>
            <option value="Vehicle">Vehicle</option>
          </select>
        </div>

        <div v-if="needsStation" class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Station</label>
          <select v-model="stationId"
            class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors">
            <option :value="null" disabled>Select station</option>
            <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>

      </div>
    </div>

  </div>
</template>