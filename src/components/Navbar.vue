<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const route = useRoute()
const router = useRouter()

const links = [
    { label: 'Map', path: '/' },
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

            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="ghost">Create</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="router.push('/missions/create')">
                        Create Mission
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="router.push('/users/create')">
                        Create User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </nav>
</template>