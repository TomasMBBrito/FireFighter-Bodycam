<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { API_BASE_URL } from '@/config/env'

const router = useRouter()
const stations = ref([])

const loadStations = async () => {
    const res = await fetch(`${API_BASE_URL}/api/Station`)
    stations.value = await res.json()
}

loadStations()
</script>

<template>
    <div class="p-6 flex flex-col items-center gap-4">
        <Card class="w-full max-w-3xl">
            <CardHeader class="flex flex-row items-center justify-between">
                <CardTitle>Stations</CardTitle>
                <Button @click="router.push('/stations/create')">
                    Create Station
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="station in stations" :key="station.stationId">
                            <TableCell class="font-medium">{{ station.name }}</TableCell>
                            <TableCell>{{ station.location }}</TableCell>
                        </TableRow>
                        <TableRow v-if="stations.length === 0">
                            <TableCell colspan="2" class="text-center text-muted-foreground py-8">
                                No stations found.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
</template>