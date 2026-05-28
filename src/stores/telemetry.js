import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSosStore } from '@/stores/sos'

export const useTelemetryStore = defineStore('telemetry', () => {
    const telemetry_map = ref({}) 
    const sockets = {}

    const connect = (firefighterID) => {
        if(sockets[firefighterID]) {
            disconnect(firefighterID)
        }

        const socket = new WebSocket(`ws://localhost:5081/ws/${firefighterID}`);

        socket.onopen = () => {
            //connected.value = true
            console.log('WebSocket connection established to firefighter ID:', firefighterID);
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(data)
            if (data.Type === 'SOS') {
                const sosStore = useSosStore()
                sosStore.trigger_sos(data.FirefighterId)
                return
            }
            telemetry_map.value[firefighterID] = data
            //console.log('[Telemetria]', data)
        }

        socket.onclose = () => {
            // connected.value = false
            telemetry_map.value[firefighterID] = null
            console.log(`WebSocket connection closed: ${firefighterID}`)
        }

        socket.onerror = (err) => {
            console.error('[WS] Error:', err)
        }

        sockets[firefighterID] = socket
    }


    const disconnect = (firefighterId) => {
        sockets[firefighterId]?.close()
        delete sockets[firefighterId]
        delete telemetry_map.value[firefighterId]
    }

    const disconnectAll = () => {
        Object.keys(sockets).forEach(disconnect)
    }

    const getTelemetry = (firefighterId) => {
        return telemetry_map.value[firefighterId] ?? null
    }

    return { telemetry_map, connect, disconnect, disconnectAll,getTelemetry }


})