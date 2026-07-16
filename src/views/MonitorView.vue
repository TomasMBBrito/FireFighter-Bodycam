<script setup>
import { ref,computed, onUnmounted } from 'vue'
import FirefighterCard from '@/components/FireFighterCard.vue'
import OverviewMap from '@/components/OverviewMap.vue'
import { useMonitorStore } from '@/stores/monitor'
import { useTelemetryStore } from '@/stores/telemetry'

const monitorStore = useMonitorStore()
const telemetryStore = useTelemetryStore()
monitorStore.createStreamURLs()

const selectedFirefighterId = ref(null)

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

const missionCenter = computed(() => {
  const m = monitorStore.mission
  console.log('missionCenter', m)
  if (!m) return null

  const lat = m.latitude ?? m.Latitude
  const lng = m.longitude ?? m.Longitude

  if (lat == null || lng == null) return null

  return { lat, lng }
})

const handleSelect = (firefighterId) => {
  selectedFirefighterId.value = selectedFirefighterId.value === firefighterId
    ? null
    : firefighterId
}


onUnmounted(() => {
  telemetryStore.disconnectAll()
  monitorStore.reset()
})
</script>

<template>
  <div class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-5">

    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Live Cameras</h1>
      <span class="text-xs text-slate-500">
        {{ monitorStore.firefightersList.length }} stream{{ monitorStore.firefightersList.length !== 1 ? 's' : '' }} active
      </span>
    </div>

    <OverviewMap
      :firefighters="monitorStore.firefightersList"
      :selected-id="selectedFirefighterId"
      :mission-center="missionCenter"
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