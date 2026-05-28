<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

const footage = ref([])
const route = useRoute()
const loading = ref(true)

const missionId = route.params.missionId
const firefighterId = route.params.firefighterId

console.log('FootageView params', route.params)

onMounted(async () => {
    try {
        const res = await fetch(`http://localhost:9996/list?path=${missionId}/${firefighterId}`)
        const footage = await res.json()
        footage.value = footage
        console.log('Footage for mission', missionId, footage.value)
    } catch (e) {
        console.error('Failed to fetch footage:', e)
    } finally {
        loading.value = false
    }
})
</script>

<template>
</template>