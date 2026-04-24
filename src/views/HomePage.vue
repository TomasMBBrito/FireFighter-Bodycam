<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue"
import { Card } from "@/components/ui/card"

const cameras = ref([])

async function fetchStreams() {
    try {
        const res = await fetch("http://localhost:9997/v3/paths/list")
        const data = await res.json()

        const streams = (data.items || [])
            .filter(i => i.ready && i.online)
            .map(item => ({
                name: item.name,
                url: `http://localhost:8889/${item.name}`
            }))

        cameras.value = streams
    } catch (err) {
        console.error(err)
    }
}

let interval

onMounted(() => {
    fetchStreams()
    interval = setInterval(fetchStreams, 2000)
})

onBeforeUnmount(() => {
    clearInterval(interval)
})

const cols = computed(() => {
    return Math.max(1, Math.ceil(Math.sqrt(cameras.value.length || 1)))
})

const gridStyle = computed(() => ({
    display: "grid",
    gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`,
}))
</script>

<template>
    <div class="h-screen flex items-center justify-center bg-muted">
        <Card class="p-4 w-[90vw] max-w-6xl">

            <div class="grid gap-2 w-full" :style="gridStyle">

                <iframe v-for="cam in cameras" :key="cam.name" :src="cam.url"
                    class="w-full aspect-square rounded-md border bg-black" scrolling="no" />

            </div>

        </Card>
    </div>
</template>