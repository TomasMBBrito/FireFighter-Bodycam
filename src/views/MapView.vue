<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMonitorStore } from '@/stores/monitor'
import { API_BASE_URL } from '@/config/env'
import { api } from '@/lib/api'

const router = useRouter()
const monitorStore = useMonitorStore()

let leafletMap = null
let markersMap = {}

const mapContainer = ref(null)
const selectedMission = ref(null)
const missions = ref([])
const firefighters = ref([])
const selectedFirefighters = ref([])
const showFirefighters = ref(false)

const makeFireIcon = (L, selected = false) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:${selected ? 28 : 22}px;
      height:${selected ? 28 : 22}px;
      border-radius:50%;
      background:${selected ? '#DC2626' : '#7F1D1D'};
      border:2px solid ${selected ? '#F87171' : '#DC2626'};
      display:flex;align-items:center;justify-content:center;
      font-size:${selected ? '13px' : '10px'};
      box-shadow:0 0 ${selected ? '10px' : '4px'} rgba(220,38,38,0.6);
      cursor:pointer;
    ">🔥</div>`,
    iconSize: [selected ? 28 : 22, selected ? 28 : 22],
    iconAnchor: [selected ? 14 : 11, selected ? 14 : 11],
  })

const makeUserIcon = (L, selected = false) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:${selected ? 28 : 22}px;
      height:${selected ? 28 : 22}px;
      border-radius:50%;
      background:${selected ? '#1D4ED8' : '#1E3A5F'};
      border:2px solid ${selected ? '#60A5FA' : '#3B82F6'};
      display:flex;align-items:center;justify-content:center;
      font-size:${selected ? '13px' : '10px'};
      box-shadow:0 0 ${selected ? '10px' : '4px'} rgba(59,130,246,0.6);
      cursor:pointer;
    ">🧑‍🚒</div>`,
    iconSize: [selected ? 28 : 22, selected ? 28 : 22],
    iconAnchor: [selected ? 14 : 11, selected ? 14 : 11],
  })

const getMissionIcon = (L, mission, selected = false) =>
  mission.incidentType === 'Solo' ? makeUserIcon(L, selected) : makeFireIcon(L, selected)

const selectMission = async (mission) => {
  const prev = selectedMission.value
  if (prev && markersMap[prev.missionId])
    markersMap[prev.missionId].setIcon(getMissionIcon(window.L, prev, false))

  if (prev?.missionId === mission.missionId) {
    selectedMission.value = null
    firefighters.value = []
    showFirefighters.value = false
    return
  }

  selectedMission.value = mission
  firefighters.value = []
  showFirefighters.value = false
  selectedFirefighters.value = []

  if (markersMap[mission.missionId]) {
    markersMap[mission.missionId].setIcon(getMissionIcon(window.L, mission, true))
    leafletMap.flyTo([mission.latitude, mission.longitude], 12, { duration: 0.8 })
  }
}

const loadFirefighters = async () => {
  if (!selectedMission.value) return
  showFirefighters.value = true
  firefighters.value = await api.get(`/api/Mission/${selectedMission.value.missionId}/firefighters`)
}

const firefightersByStation = computed(() => {
  const groups = {}
  firefighters.value.forEach(ff => {
    const station = ff.station ?? 'Unknown'
    if (!groups[station]) groups[station] = []
    groups[station].push(ff)
  })
  return groups
})

const toggleFirefighter = (ff) => {
  const idx = selectedFirefighters.value.findIndex(f => f.firefighterId === ff.firefighterId)
  if (idx === -1) selectedFirefighters.value.push(ff)
  else selectedFirefighters.value.splice(idx, 1)
}

const watchMissionCameras = () => {
  monitorStore.selectMission(selectedMission.value)
  router.push({ path: `/missions/cameras` })
}

const watchFirefighterCameras = () => {
  monitorStore.selectFirefighters(selectedFirefighters.value, selectedMission.value)
  router.push({ path: `/missions/cameras` })
}

const addMarkers = (L) => {
  missions.value.forEach((mission) => {
    const marker = L.marker([mission.latitude, mission.longitude], {
      icon: getMissionIcon(L, mission, false),
    }).addTo(leafletMap)
    marker.on('click', () => selectMission(mission))
    markersMap[mission.missionId] = marker
  })
}

