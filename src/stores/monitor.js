import { defineStore } from 'pinia'
import { ref } from 'vue'
import { API_BASE_URL } from '@/config/env'
import { api } from '@/lib/api'

export const useMonitorStore = defineStore('monitor', () => {
    const mission = ref(null)
    const monitorMission = ref(null)
    const firefightersList = ref([])
    const streamURLs = ref([])

    

    const selectMission = (missionData) => {
        mission.value = missionData
        firefightersList.value = []
        monitorMission.value = true
    }

    const selectFirefighters = (firefighters, missionData) => {
        firefightersList.value = firefighters
        mission.value = missionData
        monitorMission.value = false
    }

    const createStreamURLsOnlyKnowFirefighters = async () => {
        streamURLs.value = []
        if (monitorMission.value) {
            firefightersList.value = await api.get(`/api/Mission/${mission.value.missionId}/firefighters`)
        }
        for (const ff of firefightersList.value) {
            const data = await api.get(`/api/Mission/firefighter/${ff.firefighterId}/active-mission`)
            streamURLs.value.push(`${ff.firefighterId}/${data.missionId}`)
        }
    }

    const createStreamURLs = async () => {
        if (monitorMission.value) {
            firefightersList.value = await api.get(`/api/Mission/${mission.value.missionId}/firefighters`)
        }
        firefightersList.value.forEach(ff => {
            streamURLs.value.push(`${ff.firefighterId}/${mission.value.missionId}`)
        })
    }

    const reset = () => {
    mission.value = null
    monitorMission.value = null
    firefightersList.value = []
    streamURLs.value = []
}

    return {
        mission, monitorMission, firefightersList, streamURLs, selectMission, selectFirefighters, createStreamURLs, reset, createStreamURLsOnlyKnowFirefighters
    }
})