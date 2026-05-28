<script setup>
import { ref } from 'vue'
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

const submit = async () => {
    const payload = {
        username: username.value,
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value
    }

    console.log('Sending:', payload)

    const res = await fetch(`${API_BASE_URL}/api/User`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    const data = await res.json()
    console.log('Response:', data)

    if (res.ok) {
        router.push('/')
    }
}
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

        <Button @click="submit">Create User</Button>

    </div>
</template>