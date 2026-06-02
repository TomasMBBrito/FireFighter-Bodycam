<script setup>
import { computed, onUnmounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import FirefighterCard from '@/components/FireFighterCard.vue'
import { useMonitorStore } from '@/stores/monitor'
import { useTelemetryStore } from '@/stores/telemetry'

const monitorStore = useMonitorStore()
const telemetryStore = useTelemetryStore()

monitorStore.createStreamURLs()

const gridCols = computed(() => {
    const n = monitorStore.streamURLs.length

    if (n === 1) return 1
    if (n <= 4) return 2
    if (n <= 9) return 3
    return 4
})

const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${gridCols.value}, minmax(0, 1fr))`
}))

onUnmounted(() => {
    telemetryStore.disconnectAll()
    monitorStore.reset()
})
</script>

<template>
    <div class="flex flex-col items-center gap-4 p-4 bg-muted min-h-0 overflow-y-auto">

        <!-- Grid de cards -->
        <Card class="p-4 w-[90vw] max-w-6xl">
            <CardContent class="p-0">
                <div class="grid gap-3 w-full items-start" :style="gridStyle">
                    <FirefighterCard v-for="(ff, index) in monitorStore.firefightersList" :key="ff.firefighterId"
                        :firefighter="ff" :stream-path="monitorStore.streamURLs[index]" class="w-full" />
                </div>
            </CardContent>
        </Card>

    </div>
</template>