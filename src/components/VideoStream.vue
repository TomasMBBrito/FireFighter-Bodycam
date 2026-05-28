<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { MEDIA_SERVER_URL } from '@/config/env'

const props = defineProps({
    streamPath: String,
    name: String
})

const videoEl = ref(null)
const connected = ref(false)
const error = ref(null)
const reconnecting = ref(false)

let pc = null
let reconnectTimeout = null
let destroyed = false
let isConnecting = false
const RECONNECT_DELAY = 3000

//Close Webrtc connection and clear handlers
const cleanup = () => {

    // Clear reconnect timeout if exists to prevent multiple attempts
    if (reconnectTimeout) { clearTimeout(reconnectTimeout); reconnectTimeout = null }

    //Remove listeners and close connection
    if (pc) {
        pc.ontrack = null
        pc.onconnectionstatechange = null
        pc.oniceconnectionstatechange = null
        pc.close()
        pc = null
    }
}

//Schedule a reconnect attempt after a delay, but only if not already trying to connect or destroyed
const scheduleReconnect = () => {
    if (destroyed || reconnectTimeout || isConnecting) return
    reconnecting.value = true
    connected.value = false
    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null
        connect()
    }, RECONNECT_DELAY)
}


//WebRTC Connection via WHEP  
const connect = async () => {
    //If there's already a connection attempt in progress or the component is destroyed, do nothing
    if (destroyed || isConnecting) return
    isConnecting = true

    //Clear any existing connection
    cleanup()
    error.value = null

    //New connection using WebRTC
    try {
        pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        })

        //Callback for when server sends a new media stream, set it as the video source
        pc.ontrack = (e) => {
            if (!videoEl.value || destroyed) return
            videoEl.value.srcObject = null
            videoEl.value.srcObject = e.streams[0]
            videoEl.value.play().catch(() => {})
            connected.value = true
            reconnecting.value = false
            error.value = null
        }

        //Callback for connection state changes, if connection is lost schedule a reconnect
        pc.onconnectionstatechange = () => {
            if (!pc || isConnecting) return
            const state = pc.connectionState
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                connected.value = false
                scheduleReconnect()
            }
        }

        pc.addTransceiver('video', { direction: 'recvonly' })
        pc.addTransceiver('audio', { direction: 'recvonly' })

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        //Wait for ICE gathering to complete or timeout after 3 seconds to ensure we have all candidates before sending the offer
        await new Promise((resolve) => {
            if (!pc || pc.iceGatheringState === 'complete') { resolve(); return }
            const timeout = setTimeout(resolve, 3000)
            pc.addEventListener('icegatheringstatechange', () => {
                if (pc?.iceGatheringState === 'complete') {
                    clearTimeout(timeout)
                    resolve()
                }
            })
        })

        if (destroyed) return

        const res = await fetch(`${MEDIA_SERVER_URL}/${props.streamPath}/whep`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/sdp' },
            body: pc.localDescription.sdp
        })

        if (!res.ok) {
            error.value = 'Stream not available'
            isConnecting = false
            scheduleReconnect()
            return
        }

        const answer = await res.text()
        await pc?.setRemoteDescription({ type: 'answer', sdp: answer })

    } catch (e) {
        if (destroyed) return
        error.value = 'Failed to connect'
        console.error(e)
        isConnecting = false
        scheduleReconnect()
        return
    }

    isConnecting = false
}

onMounted(() => connect())

onUnmounted(() => {
    destroyed = true
    cleanup()
    if (videoEl.value) {
        videoEl.value.srcObject = null
    }
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

        <!-- Connecting -->
        <div v-if="!connected && !reconnecting && !error"
            class="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-sm">
            <span class="animate-pulse">Connecting...</span>
        </div>

        <!-- Reconnecting -->
        <div v-if="reconnecting"
            class="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-sm flex-col gap-2">
            <span>Reconnecting...</span>
        </div>

        <!-- Error -->
        <div v-if="error && !reconnecting"
            class="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 text-sm">
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