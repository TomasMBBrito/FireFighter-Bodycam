<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/config/env'

const router = useRouter()
const name = ref('')
const location = ref('')

const submit = async () => {
  const res = await fetch(`${API_BASE_URL}/api/Station`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.value, location: location.value })
  })
  if (res.ok) router.push('/stations')
}
</script>

<template>
  <div class="p-6 flex flex-col items-center gap-6">

    <div class="flex items-center justify-between w-full max-w-lg">
      <h1 class="text-lg font-semibold text-white">New Station</h1>
      <Button
        class="h-9 text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors"
        @click="submit"
      >
        Create Station
      </Button>
    </div>

    <div class="border border-[#1E3A5F] rounded-lg overflow-hidden w-full max-w-lg">
      <div class="flex flex-col divide-y divide-[#1E3A5F]">

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Name</label>
          <Input v-model="name" placeholder="Name"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

        <div class="flex flex-col gap-1.5 px-4 py-3">
          <label class="text-xs text-slate-500 uppercase tracking-wider">Location</label>
          <Input v-model="location" placeholder="Location"
            class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
        </div>

      </div>
    </div>

  </div>
</template>