<script setup>
import { ref, onMounted,onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'

const router = useRouter()
const title = ref('')
const location = ref('')
const incidentType = ref('')
const commanderId = ref('')
const latitude = ref('')
const longitude = ref('')
const commanders = ref([])
const activeMissions = ref([])
 
const mapContainer = ref(null)
const mapError = ref('')
const geocoding = ref(false)
 
let leafletMap = null
let newMissionMarker = null
let existingMarkers = []

// distância mínima (em metros) a uma missão já ativa
const MIN_DISTANCE_METERS = 500
 
const makeExistingIcon = (L) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:22px;height:22px;border-radius:50%;
      background:#7F1D1D;border:2px solid #DC2626;
      display:flex;align-items:center;justify-content:center;
      font-size:10px;box-shadow:0 0 4px rgba(220,38,38,0.6);
    ">🔥</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
 
const makeNewIcon = (L) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#166534;border:2px solid #4ADE80;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;box-shadow:0 0 10px rgba(74,222,128,0.7);
      cursor:grab;
    ">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })
 
const reverseGeocode = async (lat, lng) => {
  geocoding.value = true
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
    )
    const data = await res.json()
    const addr = data.address || {}
    const place =
      addr.city || addr.town || addr.village || addr.municipality || addr.county
    console.log('Reverse geocode result:', data)
    return place || data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch (e) {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } finally {
    geocoding.value = false
  }
}
 
const distanceToClosestMission = (L, lat, lng) => {
  if (!activeMissions.value.length) return Infinity
  const point = L.latLng(lat, lng)
  return Math.min(
    ...activeMissions.value.map((m) =>
      point.distanceTo(L.latLng(m.latitude, m.longitude))
    )
  )
}
 
const placeNewMarker = (L, lat, lng) => {
  if (newMissionMarker) {
    newMissionMarker.setLatLng([lat, lng])
    return
  }
  newMissionMarker = L.marker([lat, lng], {
    icon: makeNewIcon(L),
    draggable: true,
  }).addTo(leafletMap)
 
  newMissionMarker.on('dragend', () => {
    const pos = newMissionMarker.getLatLng()
    handleLocationPick(window.L, pos.lat, pos.lng)
  })
}
 
const handleLocationPick = async (L, lat, lng) => {
  const dist = distanceToClosestMission(L, lat, lng)
 
  if (dist < MIN_DISTANCE_METERS) {
    mapError.value = `There is already a mission close to this marker (~${Math.round(dist)}m).`
    // se já havia um marcador válido, devolve-o à última posição válida
    if (newMissionMarker && latitude.value && longitude.value) {
      newMissionMarker.setLatLng([latitude.value, longitude.value])
    } else if (newMissionMarker) {
      newMissionMarker.remove()
      newMissionMarker = null
    }
    return
  }
 
  mapError.value = ''
  latitude.value = lat.toFixed(6)
  longitude.value = lng.toFixed(6)
  placeNewMarker(L, lat, lng)
  location.value = await reverseGeocode(lat, lng)
}
 
const onMapClick = (e) => {
  handleLocationPick(window.L, e.latlng.lat, e.latlng.lng)
}
 
const addExistingMarkers = (L) => {
  activeMissions.value.forEach((m) => {
    const marker = L.marker([m.latitude, m.longitude], {
      icon: makeExistingIcon(L),
    }).addTo(leafletMap)
    marker.bindTooltip(m.title, { direction: 'top', offset: [0, -10] })
    existingMarkers.push(marker)
  })
}



