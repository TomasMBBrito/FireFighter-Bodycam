<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const router = useRouter()
const firefighters = ref([])
const selected = ref([])

const WATCHABLE_ROLES = ['Firefighter', 'Vehicle']
const selectedRole = ref(WATCHABLE_ROLES) // Default to "Firefighter + Vehicle"

const loadFirefighters = async () => {
  firefighters.value = await api.get('/api/User')
}

const roleOptions = computed(() => {
  const roles = [...new Set(firefighters.value.map(ff => ff.role))].sort()
  const options = [{ label: 'All', value: 'All' }]
  
  //Inlude "Firefighter + Vehicle" option if any of the roles are watchable
  const hasWatchableRoles = roles.some(r => WATCHABLE_ROLES.includes(r))
  if (hasWatchableRoles) {
    options.push({ label: 'Firefighter + Vehicle', value: WATCHABLE_ROLES })
  }
 
  roles.forEach(r => options.push({ label: r, value: r }))
  return options
})


const filteredFirefighters = computed(() => {
  if (selectedRole.value === 'All') return firefighters.value
  if (Array.isArray(selectedRole.value)) {
    return firefighters.value.filter(ff => selectedRole.value.includes(ff.role))
  }
  return firefighters.value.filter(ff => ff.role === selectedRole.value)
})


const canWatch = (ff) => WATCHABLE_ROLES.includes(ff.role)

const toggle = (ff) => {
  if (!ff.streaming) return
  const idx = selected.value.findIndex(f => f.firefighterId === ff.firefighterId)
  if (idx === -1) selected.value.push(ff)
  else selected.value.splice(idx, 1)
}

const isSelected = (ff) => selected.value.some(f => f.firefighterId === ff.firefighterId)

const goToWatchLive = () => {
  router.push({
    path: '/firefighters/live',
    query: {
      ids: selected.value.map(f => f.firefighterId).join(','),
      names: selected.value.map(f => f.name).join(',')
    }
  })
}

const deleteUser = async (ff) => {
  if (!confirm(`Are you sure that you want to delete ${ff.name}?`)) return
  await api.delete(`/api/User/${ff.userId}`)
  firefighters.value = firefighters.value.filter(f => f.userId !== ff.userId)
  selected.value = selected.value.filter(f => f.userId !== ff.userId)
}

loadFirefighters()
</script>

<template>
  <div class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-5">

    <!-- Header -->
        <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Firefighters</h1>
 
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-400">Role:</span>
            <select
              v-model="selectedRole"
              class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-2 py-1 outline-none focus:border-blue-600 transition-colors"
            >
            <option v-for="opt in roleOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
          </select>

        </div>
 
        <Button
          :disabled="selected.length === 0"
          class="h-9 text-sm transition-colors"
          :class="selected.length > 0
            ? 'bg-red-700 hover:bg-red-600 text-white border-0'
            : 'bg-[#162035] text-slate-600 border border-[#1E3A5F] cursor-not-allowed'"
          @click="goToWatchLive"
        >
          Watch Live ({{ selected.length }})
        </Button>
      </div>
    </div>


    <!-- Empty -->
    <div v-if="firefighters.length === 0" class="text-slate-500 text-sm">
      No firefighters found.
    </div>

    <!-- Table -->
    <Table v-else>
      <TableHeader>
        <TableRow class="border-[#1E3A5F] hover:bg-transparent">
          <TableHead class="text-slate-500 text-xs w-10">Watch</TableHead>
          <TableHead class="text-slate-500 text-xs">Name</TableHead>
          <TableHead class="text-slate-500 text-xs">Stream</TableHead>
          <TableHead class="text-slate-500 text-xs">Role</TableHead>
          <TableHead class="text-slate-500 text-xs text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow
          v-for="ff in filteredFirefighters"
          :key="ff.firefighterId"
          class="border-[#1E3A5F] hover:bg-[#162035] transition-colors cursor-pointer"
          @click="toggle(ff)"
        >
          <TableCell class="py-2">
            <Checkbox 
              v-if="canWatch(ff)"
              :checked="isSelected(ff)"
              :disabled="!ff.streaming"
              @click.stop="toggle(ff)"
            />
          </TableCell>

          <TableCell class="py-2 text-sm text-slate-200 font-medium">{{ ff.name }}</TableCell>

          <TableCell class="py-2">
            <Badge
              v-if="canWatch(ff)"
              class="text-xs border"
              :class="ff.streaming
                ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                : 'bg-transparent text-slate-600 border-[#1E3A5F]'"
            >
              {{ ff.streaming ? 'Live' : 'Offline' }}
            </Badge>
          </TableCell>

          <TableCell class="py-2">
            <Badge
              class="text-xs border bg-transparent text-slate-400 border-[#1E3A5F]"
            >
              {{ ff.role }}
            </Badge>
          </TableCell>


          <TableCell class="py-2 text-right">
            <div class="flex justify-end gap-2" @click.stop>
              <Button
                size="sm"
                class="text-xs bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
                @click="router.push(`/firefighters/${ff.userId}/edit`)"
              >
                Edit
              </Button>
              <Button
                v-if="auth.user.role === 'Admin' && auth.user.userId !== ff.userId"
                size="sm"
                class="text-xs bg-red-950 hover:bg-red-900 text-red-400 border border-red-900 transition-colors"
                @click="deleteUser(ff)"
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