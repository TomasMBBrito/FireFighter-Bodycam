<script setup>
import { computed, onMounted,onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import FirefighterCard from '@/components/FireFighterCard.vue'
import { useMonitorStore } from '@/stores/monitor'
import { useTelemetryStore } from '@/stores/telemetry'

const route = useRoute()
const monitorStore = useMonitorStore()
const telemetryStore = useTelemetryStore()

const selectedFirefighters = computed(() => {
    const ids = route.query.ids ? route.query.ids.split(',') : []
    const names = route.query.names ? route.query.names.split(',') : []
    return ids.map((id, i) => ({ firefighterId: id, name: names[i] ?? id }))
})

onMounted(async () => {
    monitorStore.selectFirefighters(selectedFirefighters.value,null)
    await monitorStore.createStreamURLs()
})

onUnmounted(() => {
    telemetryStore.disconnectAll()
    monitorStore.reset()
})
</script>

<template>
    <div class="p-6 flex flex-col items-center gap-4">
        <Card class="w-full max-w-3xl">
            <CardHeader>
                <CardTitle>Live — {{ selectedFirefighters.length }} firefighter(s)</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-wrap gap-2">
                <FirefighterCard v-for="(ff, index) in monitorStore.firefightersList" :key="ff.firefighterId"
                        :firefighter="ff" :stream-path="monitorStore.streamURLs[index]" />
            </CardContent>
        </Card>
    </div>
</template>