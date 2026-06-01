<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

import { API_BASE_URL } from '@/config/env'

const missions = ref([])
const route = useRoute()
const router = useRouter()
const loading = ref(true)

const userId = route.params.userId
const firefighterId = route.params.firefighterId

onMounted(async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/user/${userId}/missions`)
        const all = await res.json()
        missions.value = all
        console.log('Missions for user', userId, missions.value)
    } catch (e) {
        console.error('Failed to fetch mission history:', e)
    } finally {
        loading.value = false
    }
})

const viewFootage = (mission) => {
    router.push({
        name: 'FootageView',
        params: { missionId: mission.missionId, firefighterId: firefighterId }
    })
}
</script>

<template>
    <div class="p-6 flex flex-col gap-4">
        <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold">Mission History</h1>
        </div>

        <div v-if="loading" class="text-muted-foreground text-sm">
            Loading...
        </div>

        <div v-else-if="missions.length === 0" class="text-muted-foreground text-sm">
            No missions found.
        </div>

        <Table v-else>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Incident Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started At</TableHead>
                    <TableHead>Ended At</TableHead>
                    <TableHead class="text-right">View Footage</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableRow v-for="mission in missions" :key="mission.missionId">
                    <TableCell class="font-medium">
                        {{ mission.title }}
                    </TableCell>

                    <TableCell>
                        {{ mission.location }}
                    </TableCell>

                    <TableCell>
                        {{ mission.incidentType }}
                    </TableCell>

                    <TableCell>
                        {{ mission.status === 0 ? 'Active' : 'Completed' }}
                    </TableCell>

                    <TableCell>
                        {{
                            new Date(mission.startedAt).toLocaleString()
                        }}
                    </TableCell>

                    <TableCell>
                        {{
                            mission.endedAt
                                ? new Date(mission.endedAt).toLocaleString()
                                : 'Ongoing'
                        }}
                    </TableCell>

                    <TableCell class="text-right">
                        <Button size="sm" @click="viewFootage(mission)">
                            View Footage
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>