import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSosStore } from '@/stores/sos'

import { WS_SERVER_URL } from '@/config/env'

export const useTelemetryStore = defineStore('telemetry', () => {
    const telemetry_map = ref({})
    const network_map = ref({})
    const snapshot_map = ref({})
    const sockets = {}

    const connect = (firefighterID) => {
        if(sockets[firefighterID]) {
            disconnect(firefighterID)
        }

        const socket = new WebSocket(`${WS_SERVER_URL}/ws/${firefighterID}`);

        socket.onopen = () => {
            //connected.value = true
            console.log('WebSocket connection established to firefighter ID:', firefighterID);
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(data)
            console.log(
                "Timestamp:",
                data.Timestamp
            )
            if (data.Type === 'SOS') {
                const sosStore = useSosStore()
                sosStore.trigger_sos(data.FirefighterId)
                return
            }

            if (data.Type === 'NETWORK') {
                network_map.value[firefighterID] = data
                return
            }

            if (data.Type === 'SNAPSHOT') {
                snapshot_map.value[firefighterID] = data
                return
            }

            telemetry_map.value[firefighterID] = data
            //console.log('[Telemetria]', data)
        }

        socket.onclose = () => {
            telemetry_map.value[firefighterID] = null
            network_map.value[firefighterID] = null
            snapshot_map.value[firefighterID] = null
            delete sockets[firefighterID]
        }

        socket.onerror = (err) => {
            console.error('[WS] Error:', err)
        }

        sockets[firefighterID] = socket
    }


    const disconnect = (firefighterId) => {
        const socket = sockets[firefighterId]
        if (!socket) return


        if (socket.readyState === WebSocket.OPEN) {
            socket.close(1000, 'Normal closure')
        }
    }

    const disconnectAll = () => {
        const ids = Object.keys(sockets)
        ids.forEach(disconnect)
    }

    const getTelemetry = (firefighterId) => {
        return telemetry_map.value[firefighterId] ?? null
    }

    const getNetwork = (firefighterId) => {
        return network_map.value[firefighterId] ?? null
    }

    const getSnapshot = (firefighterId) => {
        return snapshot_map.value[firefighterId] ?? null
    }

    return {
        telemetry_map,
        network_map,
        snapshot_map,
        connect,
        disconnect,
        disconnectAll,
        getTelemetry,
        getNetwork,
        getSnapshot
    }


})
