import { defineStore } from 'pinia'
import { ref } from 'vue'

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

    const createStreamURLs = async () => {
        if(monitorMission.value) {
            const res = await fetch(`https://localhost:7096/api/Mission/${mission.value.missionId}/firefighters`)
            firefightersList.value = await res.json()
        }
        firefightersList.value.forEach(ff => {
            streamURLs.value.push(`${mission.value.missionId}/${ff.firefighterId}`)
            console.log(`${mission.value.missionId}/${ff.firefighterId}`) // Log the stream URL for debugging
        })
    }

    return {
        mission, monitorMission, firefightersList, streamURLs, selectMission, selectFirefighters, createStreamURLs
    }
})