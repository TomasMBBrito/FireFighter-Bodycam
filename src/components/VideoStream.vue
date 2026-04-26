<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
    streamPath: String,
    name: String
})

const videoEl = ref(null)
const connected = ref(false)
const error = ref(null)
let pc = null

onMounted(async () => {
    try {
        pc = new RTCPeerConnection()

        pc.ontrack = (e) => {
            videoEl.value.srcObject = e.streams[0]
            videoEl.value.play()
            connected.value = true
        }

        pc.addTransceiver('video', { direction: 'recvonly' })
        pc.addTransceiver('audio', { direction: 'recvonly' })

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const res = await fetch(`http://localhost:8889/${props.streamPath}/whep`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/sdp' },
            body: offer.sdp
        })

        if (!res.ok) {
            error.value = 'Stream not available'
            return
        }

        const answer = await res.text()
        await pc.setRemoteDescription({ type: 'answer', sdp: answer })

    } catch (e) {
        error.value = 'Failed to connect'
        console.error(e)
    }
})

onUnmounted(() => {
    if (pc) { pc.close(); pc = null }
})
</script>

<template>
    <div class="relative w-full aspect-video bg-black rounded-lg overflow-hidden">

        <!-- Video -->
        <video ref="videoEl" autoplay muted playsinline class="w-full h-full object-cover" />

        <!-- Name badge -->
        <div class="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {{ name }}
        </div>

        <!-- Connecting indicator -->
        <div v-if="!connected && !error"
            class="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-sm">
            <span class="animate-pulse">Connecting...</span>
        </div>

        <!-- Error indicator -->
        <div v-if="error" class="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 text-sm">
            {{ error }}
        </div>

        <!-- Live badge -->
        <div v-if="connected"
            class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
        </div>

    </div>
</template>