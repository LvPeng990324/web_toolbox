<template>
  <div class="pt-14 min-h-screen">
    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <component :is="toolComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { toolMap } from '../tools'

const props = defineProps<{ id: string }>()

const toolComponent = computed(() => {
  const tool = toolMap.get(props.id)
  if (!tool) return defineAsyncComponent(() => import('../views/NotFound.vue'))
  return defineAsyncComponent(() => import(`../tools/${props.id}/index.vue`))
})
</script>