onMounted(async () => {
    commanders.value = await api.get('/api/User/commanders')
  activeMissions.value = await api.get('/api/Mission/status/Active')
 
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)
 
  const style = document.createElement('style')
  style.textContent = `
    .leaflet-tile {
      filter: invert(1) hue-rotate(180deg) saturate(0.35) brightness(0.75) !important;
    }
    .leaflet-container { background: #0D1526 !important; cursor: crosshair !important; }
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
    .leaflet-tooltip {
      background: #162035 !important;
      color: #E2E8F0 !important;
      border: 1px solid #1E3A5F !important;
      font-size: 11px !important;
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
 
    addExistingMarkers(L)
    leafletMap.on('click', onMapClick)
  }
  document.head.appendChild(script)

})

const submit = async () => {
    if (mapError.value) return

    if (!latitude.value || !longitude.value) {
      mapError.value = 'Selecione uma localização no mapa.'
      return
    }

  await api.post('/api/Mission', {
    title: title.value,
    location: location.value,
    incidentType: incidentType.value,
    commanderId: commanderId.value,
    latitude: parseFloat(latitude.value),
    longitude: parseFloat(longitude.value),
  })
  router.push('/missions')
}

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
  existingMarkers = []
  newMissionMarker = null
})

</script>

<template>
  <div class="flex h-[calc(100vh-56px)] bg-[#0D1526]">
 
    <!--Form -->
    <div class="w-1/2 h-full overflow-y-auto p-6 flex flex-col items-center gap-6">
 
      <div class="flex items-center justify-between w-full max-w-lg">
        <h1 class="text-lg font-semibold text-white">New Mission</h1>
        <Button
          class="h-9 text-sm bg-blue-700 hover:bg-blue-600 text-white transition-colors"
          @click="submit"
        >
          Create Mission
        </Button>
      </div>
 
      <div class="border border-[#1E3A5F] rounded-lg overflow-hidden w-full max-w-lg">
        <div class="flex flex-col divide-y divide-[#1E3A5F]">
 
          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">Title</label>
            <Input v-model="title" placeholder="Title"
              class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
          </div>
 
          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">
              Location {{ geocoding ? '(a localizar...)' : '' }}
            </label>
            <Input v-model="location" placeholder="Selecione no mapa ou escreva"
              class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus:border-blue-600" />
          </div>
 
          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">Latitude</label>
            <Input v-model="latitude" placeholder="Selecione no mapa" type="number" step="any" readonly
              class="bg-[#162035] border-[#1E3A5F] text-slate-500 placeholder:text-slate-600" />
          </div>
 
          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">Longitude</label>
            <Input v-model="longitude" placeholder="Selecione no mapa" type="number" step="any" readonly
              class="bg-[#162035] border-[#1E3A5F] text-slate-500 placeholder:text-slate-600" />
          </div>
 
          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">Incident Type</label>
            <select v-model="incidentType"
              class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors">
              <option value="" disabled>Select type</option>
              <option value="Wildfire">Wildfire</option>
              <option value="Structure Fire">Structure Fire</option>
              <option value="Solo">Solo</option>
              <option value="Rescue">Rescue</option>
              <option value="Hazmat">Hazmat</option>
              <option value="Other">Other</option>
            </select>
          </div>
 
          <div class="flex flex-col gap-1.5 px-4 py-3">
            <label class="text-xs text-slate-500 uppercase tracking-wider">Commander</label>
            <select v-model="commanderId"
              class="bg-[#162035] border border-[#1E3A5F] text-slate-300 text-sm rounded px-3 py-2 outline-none focus:border-blue-600 transition-colors">
              <option value="" disabled>Select commander</option>
              <option v-for="c in commanders" :key="c.userId" :value="c.userId">{{ c.name }}</option>
            </select>
          </div>
 
        </div>
      </div>
 
      <p v-if="mapError" class="text-sm text-red-400 w-full max-w-lg -mt-2">
        {{ mapError }}
      </p>
    </div>
 
    <!-- Map -->
    <div class="relative w-1/2 h-full border-l border-[#1E3A5F]">
      <div ref="mapContainer" class="w-full h-full" />
      <div class="absolute top-3 left-3 bg-[#0D1526]/80 border border-[#1E3A5F] rounded px-3 py-1.5 text-xs text-slate-400">
        Click on map to select location
      </div>
    </div>
 
  </div>
</template>
