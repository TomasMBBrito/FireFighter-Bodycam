import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMonitorStore = defineStore('monitor', () => {
    const mission = ref(null)
    const monitorMission = ref(null)
    const firefighters = ref([])

    return {
        mission, monitorMission, firefighters
    }
})