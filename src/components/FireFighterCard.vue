<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useTelemetryStore } from '@/stores/telemetry'
import VideoStream from '@/components/VideoStream.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const props = defineProps({
    firefighter: Object,
    streamPath: String
})

const telemetryStore = useTelemetryStore()
const t = computed(() => telemetryStore.getTelemetry(props.firefighter.firefighterId))

onMounted(() => telemetryStore.connect(props.firefighter.firefighterId))
onUnmounted(() => telemetryStore.disconnect(props.firefighter.firefighterId))

const val = (value, unit = '') => value != null ? `${value}${unit}` : '—'
</script>

<template>
    <Card class="overflow-hidden bg-black border-gray-800 flex flex-col">

        <!-- Vídeo -->
        <div class="relative w-full bg-black" style="aspect-ratio: 16/10;">
            <VideoStream :stream-path="streamPath" class="w-full h-full" />

            <!-- Nome -->
            <div class="absolute top-2 left-2">
                <Badge variant="secondary" class="bg-black/70 text-white">
                    {{ firefighter.name }}
                </Badge>
            </div>

            <!-- Badge queda -->
            <div class="absolute top-2 right-2" v-if="t?.fallDetected">
                <Badge variant="destructive" class="animate-pulse">
                    ⚠ QUEDA
                </Badge>
            </div>
        </div>

        <Separator class="bg-gray-800" />

        <!-- Telemetria -->
        <CardContent class="p-3 grid grid-cols-3 gap-3">

            <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">🌡 Temperatura</span>
                <Badge class="w-fit">
                    {{ val(t?.BodyTemp, '°C') }}
                </Badge>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">❤️ Ritmo Cardíaco</span>
                <Badge class="w-fit">
                    {{ val(t?.HeartRate, ' bpm') }}
                </Badge>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">💥 Impacto</span>
                <Badge :variant="(t?.impactMagnitude ?? 0) > 1.2 ? 'destructive' : 'secondary'" class="w-fit">
                    {{ val(t?.ImpactMagnitude) }}
                </Badge>
            </div>

            <div class="flex flex-col gap-1 col-span-2">
                <span class="text-xs text-muted-foreground">📍 GPS</span>
                <span class="text-xs text-white font-mono">
                    {{ t ? `${t.GpsLat}, ${t.GpsLng}` : '—' }}
                </span>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">🏃 Estado</span>
                <Badge :variant="t?.fallDetected ? 'destructive' : 'secondary'" class="w-fit">
                    {{ val(t?.ActivityState) }}
                </Badge>
            </div>

            <div class="flex flex-col gap-1">
                <span class="text-xs text-muted-foreground">📡 Orientação</span>
                <Badge variant="secondary" class="w-fit">
                    {{ val(t?.Orientation) }}
                </Badge>
            </div>

        </CardContent>
    </Card>
</template>