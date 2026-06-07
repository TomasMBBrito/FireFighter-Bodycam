<script setup>
import VideoStream from '@/components/VideoStream.vue'

const MISSION_ID = 'a0000001-0000-0000-0000-000000000003'

const streams = [
    'b0000001-0000-0000-0000-000000000001',
    'b0000001-0000-0000-0000-000000000002',
    'b0000001-0000-0000-0000-000000000003',
    'b0000001-0000-0000-0000-000000000004',
    'b0000001-0000-0000-0000-000000000005',
    'b0000001-0000-0000-0000-000000000006',
    'b0000001-0000-0000-0000-000000000007',
    'b0000001-0000-0000-0000-000000000008',
    'b0000001-0000-0000-0000-000000000009',
    'b0000001-0000-0000-0000-000000000010',
    // 'b0000001-0000-0000-0000-000000000011',
    // 'b0000001-0000-0000-0000-000000000012',
    // 'b0000001-0000-0000-0000-000000000013',
    // 'b0000001-0000-0000-0000-000000000014',
    // 'b0000001-0000-0000-0000-000000000015',
].map(id => ({ firefighterId: id, streamPath: `${MISSION_ID}/${id}` }))

const cols = streams.length <= 4 ? 2 : streams.length <= 9 ? 3 : 4
</script>

<template>
    <div class="p-4">
        <div
            class="grid gap-3"
            :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
        >
            <VideoStream
                v-for="s in streams"
                :key="s.streamPath"
                :stream-path="s.streamPath"
                :name="s.firefighterId"
            />
        </div>
    </div>
</template>