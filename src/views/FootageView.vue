<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'

import { Button } from '@/components/ui/button'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card'

import { MEDIAPLAYBACK_SERVER_URL } from '@/config/env'

const footage = ref([])
const selectedVideo = ref(null)

const route = useRoute()
const loading = ref(true)

const missionId = route.params.missionId
const firefighterId = route.params.firefighterId

onMounted(async () => {
    try {

        const path = `${firefighterId}/${missionId}`

        const res = await fetch(
            `${MEDIAPLAYBACK_SERVER_URL}/list?path=${path}`
        )

        const data = await res.json()

        footage.value = data
            .map(item => ({
                ...item,

                playbackUrl: item.url.replace(
                    'localhost',
                    MEDIAPLAYBACK_SERVER_URL
                )
            }))

            .sort((a, b) =>
                new Date(b.start) - new Date(a.start)
            )

        // auto select newest video
        if (footage.value.length > 0) {
            selectedVideo.value = footage.value[0]
        }

    } catch (e) {
        console.error('Failed to fetch footage:', e)
    } finally {
        loading.value = false
    }
})

const viewFootage = (item) => {
    selectedVideo.value = item
}
</script>

<template>
    <div class="p-6 h-screen overflow-hidden">

        <div class="grid grid-cols-12 gap-6 h-full">

            <!-- LEFT SIDE -->
            <div class="col-span-4 h-full">

                <Card class="h-full flex flex-col">

                    <CardHeader>
                        <CardTitle>
                            Mission Footage
                        </CardTitle>
                    </CardHeader>

                    <CardContent class="flex-1 overflow-y-auto">

                        <div v-if="loading" class="text-muted-foreground text-sm">
                            Loading...
                        </div>

                        <div v-else-if="footage.length === 0" class="text-muted-foreground text-sm">
                            No footage found.
                        </div>

                        <Table v-else>

                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        Recorded At
                                    </TableHead>

                                    <TableHead>
                                        Duration
                                    </TableHead>

                                    <TableHead class="text-right">
                                        Stream
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>

                                <TableRow v-for="item in footage" :key="item.start">

                                    <TableCell class="font-medium">

                                        {{
                                            new Date(item.start)
                                                .toLocaleString(
                                                    'pt-PT',
                                                    {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: false
                                                    }
                                                )
                                        }}

                                    </TableCell>

                                    <TableCell>
                                        {{
                                            `${Math.floor(item.duration)}s`
                                        }}
                                    </TableCell>

                                    <TableCell class="text-right">

                                        <Button size="sm" @click="viewFootage(item)">
                                            View
                                        </Button>

                                    </TableCell>

                                </TableRow>

                            </TableBody>

                        </Table>

                    </CardContent>

                </Card>

            </div>

            <!-- RIGHT SIDE -->
            <div class="col-span-8 h-full">

                <Card class="h-full">

                    <CardHeader>
                        <CardTitle>
                            Playback
                        </CardTitle>
                    </CardHeader>

                    <CardContent class="h-[calc(100%-80px)]">

                        <div v-if="selectedVideo" class="h-full flex flex-col gap-4">

                            <div class="text-sm text-muted-foreground">

                                {{
                                    new Date(selectedVideo.start)
                                        .toLocaleString(
                                            'pt-PT',
                                            {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false
                                            }
                                        )
                                }}

                            </div>

                            <video :key="selectedVideo.playbackUrl" controls autoplay
                                class="w-full rounded-xl border bg-black max-h-[75vh]">

                                <source :src="selectedVideo.playbackUrl" type="video/mp4" />

                            </video>

                        </div>

                        <div v-else class="h-full flex items-center justify-center text-muted-foreground">
                            Select a recording
                        </div>

                    </CardContent>

                </Card>

            </div>

        </div>

    </div>
</template>