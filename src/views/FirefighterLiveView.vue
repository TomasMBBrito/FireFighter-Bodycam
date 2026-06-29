<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import FirefighterCard from '@/components/FireFighterCard.vue'
import { useMonitorStore } from '@/stores/monitor'
import { useTelemetryStore } from '@/stores/telemetry'

const route = useRoute()
const monitorStore = useMonitorStore()
const telemetryStore = useTelemetryStore()

const selectedFirefighters = computed(() => {
  const ids = route.query.ids ? route.query.ids.split(',') : []
  const names = route.query.names ? route.query.names.split(',') : []
  return ids.map((id, i) => ({ firefighterId: id, name: names[i] ?? id }))
})

onMounted(async () => {
  monitorStore.selectFirefighters(selectedFirefighters.value, null)
  await monitorStore.createStreamURLsOnlyKnowFirefighters()
})

onUnmounted(() => {
  telemetryStore.disconnectAll()
  monitorStore.reset()
})
</script>

<template>
  <div class="p-6 flex flex-col gap-5">

    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Live</h1>
      <span class="text-xs text-slate-500">
        {{ selectedFirefighters.length }} firefighter{{ selectedFirefighters.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <div class="flex flex-wrap gap-3">
      <FirefighterCard
        v-for="(ff, index) in monitorStore.firefightersList"
        :key="ff.firefighterId"
        :firefighter="ff"
        :stream-path="monitorStore.streamURLs[index]"
      />
    </div>

  </div>
</template>