onMounted(async () => {
  missions.value = await api.get('/api/Mission/status/Active')

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)

  const style = document.createElement('style')
  style.textContent = `
    .leaflet-tile {
      filter: invert(1) hue-rotate(180deg) saturate(0.35) brightness(0.75) !important;
    }
    .leaflet-container { background: #0D1526 !important; }
    .leaflet-control-zoom a {
      background: #0D1526 !important;
      color: #60A5FA !important;
      border-color: #1E3A5F !important;
    }
    .leaflet-control-zoom a:hover { background: #1E3A5F !important; }
    .leaflet-control-attribution {
      background: rgba(13,21,38,0.8) !important;
      color: #334155 !important;
      font-size: 10px !important;
    }
  `
  document.head.appendChild(style)

  const script = document.createElement('script')
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  script.onload = () => {
    const L = window.L
    leafletMap = L.map(mapContainer.value, {
      center: [39.5, -8.0],
      zoom: 7,
      zoomControl: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(leafletMap)
    L.control.zoom({ position: 'bottomleft' }).addTo(leafletMap)
    addMarkers(L)
  }
  document.head.appendChild(script)
})

onUnmounted(() => {
  if (leafletMap) { leafletMap.remove(); leafletMap = null }
  markersMap = {}
})
</script>

<template>
  <div class="flex h-[calc(100vh-56px)] bg-[#0D1526]">

    <!-- LEFT — Map -->
    <div class="relative w-1/2 h-full">
      <div ref="mapContainer" class="w-full h-full" />
    </div>

    <!-- RIGHT — Panel -->
    <div class="w-1/2 h-full flex flex-col border-l border-[#1E3A5F] bg-[#0D1526] overflow-y-auto">

      <!-- Empty state -->
      <div v-if="!selectedMission" class="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <span class="text-4xl">🔥</span>
        <p class="text-sm text-slate-500">Select a mission on the map</p>
      </div>

      <!-- Mission selected -->
      <div v-else class="flex flex-col h-full">

        <!-- Header -->
        <div class="p-4 border-b border-[#1E3A5F]">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h2 class="font-semibold text-white">{{ selectedMission.title }}</h2>
              <p class="text-sm text-slate-400 mt-0.5">{{ selectedMission.location }}</p>
            </div>
            <Badge
              class="shrink-0 text-xs font-medium border"
              :class="selectedMission.incidentType === 'Solo'
                ? 'bg-blue-950 text-blue-300 border-blue-800'
                : 'bg-red-950 text-red-300 border-red-900'"
            >
              {{ selectedMission.incidentType }}
            </Badge>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2 p-3 border-b border-[#1E3A5F]">
          <Button
            class="flex-1 h-9 text-sm transition-colors"
            :class="showFirefighters
              ? 'bg-blue-700 hover:bg-blue-600 text-white'
              : 'bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F]'"
            @click="loadFirefighters"
          >
            Firefighters
          </Button>
          <Button
            class="flex-1 h-9 text-sm bg-[#162035] hover:bg-[#1E3A5F] text-slate-300 border border-[#1E3A5F] transition-colors"
            :disabled="showFirefighters"
            @click="watchMissionCameras"
          >
            Cameras
          </Button>
        </div>

        <!-- Firefighters -->
        <div v-if="showFirefighters" class="flex flex-col flex-1 p-3 gap-4 overflow-y-auto">
          <div v-for="(ffs, station) in firefightersByStation" :key="station" class="flex flex-col gap-2">

            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">{{ station }}</p>

            <Table>
              <TableHeader>
                <TableRow class="border-[#1E3A5F] hover:bg-transparent">
                  <TableHead class="text-slate-500 text-xs w-10">Watch</TableHead>
                  <TableHead class="text-slate-500 text-xs">Name</TableHead>
                  <TableHead class="text-slate-500 text-xs">Role</TableHead>
                  <TableHead class="text-slate-500 text-xs">Stream</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="ff in ffs"
                  :key="ff.firefighterId"
                  class="border-[#1E3A5F] hover:bg-[#162035] transition-colors"
                >
                  <TableCell class="py-2">
                    <Checkbox
                      :disabled="!ff.streaming"
                      :checked="selectedFirefighters.some(f => f.firefighterId === ff.firefighterId)"
                      @click="() => !ff.streaming ? null : toggleFirefighter(ff)"
                    />
                  </TableCell>
                  <TableCell class="py-2 text-sm text-slate-200">{{ ff.name }}</TableCell>
                  <TableCell class="py-2 text-sm text-slate-400">{{ ff.roleInMission }}</TableCell>
                  <TableCell class="py-2">
                    <Badge
                      class="text-xs border"
                      :class="ff.streaming
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-900'
                        : 'bg-transparent text-slate-600 border-[#1E3A5F]'"
                    >
                      {{ ff.streaming ? 'Live' : 'Offline' }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <Button
            class="w-full mt-auto h-10 text-sm transition-colors"
            :class="selectedFirefighters.length > 0
              ? 'bg-red-700 hover:bg-red-600 text-white'
              : 'bg-[#162035] text-slate-600 border border-[#1E3A5F] cursor-not-allowed'"
            :disabled="selectedFirefighters.length === 0"
            @click="watchFirefighterCameras"
          >
            Watch cameras selected ({{ selectedFirefighters.length }})
          </Button>
        </div>

      </div>
    </div>
  </div>
</template>