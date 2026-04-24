<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router'

  let leafletMap = null
  let markersMap = {}

  const router = useRouter()

  const selectedMission = ref(null)
  const mapContainer = ref(null)
  const missions = ref([
    {
    id: 1,
    name: 'Lisboa Norte · Forest Fire',
    region: 'Lisboa',
    lat: 38.807,
    lng: -9.396,
  },
  {
    id: 2,
    name: 'Porto Sul · Industrial Fire',
    region: 'Porto',
    lat: 41.133,
    lng: -8.612,
  },
  {
    id: 3,
    name: 'Faro · Brushfire',
    region: 'Faro',
    lat: 37.286,
    lng: -7.935,
  },
  ]);

  const makeFireIcon = (L, selected = false) => {
  return L.divIcon({
    className: '',
    html: `<div style="
      font-size: ${selected ? '36px' : '24px'};
      transition: all 0.2s ease;
      filter: ${selected ? 'drop-shadow(0 0 8px rgba(220,38,38,0.9))' : 'none'};
      transform: ${selected ? 'scale(1.3)' : 'scale(1)'};
      cursor: pointer;
    ">🔥</div>`,
    iconSize: [selected ? 44 : 32, selected ? 44 : 32],
    iconAnchor: [selected ? 22 : 16, selected ? 22 : 16],
  })
}

const selectMission = (mission) => {
  const prev = selectedMission.value

  // deselect previous marker
  if (prev && markersMap[prev.id]) {
    markersMap[prev.id].setIcon(makeFireIcon(window.L, false))
  }

  if (prev?.id === mission.id) {
    selectedMission.value = null
    return
  }

  selectedMission.value = mission

  // highlight new marker and fly to it
  if (markersMap[mission.id]) {
    markersMap[mission.id].setIcon(makeFireIcon(window.L, true))
    leafletMap.flyTo([mission.lat, mission.lng], 10, { duration: 0.8 })
  }
}

onMounted(() => {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)

  // Dynamically load Leaflet JS then init map
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

    // Custom zoom control position
    L.control.zoom({ position: 'bottomleft' }).addTo(leafletMap)

    // Add fire markers for each room
    missions.value.forEach((mission) => {
      const marker = L.marker([mission.lat, mission.lng], {
        icon: makeFireIcon(L, false),
      }).addTo(leafletMap)

      marker.bindPopup(`
        <div style="text-align: center; min-width: 160px;">
          <strong>${mission.name}</strong>
          <br/><br/>
          <button id="btn-cameras-${mission.id}" onmouseover="this.style.background='#0000cc'" 
          onmouseout="this.style.background='#0000ff'" style="
            background: #0000ff; color: white; border: none;
            padding: 6px 12px; border-radius: 6px; cursor: pointer;
            margin-bottom: 6px; width: 100%;
          ">Ver Camaras</button>
          <button id="btn-firefighters-${mission.id}" onmouseover="this.style.background='#006600'" 
          onmouseout="this.style.background='#009933'" style="
            background: #009933; color: white; border: none;
            padding: 6px 12px; border-radius: 6px; cursor: pointer;
            width: 100%;
          ">Ver Bombeiros Associados</button>
        </div>
      `)

      marker.on('popupopen', () => {
        document
          .getElementById(`btn-cameras-${mission.id}`)
          .addEventListener('click', () => {
            router.push(`/missions/${mission.id}/cameras`)
          })

        document
          .getElementById(`btn-firefighters-${mission.id}`)
          .addEventListener('click', () => {
            router.push(`/missions/${mission.id}/firefighters`)
          })
      })

      marker.on('click', () => selectMission(mission))
      markersMap[mission.id] = marker
    })
  }

  document.head.appendChild(script)
})

onUnmounted(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
  markersMap = {}
})


</script>

<template>
  <h1>You did it!</h1>
  <p>
    Olha pro mapa djio, olha pro mapa djiu, olha pro mapa djiu e olha pro mapa djiu
  </p>
  <div ref="mapContainer" class="w-full h-125"></div>

</template>
