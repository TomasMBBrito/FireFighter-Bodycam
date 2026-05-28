<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

import { API_BASE_URL } from '@/config/env'

const firefighters = ref([])
const router = useRouter()
const loading = ref(true)

onMounted(async () => {
    try {
        const res = await fetch('https://localhost:7096/api/User/firefighters')
        const all = await res.json()
        firefighters.value = all
    } catch (e) {
        console.error('Failed to fetch firefighters:', e)
    } finally {
        loading.value = false
    }
})

const viewMissionHistory = (firefighter) => {
    router.push({
        name: 'MissionHistoryView',
        params: { userId: firefighter.userId, firefighterId: firefighter.firefighterId }
    })
}

</script>

<template>
    <div class="p-6 flex flex-col gap-4">
        <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold">Firefighters</h1>
        </div>

        <div v-if="loading" class="text-muted-foreground text-sm">Loading...</div>

        <div v-else-if="firefighters.length === 0" class="text-muted-foreground text-sm">
            No firefighters found.
        </div>

        <Table v-else>
            <TableHeader>
                <TableRow>
                    <TableHead>Firefighter</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead class="text-right">View Mission History</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="firefighter in firefighters" :key="firefighter.userId">
                    <TableCell class="font-medium">{{ firefighter.name }}</TableCell>
                    <TableCell>{{ firefighter.role }}</TableCell>
                    <TableCell class="text-right">
                        <Button size="sm" @click="viewMissionHistory(firefighter)">
                            View History
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </div>
</template>