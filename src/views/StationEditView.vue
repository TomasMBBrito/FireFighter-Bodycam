<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { API_BASE_URL } from '@/config/env'

const route = useRoute()
const router = useRouter()

const stationId = route.params.id
const name = ref('')
const location = ref('')
const firefighterCount = ref(0)
const loading = ref(true)

const loadStation = async () => {
    const res = await fetch(`${API_BASE_URL}/api/Station/${stationId}`)
    const data = await res.json()
    name.value = data.name
    location.value = data.location
    firefighterCount.value = data.firefighterCount
    loading.value = false
}

const submit = async () => {
    const res = await fetch(`${API_BASE_URL}/api/Station/${stationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.value, location: location.value })
    })

    if (res.ok)
        router.push('/stations')
}

onMounted(loadStation)
</script>

<template>
    <div class="max-w-lg mx-auto mt-10 flex flex-col gap-6" v-if="!loading">
        <Card>
            <CardHeader>
                <CardTitle>Edit Station</CardTitle>
                <Badge variant="secondary">
                    {{ firefighterCount }} firefighter{{ firefighterCount !== 1 ? 's' : '' }} associated
                </Badge>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <Label>Name</Label>
                    <Input v-model="name" placeholder="Name" />
                </div>
                <div class="flex flex-col gap-1">
                    <Label>Location</Label>
                    <Input v-model="location" placeholder="Location" />
                </div>
                <Button @click="submit">Save Changes</Button>
            </CardContent>
        </Card>
    </div>
</template>