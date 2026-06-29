<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { API_BASE_URL } from '@/config/env'

const route = useRoute()
const router = useRouter()

const stationId = route.params.id
const name = ref('')
const location = ref('')
const firefighterCount = ref(0)
const loading = ref(true)

const loadStation = async () => {
  const res = await fetch(`${API_BASE_URL}/api/Station/${stationId}`)
  const data = await res.json()
  name.value = data.name
  location.value = data.location
  firefighterCount.value = data.firefighterCount
  loading.value = false
}

const submit = async () => {
  const res = await fetch(`${API_BASE_URL}/api/Station/${stationId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.value, location: location.value })
  })
  if (res.ok) router.push('/stations')
}

onMounted(loadStation)
</script>

<template>
  <div v-if="!loading" class="p-6 flex flex-col items-center gap-6">

    <!-- Header -->
    <div class="flex items-center justify-between w-full max-w-lg">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-semibold text-white">Edit Station</h1>
        <Badge class="text-xs bg-[#162035] text-slate-400 border border-[#1E3A5F]">
          {{ firefighterCount }} firefighter{{ firefighterCount !== 1 ? 's' : '' }} associated
        </Badge>
      </div>
      <Button
        class="h-9 text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        @click="submit"
      >
        Save Changes
      </Button>
    </div>

    <!-- Form -->
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
          <label class="text-xs text-slate-500 uppercase tracking-wider">Location</label>
          <Input
            v-model="location"
            placeholder="Location"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600"
          />
        </div>

      </div>
    </div>

  </div>
</template>