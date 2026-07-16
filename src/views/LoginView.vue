<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const result = await api.post('/api/user/login', {
      username: username.value,
      password: password.value,
    })

    authStore.setSession(result.token, {
      userId: result.userId,
      name: result.name,
      role: result.role,
    })

    router.push('/')
  } catch (err) {
    error.value = err.message || 'Credenciais inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center h-screen bg-[#0D1526] px-4">
    <Card class="w-full max-w-sm bg-[#0F1A2E] border border-[#1E3A5F]">
      <CardHeader class="flex flex-col items-center gap-2 pb-2">
        <h1 class="text-lg font-semibold text-white">Firefighter Operational Center</h1>
        <p class="text-sm text-slate-500">Start session to enter</p>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4 pt-2">
          <div class="flex flex-col gap-1.5">
            <Label for="username" class="text-xs text-slate-400">Username</Label>
            <Input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              required
              class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-700"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <Label for="password" class="text-xs text-slate-400">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="bg-[#162035] border-[#1E3A5F] text-slate-200 placeholder:text-slate-600 focus-visible:ring-blue-700"
            />
          </div>

          <p v-if="error" class="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
            {{ error }}
          </p>

          <Button
            type="submit"
            :disabled="loading"
            class="w-full h-10 mt-1 bg-blue-700 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Loggin in...' : 'Login' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>