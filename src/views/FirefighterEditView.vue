<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { API_BASE_URL } from '@/config/env'

const route = useRoute()
const router = useRouter()

const userId = route.params.id
const name = ref('')
const email = ref('')
const stationId = ref(null)
const stations = ref([])
const loading = ref(true)

const loadData = async () => {
    const [userRes, stationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/User/${userId}`),
        fetch(`${API_BASE_URL}/api/Station`)
    ])

    const user = await userRes.json()
    stations.value = await stationsRes.json()

    name.value = user.name
    email.value = user.email
    stationId.value = user.stationId ?? null

    loading.value = false
}

const submit = async () => {
    const res = await fetch(`${API_BASE_URL}/api/User/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name.value,
            email: email.value,
            stationId: stationId.value
        })
    })

    if (res.ok)
        router.push('/firefighters')
}

onMounted(loadData)
</script>

<template>
    <div class="max-w-lg mx-auto mt-10 flex flex-col gap-6" v-if="!loading">
        <Card>
            <CardHeader>
                <CardTitle>Edit Firefighter</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <Label>Name</Label>
                    <Input v-model="name" placeholder="Name" />
                </div>

                <div class="flex flex-col gap-1">
                    <Label>Email</Label>
                    <Input v-model="email" placeholder="Email" />
                </div>

                <Separator />

                <div class="flex flex-col gap-1">
                    <Label>Station</Label>
                    <select v-model="stationId" class="w-full border rounded px-3 py-2 bg-background text-sm">
                        <option :value="null" disabled>Select Station</option>
                        <option v-for="s in stations" :key="s.id" :value="s.id">
                            {{ s.name }}
                        </option>
                    </select>
                </div>

                <Button @click="submit">Save Changes</Button>
            </CardContent>
        </Card>
    </div>
</template>