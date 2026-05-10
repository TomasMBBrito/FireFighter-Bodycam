<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const route = useRoute()

const selectedFirefighters = computed(() => {
    const ids = route.query.ids ? route.query.ids.split(',') : []
    const names = route.query.names ? route.query.names.split(',') : []
    return ids.map((id, i) => ({ id, name: names[i] ?? id }))
})
</script>

<template>
    <div class="p-6 flex flex-col items-center gap-4">
        <Card class="w-full max-w-3xl">
            <CardHeader>
                <CardTitle>Live — {{ selectedFirefighters.length }} firefighter(s)</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-wrap gap-2">
                <Badge v-for="ff in selectedFirefighters" :key="ff.id" variant="secondary">
                    {{ ff.name }}
                </Badge>
            </CardContent>
        </Card>
    </div>
</template>