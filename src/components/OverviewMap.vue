<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useTelemetryStore } from '@/stores/telemetry'

const props = defineProps({
    firefighters: { type: Array, default: () => [] },
    selectedId: { type: [String, Number, null], default: null },
    missionCenter: { type: Object, default: null }
})

const emit = defineEmits(['select'])

const telemetryStore = useTelemetryStore()

const mapContainer = ref(null)
const leafletReady = ref(!!window.L)

let leafletMap = null
const markers = {}     // firefighterId -> L.Marker

// Distinct color palette, cycled by a stable hash of the firefighter id
// so each firefighter always gets the same color regardless of list order.
const COLOR_PALETTE = [
    '#ef4444', '#3b82f6', '#22c55e', '#eab308',
    '#a855f7', '#ec4899', '#06b6d4', '#f97316',
    '#84cc16', '#6366f1', '#14b8a6', '#f43f5e'
]

function colorForId(id) {
    const str = String(id)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0
    }
    return COLOR_PALETTE[hash % COLOR_PALETTE.length]
}

function getColoredArrowIcon(bearing, color, isSelected) {
    const L = window.L
    const angle = Number(bearing) || 0
    const strokeAttrs = isSelected
        ? 'stroke="#ffffff" stroke-width="3.5"'
        : 'stroke="white" stroke-width="1.5"'
    const glow = isSelected
        ? `<circle cx="20" cy="20" r="18" fill="none" stroke="${color}" stroke-width="2" opacity="0.6" />`
        : ''
    return L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="display:block;">
                ${glow}
                <g transform="rotate(${angle}, 20, 20)">
                    <polygon points="20,4 30,34 20,28 10,34" fill="${color}" ${strokeAttrs} />
                </g>
            </svg>
        `
    })
}

function getTelemetryFor(ff) {
    return telemetryStore.getTelemetry(ff.firefighterId)
}

function ensureMarker(ff) {
    const L = window.L
    if (!leafletMap || markers[ff.firefighterId]) return

    const t = getTelemetryFor(ff)
    if (!t || t.GpsLat == null || t.GpsLng == null) return

    const color = colorForId(ff.firefighterId)
    const latlng = [t.GpsLat, t.GpsLng]

    const marker = L.marker(latlng, {
        icon: getColoredArrowIcon(t.CompassBearing, color, props.selectedId === ff.firefighterId)
    }).addTo(leafletMap)

    marker.bindTooltip(ff.name, { direction: 'top', offset: [0, -20] })
    marker.on('click', () => emit('select', ff.firefighterId))

    markers[ff.firefighterId] = marker
}

function updateMarker(ff) {
    const t = getTelemetryFor(ff)
    if (!t || t.GpsLat == null || t.GpsLng == null) return

    if (!markers[ff.firefighterId]) {
        ensureMarker(ff)
        return
    }

    const marker = markers[ff.firefighterId]
    const color = colorForId(ff.firefighterId)
    const latlng = [t.GpsLat, t.GpsLng]

    marker.setLatLng(latlng)
    marker.setIcon(getColoredArrowIcon(t.CompassBearing, color, props.selectedId === ff.firefighterId))
}

function removeMarker(id) {
    if (markers[id]) {
        leafletMap.removeLayer(markers[id])
        delete markers[id]
    }
}

function fitToMarkers() {
    const L = window.L
    const points = Object.values(markers).map(m => m.getLatLng())
    if (!leafletMap) return

    if (points.length === 0) {
        if (props.missionCenter) {
            leafletMap.setView([props.missionCenter.lat, props.missionCenter.lng], 15)
        }
        return
    }

    if (points.length === 1) {
        leafletMap.setView(points[0], 16)
    } else {
        leafletMap.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
    }
}

async function createMap() {
    if (!window.L || !mapContainer.value || leafletMap) return

    const L = window.L

    const initialCenter = props.missionCenter
        ? [props.missionCenter.lat, props.missionCenter.lng]
        : [39.6, -8.5]

    leafletMap = L.map(mapContainer.value, {
        zoomControl: true,
        attributionControl: false
    }).setView(initialCenter, props.missionCenter ? 15 : 8)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(leafletMap)

    leafletMap.invalidateSize()

    props.firefighters.forEach(ensureMarker)
    fitToMarkers()
}

// React to GPS/bearing changes for any tracked firefighter
watch(
    () => props.firefighters.map(ff => {
        const t = getTelemetryFor(ff)
        return [ff.firefighterId, t?.GpsLat, t?.GpsLng, t?.CompassBearing]
    }),
    () => {
        props.firefighters.forEach(ff => updateMarker(ff))
    },
    { deep: true }
)

// React to firefighters being added/removed from the monitored list
watch(
    () => props.firefighters.map(ff => ff.firefighterId),
    (newIds, oldIds = []) => {
        oldIds.filter(id => !newIds.includes(id)).forEach(removeMarker)
        props.firefighters.forEach(ensureMarker)
    }
)

// Re-style the selected marker (highlight ring) when selection changes
watch(
    () => props.selectedId,
    () => {
        props.firefighters.forEach(ff => {
            const marker = markers[ff.firefighterId]
            const t = getTelemetryFor(ff)
            if (marker && t) {
                marker.setIcon(
                    getColoredArrowIcon(t.CompassBearing, colorForId(ff.firefighterId), props.selectedId === ff.firefighterId)
                )
            }
        })
    }
)

onMounted(() => {
    if (window.L) {
        leafletReady.value = true
        nextTick(() => createMap())
    } else {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
            leafletReady.value = true
            nextTick(() => createMap())
        }
        document.head.appendChild(script)
    }
})

onUnmounted(() => {
    if (leafletMap) {
        leafletMap.remove()
        leafletMap = null
    }
})
</script>

<template>
    <div class="w-full h-80 md:h-96 rounded-lg overflow-hidden border border-[#1E3A5F] bg-white">
        <div ref="mapContainer" class="w-full h-full" />
    </div>
</template>