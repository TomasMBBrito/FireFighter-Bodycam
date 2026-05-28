<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const router = useRouter()
const firefighters = ref([])
const selected = ref([])


const loadFirefighters = async () => {
    const res = await fetch(`https://localhost:7096/api/User/firefighters`)
    console.log(res)

    firefighters.value = await res.json()
    console.log(firefighters.value)
}

const toggle = (ff) => {
    const idx = selected.value.findIndex(f => f.firefighterId === ff.firefighterId)
    if (idx === -1) selected.value.push(ff)
    else selected.value.splice(idx, 1)
}

const isSelected = (ff) => selected.value.some(f => f.firefighterId === ff.firefighterId)

const goToWatchLive = () => {
    router.push({
        path: '/firefighters/live',
        query: { 
            ids: selected.value.map(f => f.role === "Vehicle" ? f.userId : f.firefighterId).join(','), 
            names : selected.value.map(f => f.name).join(',') 
        }
    })
}

loadFirefighters()
</script>
<template>
    <div class="p-6 flex flex-col items-center gap-4">
        <Card class="w-full max-w-3xl">
            <CardHeader class="flex flex-row items-center justify-between">
                <CardTitle>Firefighters</CardTitle>
                <Button
                    :disabled="selected.length === 0"
                    @click="goToWatchLive">
                    Watch Live ({{ selected.length }})
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead class="w-10"></TableHead>
                            <TableHead>Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow
                            v-for="ff in firefighters"
                            :key="ff.firefighterId"
                            class="cursor-pointer"
                            @click="toggle(ff)">
                            <TableCell>
                                <Checkbox :checked="isSelected(ff)" />
                            </TableCell>
                            <TableCell class="font-medium">{{ ff.name }}</TableCell>
                        </TableRow>
                        <TableRow v-if="firefighters.length === 0">
                            <TableCell colspan="2" class="text-center text-muted-foreground py-8">
                                No firefighters found.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
</template>