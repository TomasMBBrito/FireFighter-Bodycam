<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { MEDIAPLAYBACK_SERVER_URL } from '@/config/env'

const footage = ref([])
const selectedVideo = ref(null)
const route = useRoute()
const loading = ref(true)

const missionId = route.params.missionId
const firefighterId = route.params.firefighterId

onMounted(async () => {
  try {
    const path = `${firefighterId}/${missionId}`
    const res = await fetch(`${MEDIAPLAYBACK_SERVER_URL}/list?path=${path}`)
    const data = await res.json()
    footage.value = data
      .map(item => ({
        ...item,
        playbackUrl: item.url.replace('localhost', MEDIAPLAYBACK_SERVER_URL)
      }))
      .sort((a, b) => new Date(b.start) - new Date(a.start))
    if (footage.value.length > 0) selectedVideo.value = footage.value[0]
  } catch (e) {
    console.error('Failed to fetch footage:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6 h-[calc(100vh-56px)] overflow-hidden">
    <div class="grid grid-cols-12 gap-4 h-full">

      <!-- LEFT — footage list -->
      <div class="col-span-4 h-full flex flex-col border border-[#1E3A5F] rounded-lg overflow-hidden">

        <div class="px-4 py-3 border-b border-[#1E3A5F]">
          <h2 class="text-sm font-semibold text-white">Mission Footage</h2>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="p-4 text-slate-500 text-sm">Loading...</div>
          <div v-else-if="footage.length === 0" class="p-4 text-slate-500 text-sm">No footage found.</div>

          <Table v-else>
            <TableHeader>
              <TableRow class="border-[#1E3A5F] hover:bg-transparent">
                <TableHead class="text-slate-500 text-xs">Recorded At</TableHead>
                <TableHead class="text-slate-500 text-xs">Duration</TableHead>
                <TableHead class="text-slate-500 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="item in footage"
                :key="item.start"
                class="border-[#1E3A5F] hover:bg-[#162035] transition-colors"
                :class="selectedVideo?.start === item.start ? 'bg-[#162035]' : ''"
              >
                <TableCell class="py-2 text-sm text-slate-200">
                  {{ new Date(item.start).toLocaleString('pt-PT', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                  }) }}
                </TableCell>
                <TableCell class="py-2 text-sm text-slate-400">
                  {{ Math.floor(item.duration) }}s
                </TableCell>
                <TableCell class="py-2 text-right">
                  <Button
                    size="sm"
                    class="text-xs transition-colors"
                    :class="selectedVideo?.start === item.start
                      ? 'bg-blue-700 hover:bg-blue-600 text-white border-0'
                      : 'bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F]'"
                    @click="selectedVideo = item"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <!-- RIGHT — playback -->
      <div class="col-span-8 h-full flex flex-col border border-[#1E3A5F] rounded-lg overflow-hidden">

        <div class="px-4 py-3 border-b border-[#1E3A5F] flex items-center justify-between">
          <h2 class="text-sm font-semibold text-white">Playback</h2>
          <span v-if="selectedVideo" class="text-xs text-slate-500">
            {{ new Date(selectedVideo.start).toLocaleString('pt-PT', {
              year: 'numeric', month: '2-digit', day: '2-digit',
              hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            }) }}
          </span>
        </div>

        <div class="flex-1 overflow-hidden p-4">
          <div v-if="selectedVideo" class="h-full flex items-center">
            <video
              :key="selectedVideo.playbackUrl"
              controls
              autoplay
              class="w-full rounded-lg border border-[#1E3A5F] bg-black max-h-full"
            >
              <source :src="selectedVideo.playbackUrl" type="video/mp4" />
            </video>
          </div>
          <div v-else class="h-full flex items-center justify-center text-slate-500 text-sm">
            Select a recording to play
          </div>
        </div>

      </div>

    </div>
  </div>
</template>