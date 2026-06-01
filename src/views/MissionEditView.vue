<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/config/env'

const route = useRoute()
const router = useRouter()

const missionId = route.params.id

const mission = ref(null)

const commanders = ref([])
const firefighters = ref([])
const availableFirefighters = ref([])

const selectedFirefighter = ref('')

const incidentTypes = [
    'Solo',
    'Wildfire',
    'Structure Fire',
    'Rescue',
    'Hazmat',
    'Other'
]

const statuses = [
    'Active',
    'Completed',
    'Cancelled'
]

const loadData = async () => {
    try {
        const [
            missionRes,
            firefightersRes,
            commandersRes,
            allFirefightersRes
        ] = await Promise.all([
            fetch(`${API_BASE_URL}/api/Mission/${missionId}`),
            fetch(`${API_BASE_URL}/api/Mission/${missionId}/firefighters`),
            fetch(`${API_BASE_URL}/api/User/commanders`),
            fetch(`${API_BASE_URL}/api/User/firefighters`)
        ])

        mission.value = await missionRes.json()

        if (firefightersRes.ok)
            firefighters.value = await firefightersRes.json()
        else
            firefighters.value = []

        commanders.value = await commandersRes.json()
        availableFirefighters.value =
            await allFirefightersRes.json()

    } catch (err) {
        console.error(err)
    }
}

const saveMission = async () => {
    try {
        const res = await fetch(
            `${API_BASE_URL}/api/Mission/${missionId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: mission.value.title,
                    location: mission.value.location,
                    latitude: mission.value.latitude,
                    longitude: mission.value.longitude,
                    incidentType: mission.value.incidentType,
                    status: mission.value.status,
                    commanderId: mission.value.commanderId
                })
            }
        )

        if (!res.ok)
            throw new Error()

        router.push('/missions')
    } catch (err) {
        console.error(err)
        alert('Failed to save mission')
    }
}

const removeFirefighter = async (firefighterId) => {
    try {
        const res = await fetch(
            `${API_BASE_URL}/api/Mission/${missionId}/firefighters/${firefighterId}/remove`,
            {
                method: 'PUT'
            }
        )

        if (!res.ok)
            throw new Error()

        firefighters.value =
            firefighters.value.filter(
                x => x.firefighterId !== firefighterId
            )

    } catch (err) {
        console.error(err)
    }
}

const addFirefighter = async () => {
    if (!selectedFirefighter.value)
        return

    try {
        const res = await fetch(
            `${API_BASE_URL}/Mission/associate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    missionID: missionId,
                    firefighterID: selectedFirefighter.value
                })
            }
        )

        if (!res.ok)
            throw new Error()

        await loadData()

        selectedFirefighter.value = ''

    } catch (err) {
        console.error(err)
        alert('Failed to add firefighter')
    }
}

onMounted(loadData)
</script>

<template>
    <div v-if="mission" class="max-w-5xl mx-auto p-6 space-y-6">
        <h1 class="text-2xl font-bold">
            Edit Mission
        </h1>

        <div class="grid grid-cols-2 gap-4">

            <div>
                <label>Title</label>
                <Input v-model="mission.title" />
            </div>

            <div>
                <label>Location</label>
                <Input v-model="mission.location" />
            </div>

            <div>
                <label>Latitude</label>
                <Input type="number" v-model="mission.latitude" />
            </div>

            <div>
                <label>Longitude</label>
                <Input type="number" v-model="mission.longitude" />
            </div>

            <div>
                <label>Incident Type</label>

                <select v-model="mission.incidentType" class="w-full border rounded px-3 py-2">
                    <option v-for="type in incidentTypes" :key="type">
                        {{ type }}
                    </option>
                </select>
            </div>

            <div>
                <label>Status</label>

                <select v-model="mission.status" class="w-full border rounded px-3 py-2">
                    <option v-for="status in statuses" :key="status">
                        {{ status }}
                    </option>
                </select>
            </div>

            <div class="col-span-2">
                <label>Commander</label>

                <select v-model="mission.commanderId" class="w-full border rounded px-3 py-2">
                    <option v-for="commander in commanders" :key="commander.userId" :value="commander.userId">
                        {{ commander.name }}
                    </option>
                </select>
            </div>

        </div>

        <!-- Firefighters -->

        <div class="border rounded p-4 space-y-4">
            <h2 class="font-semibold text-lg">
                Firefighters
            </h2>

            <div v-for="ff in firefighters" :key="ff.firefighterId"
                class="flex justify-between items-center border-b py-2">
                <div>
                    <div>{{ ff.name }}</div>
                    <div class="text-xs text-muted-foreground">
                        {{ ff.roleInMission }}
                    </div>
                </div>

                <Button variant="destructive" @click="removeFirefighter(ff.firefighterId)">
                    Remove
                </Button>
            </div>

            <div class="flex gap-2">
                <select v-model="selectedFirefighter" class="flex-1 border rounded px-3 py-2">
                    <option value="">
                        Select firefighter
                    </option>

                    <option v-for="ff in availableFirefighters" :key="ff.userId" :value="ff.userId">
                        {{ ff.name }}
                    </option>
                </select>

                <Button @click="addFirefighter">
                    Add
                </Button>
            </div>
        </div>

        <div class="flex justify-end">
            <Button @click="saveMission">
                Save Changes
            </Button>
        </div>
    </div>
</template>