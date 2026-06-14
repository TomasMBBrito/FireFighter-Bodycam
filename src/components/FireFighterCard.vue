<script setup>
import {
    computed,
    onMounted,
    onUnmounted,
    ref,
    nextTick,
    watch
} from 'vue'

import { useTelemetryStore } from '@/stores/telemetry'
import { useSosStore } from '@/stores/sos'
import VideoStream from '@/components/VideoStream.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { API_BASE_URL } from '@/config/env'
import { Input } from '@/components/ui/input'

const props = defineProps({
    firefighter: Object,
    streamPath: String
})

const telemetryStore = useTelemetryStore()
const sosStore = useSosStore()

const t = computed(() =>
    telemetryStore.getTelemetry(
        props.firefighter.firefighterId
    )
)

const snapshot = computed(() =>
    telemetryStore.getSnapshot(props.firefighter.firefighterId)
)

const snapshotUrl = computed(() => {
    if (!snapshot.value?.SnapshotUrl) return null
    return `${API_BASE_URL}${snapshot.value.SnapshotUrl}?t=${snapshot.value.Timestamp}`
})

const customTTS = ref('')

let pathLine = null
const pathPoints = []

const mapContainer = ref(null)
const leafletReady = ref(!!window.L)

let leafletMap = null
let leafletMarker = null

const sosActive = ref(false)
let sosTimeout = null

const ttsButtons = computed(() => [
    {
        label: 'Evacuate',
        message: 'Evacua o edifício já!'
    },
    {
        label: '1 min',
        message: 'Tens 1 minutos para saíres daí.'
    },
    {
        label: '5 min',
        message: 'Tens 5 minutos para continuares a procura.'
    },
    {
        label: 'Report Now',
        message: `${props.firefighter.name} reporta o teu estado já.`
    }
])

const sendCustomTTS = () => {
    if (!customTTS.value.trim()) return
    sendTTS(customTTS.value.trim())
    customTTS.value = ''
}

