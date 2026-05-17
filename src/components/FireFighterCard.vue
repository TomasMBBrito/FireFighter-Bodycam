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

const showMap = ref(false)
const mapContainer = ref(null)
const leafletReady = ref(!!window.L)

let leafletMap = null
let leafletMarker = null


const sosActive = ref(false)
let sosTimeout = null

const ttsButtons = computed(() =>[
    {
        label: 'Evacuate',
        message: 'Evacua o edificio já!'
    },
    {
        label: '1 min',
        message: 'Tens 1 minutos para saires daí.'
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

const sendTTS = async (text) => {
    try {
        const res = await fetch('https://localhost:7096/api/TextToSpeech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firefighterId: props.firefighter.firefighterId,
                text
            })
        })
        const data  =JSON.stringify({
                firefighterId: props.firefighter.firefighterId,
                text})
        console.log('TTS message sent:', data)
        console.log('TTS response:', res.status, await res.text())
    } catch (error) {
        console.error('Failed to send TTS message:', error)
    }
}

function getArrowIcon(bearing) {
    const L = window.L

    const angle = Number(bearing || 0)

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

function destroyMap() {
    if (leafletMap) {
        leafletMap.remove()
        leafletMap = null
    }

    leafletMarker = null
}

// Watch for bearing changes and update the marker icon
watch(
    () => t.value?.CompassBearing,
    (newBearing) => {
        if (!leafletMarker || newBearing == null) return

        const bearing = Number(newBearing ?? 0)
        leafletMarker.setIcon(getArrowIcon(bearing))
    }
)

// Also watch for GPS position changes to update marker location
watch(
    () => [t.value?.GpsLat, t.value?.GpsLng],
    ([newLat, newLng]) => {
        if (!leafletMarker || newLat == null || newLng == null) return

        leafletMarker.setLatLng([newLat, newLng])
    }
)

watch(() => sosStore.get_sos(props.firefighter.firefighterId), (val) => {
    if (!val) return
    sosActive.value = true
    clearTimeout(sosTimeout)
    sosTimeout = setTimeout(() => { sosActive.value = false }, 10000)
})

const openMap = async () => {
    if (
        !window.L ||
        !t.value ||
        t.value.GpsLat == null ||
        t.value.GpsLng == null
    ) {
        return
    }

    showMap.value = true

    // wait for modal render
    await nextTick()

    // wait for DOM paint
    requestAnimationFrame(() => {
        if (!mapContainer.value) return

        destroyMap()

        const L = window.L

        leafletMap = L.map(mapContainer.value, {
            zoomControl: true,
        })

        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }
        ).addTo(leafletMap)

        leafletMap.setView(
            [t.value.GpsLat, t.value.GpsLng],
            16
        )

        const bearing = Number(t.value.CompassBearing ?? 0)

        leafletMarker = L.marker(
            [t.value.GpsLat, t.value.GpsLng],
            {
                icon: getArrowIcon(bearing)
            }
        )
            .addTo(leafletMap)
            .bindPopup(props.firefighter.name)
            .openPopup()

        leafletMap.invalidateSize()
    })
}

const closeMap = () => {
    showMap.value = false
    destroyMap()
}

onMounted(() => {
    telemetryStore.connect(
        props.firefighter.firefighterId
    )

    if (!window.L) {
        const link = document.createElement('link')

        link.rel = 'stylesheet'
        link.href =
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'

        document.head.appendChild(link)

        const script = document.createElement('script')

        script.src =
            'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

        script.onload = () => {
            leafletReady.value = true
        }

        document.head.appendChild(script)
    }
})

onUnmounted(() => {
    telemetryStore.disconnect(
        props.firefighter.firefighterId
    )

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

    const dirs = [
        'N',
        'NE',
        'E',
        'SE',
        'S',
        'SW',
        'W',
        'NW'
    ]

    return dirs[Math.round(b / 45) % 8]
})
</script>

<template>
    <div class="w-full rounded-lg overflow-hidden border border-border">
        <!-- Video -->
        <div class="relative aspect-video bg-black">
            <VideoStream :stream-path="streamPath" class="w-full h-full object-cover" />

            <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {{ firefighter.name }}
            </div>

            <div v-if="t?.FallDetected" class="absolute top-2 right-2">
                <Badge variant="destructive" class="animate-pulse text-xs">
                    FALL DETECTED
                </Badge>
            </div>
            <div v-if="sosActive" class="absolute inset-0 flex items-center justify-center z-10 bg-red-600/80 animate-pulse">
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
                ↑ {{ bearingLabel }}
                ({{ Math.round(t.CompassBearing) }}°)
            </Badge>

            <Badge v-if="
                t.GpsLat != null &&
                t.GpsLng != null &&
                leafletReady
            " variant="outline" class="font-mono cursor-pointer hover:bg-accent" @click="openMap">
                {{ t.GpsLat?.toFixed(5) }},
                {{ t.GpsLng?.toFixed(5) }}
            </Badge>
        </div>

        <!-- Text to speech buttons-->
        <div v-if="t" class="border-t border-border px-3 py-2 flex flex-wrap gap-2">
            <Button
                v-for="btn in ttsButtons"
                :key="btn.message"
                size="sm"
                variant="outline"
                @click="sendTTS(btn.message)"
            >
                {{ btn.label }}
            </Button>
        </div>
    </div>

    <!-- Map Modal -->
    <Teleport to="body">
        <div v-if="showMap" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
            @click.self="closeMap">
            <div class="bg-background rounded-xl overflow-hidden border border-border w-[520px]">
                <div class="flex justify-between items-center px-4 py-3 border-b border-border">
                    <span class="text-sm font-medium">
                        {{ firefighter.name }} — Location
                    </span>

                    <button class="text-muted-foreground hover:text-foreground text-lg leading-none" @click="closeMap">
                        ✕
                    </button>
                </div>

                <div ref="mapContainer" style="height: 360px;" />
            </div>
        </div>
    </Teleport>
</template>