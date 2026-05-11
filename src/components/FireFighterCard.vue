<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTelemetryStore } from '@/stores/telemetry'
import VideoStream from '@/components/VideoStream.vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps({
    firefighter: Object,
    streamPath: String
})

const telemetryStore = useTelemetryStore()
const t = computed(() => telemetryStore.getTelemetry(props.firefighter.firefighterId))

const showMap = ref(false)
const mapContainer = ref(null)
let leafletMap = null

const openMap = () => {
    showMap.value = true
    setTimeout(() => {
        if (leafletMap) { leafletMap.remove(); leafletMap = null }
        const L = window.L
        leafletMap = L.map(mapContainer.value, { zoomControl: true })
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(leafletMap)
        leafletMap.setView([t.value.GpsLat, t.value.GpsLng], 16)
        L.marker([t.value.GpsLat, t.value.GpsLng])
            .addTo(leafletMap)
            .bindPopup(props.firefighter.name)
            .openPopup()
    }, 100)
}

const closeMap = () => {
    showMap.value = false
    if (leafletMap) { leafletMap.remove(); leafletMap = null }
}

onMounted(() => {
    telemetryStore.connect(props.firefighter.firefighterId)
    if (!window.L) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        document.head.appendChild(script)
    }
})

onUnmounted(() => {
    telemetryStore.disconnect(props.firefighter.firefighterId)
    if (leafletMap) { leafletMap.remove(); leafletMap = null }
})

const motionLevelLabel = computed(() => {
    const m = t.value?.MotionLevel
    if (m == null) return '—'
    if (m < 0.2) return 'Low'
    if (m < 0.6) return 'Medium'
    return 'High'
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
        </div>

        <!-- Telemetry bar -->
        <div v-if="t" class="border-t border-border px-3 py-2 flex flex-wrap gap-2 items-center">
            <Badge variant="outline">{{ t.ActivityState ?? 'N/A' }}</Badge>
            <Badge variant="outline">{{ t.IsMoving ? 'Moving' : 'Stationary' }}</Badge>
            <Badge variant="outline">Motion Level:{{ motionLevelLabel }}</Badge>
            <Badge v-if="t.GpsLat && t.GpsLng" variant="outline" class="font-mono cursor-pointer hover:bg-accent"
                @click="openMap">
                {{ t.GpsLat?.toFixed(5) }}, {{ t.GpsLng?.toFixed(5) }}
            </Badge>
        </div>
    </div>

    <!-- Map modal -->
    <Teleport to="body">
        <div v-if="showMap" class="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
            @click.self="closeMap">
            <div class="bg-background rounded-xl overflow-hidden border border-border w-[520px]">
                <div class="flex justify-between items-center px-4 py-3 border-b border-border">
                    <span class="text-sm font-medium">{{ firefighter.name }} — Location</span>
                    <button class="text-muted-foreground hover:text-foreground text-lg leading-none" @click="closeMap">
                        ✕
                    </button>
                </div>
                <div ref="mapContainer" style="height: 360px;" />
            </div>
        </div>
    </Teleport>
</template>