const sendTTS = async (text) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/TextToSpeech`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firefighterId: props.firefighter.firefighterId,
                text
            })
        })
        const data = JSON.stringify({
            firefighterId: props.firefighter.firefighterId,
            text
        })
        console.log('TTS message sent:', data)
        console.log('TTS response:', res.status, await res.text())
    } catch (error) {
        console.error('Failed to send TTS message:', error)
    }
}

async function createMap() {
    if (
        !window.L ||
        !mapContainer.value ||
        !t.value ||
        t.value.GpsLat == null ||
        t.value.GpsLng == null
    ) {
        return
    }

    const L = window.L

    leafletMap = L.map(mapContainer.value, {
        zoomControl: false,
        attributionControl: false
    })

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
    ).addTo(leafletMap)

    const latlng = [t.value.GpsLat, t.value.GpsLng]

    leafletMap.setView(latlng, 18)

    leafletMarker = L.marker(latlng, {
        icon: getArrowIcon(t.value.CompassBearing)
    }).addTo(leafletMap)

    pathPoints.push(latlng)

    pathLine = L.polyline(pathPoints, { weight: 4 }).addTo(leafletMap)

    leafletMap.invalidateSize()
}

function getArrowIcon(bearing) {
    const L = window.L
    const angle = Number(bearing)
    return L.divIcon({
        className: '',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        html: `
            <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
                style="display:block;"
            >
                <g transform="rotate(${angle}, 20, 20)">
                    <polygon
                        points="20,4 30,34 20,28 10,34"
                        fill="red"
                        stroke="white"
                        stroke-width="1.5"
                    />
                </g>
            </svg>
        `
    })
}

watch(
    () => t.value?.CompassBearing,
    (bearing) => {
        if (!leafletMarker) return
        leafletMarker.setIcon(getArrowIcon(bearing))
    }
)

watch(
    () => [t.value?.GpsLat, t.value?.GpsLng],
    ([lat, lng]) => {
        if (!leafletMarker || lat == null || lng == null) return

        const position = [lat, lng]
        leafletMarker.setLatLng(position)
        leafletMap?.panTo(position, { animate: true, duration: 0.5 })
        pathPoints.push(position)
        if (pathLine) pathLine.setLatLngs(pathPoints)
    }
)

watch(
    () => [t.value?.GpsLat, t.value?.GpsLng],
    async ([lat, lng]) => {
        if (leafletMap || lat == null || lng == null || !leafletReady.value) return
        await nextTick()
        createMap()
    }
)

watch(() => sosStore.get_sos(props.firefighter.firefighterId), (val) => {
    if (!val) return
    sosActive.value = true
    clearTimeout(sosTimeout)
    sosTimeout = setTimeout(() => { sosActive.value = false }, 10000)
})

onMounted(() => {
    telemetryStore.connect(props.firefighter.firefighterId)

    if (window.L) {
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

function destroyMap() {
    if (leafletMap) {
        leafletMap.remove()
        leafletMap = null
    }
    leafletMarker = null
    pathLine = null
    pathPoints.length = 0
}

onUnmounted(() => {
    telemetryStore.disconnect(props.firefighter.firefighterId)
    destroyMap()
})

const motionLevelLabel = computed(() => {
    const m = t.value?.MotionLevel
    if (m == null) return '—'
    if (m < 0.2) return 'Low'
    if (m < 0.6) return 'Medium'
    return 'High'
})

const bearingLabel = computed(() => {
    const b = t.value?.CompassBearing
    if (b == null) return null
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return dirs[Math.round(b / 45) % 8]
})
</script>

<template>
    <!-- Single root wrapper fixes the multi-root grid alignment bug -->
    <div class="w-full rounded-lg overflow-hidden border border-border">
        <!-- Video -->
        <div class="relative aspect-video bg-black">
            <VideoStream v-if="!snapshotUrl" :stream-path="streamPath" class="w-full h-full object-cover" />
            <img v-else :src="snapshotUrl" :key="snapshot.Timestamp" class="w-full h-full object-cover"
                alt="Snapshot" />

            <div v-if="leafletReady" ref="mapContainer"
                class="absolute bottom-2 right-2 w-52 h-40 rounded-lg overflow-hidden border-2 border-white shadow-xl z-20 bg-white" />

            <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {{ firefighter.name }}
            </div>

            <div v-if="t?.FallDetected" class="absolute top-2 right-2">
                <Badge variant="destructive" class="animate-pulse text-xs">
                    FALL DETECTED
                </Badge>
            </div>

            <div v-if="sosActive"
                class="absolute inset-0 flex items-center justify-center z-10 bg-red-600/80 animate-pulse">
                <Alert variant="destructive" class="w-fit border-2 border-white shadow-2xl bg-red-600 text-white">
                    <AlertTitle class="text-2xl font-black flex items-center gap-2">
                        ALERTA
                    </AlertTitle>
                    <AlertDescription class="text-base text-white">
                        {{ firefighter.name }} asked for help!
                    </AlertDescription>
                </Alert>
            </div>
        </div>

        <!-- Telemetry -->
        <div v-if="t" class="border-t border-border px-3 py-2 flex flex-wrap gap-2 items-center">
            <Badge variant="outline">
                {{ t.ActivityState ?? 'N/A' }}
            </Badge>

            <Badge variant="outline">
                {{ t.IsMoving ? 'Moving' : 'Stationary' }}
            </Badge>

            <Badge variant="outline">
                Motion: {{ motionLevelLabel }}
            </Badge>

            <Badge v-if="bearingLabel" variant="outline">
                ↑ {{ bearingLabel }} ({{ Math.round(t.CompassBearing) }}°)
            </Badge>

            <Badge v-if="t.GpsLat != null && t.GpsLng != null && leafletReady" variant="outline"
                class="font-mono cursor-pointer hover:bg-accent">
                {{ t.GpsLat?.toFixed(5) }}, {{ t.GpsLng?.toFixed(5) }}
            </Badge>
        </div>

        <!-- Text to speech buttons -->
        <div v-if="t" class="border-t border-border px-3 py-2 flex flex-col gap-2">
            <div class="flex flex-wrap gap-2">
                <Button v-for="btn in ttsButtons" :key="btn.message" size="sm" variant="outline"
                    @click="sendTTS(btn.message)">
                    {{ btn.label }}
                </Button>
            </div>

            <div class="flex gap-2">
                <Input v-model="customTTS" placeholder="Custom message..." @keydown.enter="sendCustomTTS" />
                <Button size="sm" @click="sendCustomTTS">
                    Send
                </Button>
            </div>
        </div>
    </div>
</template>