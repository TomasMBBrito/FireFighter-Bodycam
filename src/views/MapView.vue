<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

// -------------------------------------------------------
// Map helpers
// -------------------------------------------------------
const makeFireIcon = (L, selected = false) =>
  L.divIcon({
    className: '',
    html: `
      <svg
        width="${selected ? 44 : 32}"
        height="${selected ? 44 : 32}"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style="
          transition: all 0.2s ease;
          filter: ${selected
        ? 'drop-shadow(0 0 8px rgba(220,38,38,0.9))'
        : 'none'};
          cursor: pointer;
        "
      >
        <path
          fill="#dc2626"
          d="M12 2C12 2 7 7 7 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-4-3-6.5-4-10 0 0-1 2-3 4-1-2-1-4-1-4z"
        />
      </svg>
    `,
    iconSize: [selected ? 44 : 32, selected ? 44 : 32],
    iconAnchor: [selected ? 22 : 16, selected ? 22 : 16],
  })

const makeUserIcon = (L, selected = false) =>
  L.divIcon({
    className: '',
    html: `
      <svg
        width="${selected ? 44 : 32}"
        height="${selected ? 44 : 32}"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style="
          transition: all 0.2s ease;
          filter: ${selected
        ? 'drop-shadow(0 0 8px rgba(59,130,246,0.9))'
        : 'none'};
          cursor: pointer;
        "
      >
        <circle cx="12" cy="8" r="4" fill="#3b82f6"/>
        <path
          fill="#3b82f6"
          d="M12 14c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"
        />
      </svg>
    `,
    iconSize: [selected ? 44 : 32, selected ? 44 : 32],
    iconAnchor: [selected ? 22 : 16, selected ? 22 : 16],
  })

const getMissionIcon = (L, mission, selected = false) => {
  return mission.incidentType === 'Solo'
    ? makeUserIcon(L, selected)
    : makeFireIcon(L, selected)
}

const selectMission = async (mission) => {
  const prev = selectedMission.value

  if (prev && markersMap[prev.missionId]) {
    markersMap[prev.missionId].setIcon(getMissionIcon(window.L, prev, false))
  }

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
    markersMap[mission.missionId].setIcon(makeFireIcon(window.L, true))
    leafletMap.flyTo([mission.latitude, mission.longitude], 12, { duration: 0.8 })
  }
}

const loadFirefighters = async () => {
  if (!selectedMission.value) return
  showFirefighters.value = true
  const res = await fetch(`${API_BASE_URL}/api/Mission/${selectedMission.value.missionId}/firefighters`)
  firefighters.value = await res.json()
  console.log('Loaded firefighters:', firefighters.value)
}

const toggleFirefighter = (ff) => {
  const idx = selectedFirefighters.value.findIndex(f => f.firefighterId === ff.firefighterId)
  if (idx === -1) selectedFirefighters.value.push(ff)
  else selectedFirefighters.value.splice(idx, 1)
}

//Ver cameras relacionadas a missao

const watchMissionCameras = () => {
  monitorStore.selectMission(selectedMission.value)
  router.push({
    path: `/missions/cameras`,
  })
}

//Ver cameras relacionadas a bombeiros selecionados

const watchFirefighterCameras = () => {
  console.log('Selected firefighters:', selectedFirefighters.value)
  monitorStore.selectFirefighters(selectedFirefighters.value, selectedMission.value)
  router.push({
    path: `/missions/cameras`,
  })
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

// -------------------------------------------------------
// Lifecycle
// -------------------------------------------------------
onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/Mission`)
    missions.value = await res.json()
  } catch (e) {
    console.error('Failed to fetch missions:', e)
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)

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
      attribution: '© OpenStreetMap contributors',
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
  <div class="flex h-[calc(100vh-56px)]">

    <!-- LEFT — Map -->
    <div ref="mapContainer" class="w-1/2 h-full" />

    <!-- RIGHT — Panel -->
    <div class="w-1/2 h-full flex flex-col border-l bg-background overflow-y-auto">

      <!-- No mission selected -->
      <div v-if="!selectedMission" class="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <span class="text-4xl">🔥</span>
        <p class="text-sm">Click a mission on the map</p>
      </div>

      <!-- Mission selected -->
      <div v-else class="flex flex-col h-full">

        <!-- Mission header -->
        <div class="p-4 border-b">
          <h2 class="font-semibold text-lg">{{ selectedMission.title }}</h2>
          <p class="text-sm text-muted-foreground">{{ selectedMission.location }}</p>
          <Badge class="mt-1">{{ selectedMission.incidentType }}</Badge>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2 p-4 border-b">
          <Button :variant="showFirefighters ? 'default' : 'outline'" class="flex-1" @click="loadFirefighters">
            Firefighters
          </Button>
          <Button variant="outline" class="flex-1" :disabled="showFirefighters" @click="watchMissionCameras">
            Cameras
          </Button>
        </div>

        <!-- Firefighters table -->
        <div v-if="showFirefighters" class="flex flex-col flex-1 p-4 gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-10">Watch</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Stream</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="ff in firefighters" :key="ff.firefighterId">
                <TableCell>
                  <Checkbox :disabled="!ff.streaming"
                    :checked="selectedFirefighters.some(f => f.firefighterId === ff.firefighterId)"
                    @click="() => !ff.streaming ? null : toggleFirefighter(ff)" />
                </TableCell>
                <TableCell>{{ ff.name }}</TableCell>
                <TableCell>{{ ff.roleInMission }}</TableCell>
                <TableCell>
                  <Badge :variant="ff.streaming ? 'default' : 'secondary'">
                    {{ ff.streaming ? 'Live' : 'Offline' }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Button class="w-full mt-auto" :disabled="selectedFirefighters.length === 0" @click="watchFirefighterCameras">
            Watch Selected Cameras ({{ selectedFirefighters.length }})
          </Button>
        </div>

      </div>
    </div>
  </div>
</template>