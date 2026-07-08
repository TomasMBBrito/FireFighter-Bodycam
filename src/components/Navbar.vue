<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

const links = [
    { label: 'Map', path: '/' },
    { label: 'Missions', path: '/missions' },
    { label: 'Firefighters', path: '/firefighters' },
    { label: 'Stations', path: '/stations' },
    { label: 'History', path: '/history' },
]
</script>

<template>
    <nav class="w-full border-b border-[#1E3A5F] bg-[#0D1526] px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <span class="text-red-500 text-xl">🔥</span>
            <span class="font-semibold text-white text-sm tracking-wide">Fire Monitor</span>
        </div>

        <div class="flex gap-1">
            <Button
                v-if="authStore.isLoggedIn"
                variant="ghost"
                class="text-slate-300 bg-[#ad1010] hover:text-white hover:bg-[#760f0f] cursor-pointer mr-3"
                @click="handleLogout"
                >
                Logout
            </Button>
            <Button
                v-for="link in links"
                :key="link.path"
                :variant="route.path === link.path ? 'default' : 'ghost'"
                class="text-sm transition-colors"
                :class="route.path === link.path
                    ? 'bg-blue-700 hover:bg-blue-600 text-white cursor-pointer'
                    : 'text-slate-400 hover:text-white hover:bg-[#162035] cursor-pointer'"
                @click="router.push(link.path)"
            >
                {{ link.label }}
            </Button>

            

            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button
                        v-if="authStore.role === 'Admin'"
                        variant="ghost"
                        class="text-sm text-slate-400 hover:text-white hover:bg-[#162035] transition-colors cursor-pointer"
                    >
                        + Create
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    class="bg-[#0D1526] border border-[#1E3A5F] text-slate-300"
                >
                    <DropdownMenuItem
                        class="hover:bg-[#162035] hover:text-white cursor-pointer"
                        @click="router.push('/missions/create')"
                    >
                        Create Mission
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        class="hover:bg-[#162035] hover:text-white cursor-pointer"
                        @click="router.push('/users/create')"
                    >
                        Create User
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        class="hover:bg-[#162035] hover:text-white cursor-pointer"
                        @click="router.push('/stations/create')"
                    >
                        Create Station
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </nav>
</template>