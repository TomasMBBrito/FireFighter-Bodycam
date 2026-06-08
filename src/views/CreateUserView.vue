<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue
} from '@/components/ui/select'
import { API_BASE_URL } from '@/config/env'

const router = useRouter()

const username = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('')

const stationId = ref(null)
const stations = ref([])

const needsStation = computed(() =>
    role.value === 'Firefighter' || role.value === 'Vehicle'
)

const loadStations = async () => {
    const res = await fetch(`${API_BASE_URL}/api/Station`)
    stations.value = await res.json()
    console.log('stations:', stations.value)
}

const submit = async () => {
    console.log('stationId:', stationId.value)
    const payload = {
        username: username.value,
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value,
        ...(needsStation.value && { stationId: stationId.value })
    }

    const res = await fetch(`${API_BASE_URL}/api/User`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (res.ok) {
        router.push('/firefighters')
    }
}

onMounted(loadStations)
</script>

<template>
    <div class="max-w-lg mx-auto mt-10 flex flex-col gap-4">
        <h1 class="text-2xl font-semibold">New User</h1>

        <Input v-model="username" placeholder="Username" />
        <Input v-model="name" placeholder="Name" />
        <Input v-model="email" placeholder="Email" />
        <Input v-model="password" placeholder="Password" type="password" />

        <Select v-model="role">
            <SelectTrigger>
                <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Commander">Commander</SelectItem>
                <SelectItem value="Monitor">Monitor</SelectItem>
                <SelectItem value="Firefighter">Firefighter</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
            </SelectContent>
        </Select>

        <Select v-if="needsStation" v-model="stationId" @update:modelValue="val => console.log('station selected:', val)">
            <SelectTrigger>
                <SelectValue placeholder="Station" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem v-for="s in stations" :key="s.id" :value="s.id">
                    {{ s.name }}
                </SelectItem>
            </SelectContent>
        </Select>

        <!-- <select v-if="needsStation" v-model="stationId" class="w-full border rounded px-3 py-2 bg-background text-sm">
            <option :value="null" disabled>Select Station</option>
            <option v-for="s in stations" :key="s.stationId" :value="s.stationId">
                {{ s.name }}
            </option>
        </select> -->

        <Button @click="submit">Create User</Button>

    </div>
</template>