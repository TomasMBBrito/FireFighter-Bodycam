import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSosStore = defineStore('sos', () => {
    const sos_map = ref({})

    const trigger_sos = (firefighterId) => {
        sos_map.value[firefighterId] = Date.now()
    }

    const get_sos = (firefighterId) => {
        return sos_map.value[firefighterId] ?? null
    }

    return { sos_map, trigger_sos, get_sos }
})