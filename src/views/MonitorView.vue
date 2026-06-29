<script setup>
import { computed, onUnmounted } from 'vue'
import FirefighterCard from '@/components/FireFighterCard.vue'
import { useMonitorStore } from '@/stores/monitor'
import { useTelemetryStore } from '@/stores/telemetry'

const monitorStore = useMonitorStore()
const telemetryStore = useTelemetryStore()
monitorStore.createStreamURLs()

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

onUnmounted(() => {
  telemetryStore.disconnectAll()
  monitorStore.reset()
})
</script>

<template>
  <div class="min-h-screen bg-[#0D1526] p-6 flex flex-col gap-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-white">Live Cameras</h1>
      <span class="text-xs text-slate-500">
        {{ monitorStore.firefightersList.length }} stream{{ monitorStore.firefightersList.length !== 1 ? 's' : '' }} active
      </span>
    </div>

    <!-- Grid -->
    <div
      class="grid gap-3 w-full items-start"
      :style="gridStyle"
    >
      <FirefighterCard
        v-for="(ff, index) in monitorStore.firefightersList"
        :key="ff.firefighterId"
        :firefighter="ff"
        :stream-path="monitorStore.streamURLs[index]"
        class="w-full"
      />
    </div>

  </div>
</template>