<!-- components/NavBar.vue -->
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()

const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Missions', path: '/missions' },
    { label: 'Firefighters', path: '/firefighters' },
]
</script>

<template>
    <nav class="w-full border-b bg-background px-6 py-3 flex items-center justify-between">
        <span class="font-bold text-lg"></span>

        <div class="flex gap-2">
            <Button v-for="link in links" :key="link.path" :variant="route.path === link.path ? 'default' : 'ghost'"
                @click="router.push(link.path)">
                {{ link.label }}
            </Button>
        </div>
    </nav>
</template>