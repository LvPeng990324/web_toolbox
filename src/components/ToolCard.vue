<template>
  <router-link :to="`/tool/${tool.id}`"
    class="surface-card group p-5 flex flex-col gap-3 no-underline cursor-pointer
      hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
    <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <component :is="iconComponent" :size="22" class="text-primary" />
    </div>
    <div>
      <h3 class="font-semibold text-[15px] mb-1" :style="{ color: 'var(--text-primary)' }">{{ tool.name }}</h3>
      <p class="text-sm leading-relaxed" :style="{ color: 'var(--text-secondary)' }">{{ tool.description }}</p>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Braces, Clock, Lock, GitCompareArrows, Regex } from 'lucide-vue-next'
import type { ToolMeta } from '../types/tool'

const props = defineProps<{ tool: ToolMeta }>()

const iconMap: Record<string, Component> = {
  Braces, Clock, Lock, GitCompareArrows, Regex,
}

const iconComponent = computed(() => iconMap[props.tool.icon] || Braces)
</script>
