<script setup>
import { computed } from 'vue'
import { Card } from '@/components/ui/card'
import VideoStream from '@/components/VideoStream.vue'
import { useMonitorStore } from '@/stores/monitor'

const monitorStore = useMonitorStore()

monitorStore.createStreamURLs()

const gridCols = computed(() => {
    const n = monitorStore.streamURLs.length
    return Math.min(4, Math.max(2, Math.ceil(Math.sqrt(n))))
})

const gridStyle = computed(() => ({
    display: "grid",
    gridTemplateColumns: `repeat(${gridCols.value}, minmax(0, 1fr))`,
}))

</script>

<template>
    <div class="h-screen flex items-center justify-center bg-muted">
        <Card class="p-4 w-[90vw] max-w-6xl">

            <div class="grid gap-2 w-full" :style="gridStyle">
                <div v-for="stream in monitorStore.streamURLs" :key="stream"
                    class="aspect-video w-full overflow-hidden rounded-md border bg-black">
                    <VideoStream :stream-path="stream" name="João Silva" />
                </div>
            </div>
        </Card>
    </div>
</template>