<template>
  <div style="padding: 24px;">
    <h2>Bombeiros da Missão #{{ missionId }}</h2>

    <span v-if="count_selected >= 2">
        <button style="background: green; color: white; border: none;
            padding: 6px 12px; border-radius: 6px; cursor: pointer;">
            Ver Camara dos bombeiros selecionados
        </button>
    </span>

    <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 10px; border: 1px solid #e5e7eb;">Selecionar</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb;">ID</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb;">Nome</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb;">Posto</th>
          <th style="padding: 10px; border: 1px solid #e5e7eb;"> Ver Camara</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="firefighter in firefighters" :key="firefighter.id">
          <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">
            <input type="checkbox" v-model="firefighter.selected" />
          </td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">{{ firefighter.id }}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">{{ firefighter.name }}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">{{ firefighter.role }}</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"> 
            <button style="background: #0000ff; color: white; border: none;
            padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                Ver Camara
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div ref="mapContainer" class="w-full h-125"></div>
</template>

<script setup>
import { ref,computed,onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { missions as MissionData } from '@/harddata/missions'

let leafletMap = null

const mapContainer = ref(null)

const route = useRoute()
const missionId = route.params.id

const missions = ref(MissionData)
const mission = computed(() => missions.value.find(m => m.id === parseInt(missionId)))

const espalhar = (lat, lng) => ({
  lat: lat + (Math.random() - 0.5) * 0.001,
  lng: lng + (Math.random() - 0.5) * 0.001,
})

const count_selected = computed(() => firefighters.value.filter(f => f.selected).length)

const firefighters = ref([
  { id: 1, name: 'João Silva',    role: 'Comandante',  selected: false },
  { id: 2, name: 'Ana Costa',     role: 'Bombeiro',    selected: false },
  { id: 3, name: 'Carlos Mendes', role: 'Bombeiro',    selected: false },
  { id: 4, name: 'Rui Ferreira',  role: 'Subchefe',    selected: false },
  { id: 5, name: 'Marta Sousa',   role: 'Bombeiro',    selected: false },
])

onMounted(() => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)

   const initMap = () => {
    const L = window.L
        leafletMap = L.map(mapContainer.value, {
            center: [mission.value.lat, mission.value.lng],
            zoom: 7,
            zoomControl: false,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
            }).addTo(leafletMap)

        L.control.zoom({ position: 'bottomleft' }).addTo(leafletMap)


        L.marker([mission.value.lat, mission.value.lng], {
            icon: L.divIcon({
            className: '',
            html: `<div style="font-size: 28px;">🔥</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            })
            }).addTo(leafletMap).bindPopup(`<strong>${mission.value.name}</strong>`)

        firefighters.value.forEach((f) => {
            const pos = espalhar(mission.value.lat, mission.value.lng)
            f.lat = pos.lat
            f.lng = pos.lng

            L.marker([f.lat, f.lng], {
            icon: L.divIcon({
                className: '',
                html: `<div style="font-size: 22px;">🧑‍🚒</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            })
            }).addTo(leafletMap).bindPopup(`<strong>${f.name}</strong><br/>${f.role}`)
        })
    }

    if (window.L) {
        initMap()
    } else {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = initMap
        document.head.appendChild(script)
    }


});

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>