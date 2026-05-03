import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTelemetryStore = defineStore('telemetry', () => {
    const telemetry_data = ref(null)
    const connected = ref(false)
    let socket = null

    const connect = (firefighterID) => {
        if(socket){
            disconnect()
        }

        socket = new WebSocket(`ws://localhost:5081/ws/${firefighterID}`);

        socket.onopen = () => {
            connected.value = true
            console.log('WebSocket connection established to firefighter ID:', firefighterID);
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            telemetry_data.value = data
            console.log('[Telemetria]', data)
        }

        socket.onclose = () => {
            connected.value = false
            console.log(`WebSocket connection closed: ${firefighterID}`)
        }

        socket.onerror = (err) => {
            console.error('[WS] Error:', err)
        }




    }


    const disconnect = () => {
        socket?.close()
        socket = null
        connected.value = false
        telemetry.value = null
    }

    return { telemetry_data, connected, connect, disconnect }


})