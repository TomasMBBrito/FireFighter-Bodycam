<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { API_BASE_URL } from '@/config/env'

const router = useRouter()
const name = ref('')
const location = ref('')

const submit = async () => {
    const res = await fetch(`${API_BASE_URL}/api/Station`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name.value,
            location: location.value
        })
    })

    if (res.ok) {
        router.push('/stations')
    }
}
</script>

<template>
    <div class="max-w-lg mx-auto mt-10 flex flex-col gap-4">
        <h1 class="text-2xl font-semibold">New Station</h1>
        <Input v-model="name" placeholder="Name" />
        <Input v-model="location" placeholder="Location" />
        <Button @click="submit">Create Station</Button>
    </div>
</template>