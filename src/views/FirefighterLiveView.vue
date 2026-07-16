<script setup>
import { computed, onMounted, onUnmounted,ref } from 'vue'
import { useRoute } from 'vue-router'
import FirefighterCard from '@/components/FireFighterCard.vue'
import OverviewMap from '@/components/OverviewMap.vue'
import { useMonitorStore } from '@/stores/monitor'
import { useTelemetryStore } from '@/stores/telemetry'

const route = useRoute()
const monitorStore = useMonitorStore()
const telemetryStore = useTelemetryStore()

const selectedFirefighterId = ref(null)

const selectedFirefighters = computed(() => {
  const ids = route.query.ids ? route.query.ids.split(',') : []
  const names = route.query.names ? route.query.names.split(',') : []
  return ids.map((id, i) => ({ firefighterId: id, name: names[i] ?? id }))
})

const gridCols = computed(() => {
  const n = monitorStore.streamURLs.length
  if (n === 1) return 1
  if (n <= 4) return 2
  if (n <= 9) return 3
  return 4
})
 
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridCols.value}, minmax(0, 1fr))`
}))

const handleSelect = (firefighterId) => {
  selectedFirefighterId.value = selectedFirefighterId.value === firefighterId
    ? null
    : firefighterId
}


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
 
    <OverviewMap
      :firefighters="monitorStore.firefightersList"
      :selected-id="selectedFirefighterId"
      :mission-center=null
      @select="handleSelect"
    />
 
    <div
      class="grid gap-3 w-full items-start"
      :style="gridStyle"
    >
      <FirefighterCard
        v-for="(ff, index) in monitorStore.firefightersList"
        :key="ff.firefighterId"
        :firefighter="ff"
        :stream-path="monitorStore.streamURLs[index]"
        :selected="selectedFirefighterId === ff.firefighterId"
        class="w-full"
      />
    </div>
 
  </div>
</template>
