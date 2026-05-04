<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useTelemetryStore } from '@/stores/telemetry'

const telemetryStore = useTelemetryStore()
const firefighterId = 'b0000001-0000-0000-0000-000000000006'

onMounted(() => telemetryStore.connect(firefighterId))
onUnmounted(() => telemetryStore.disconnect())
</script>

<template>
    <div>
        <p>Estado: {{ telemetryStore.connected ? 'Ligado' : 'Desligado' }}</p>
        <pre>{{ telemetryStore.telemetry }}</pre>
    </div>
</template>