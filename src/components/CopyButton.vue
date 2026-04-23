<template>
  <button
    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
    :class="copied
      ? 'bg-green-500 text-white'
      : 'bg-primary text-white hover:bg-primary-light active:scale-95'"
    @click="copy(text)"
    :title="copied ? '已复制' : '复制'">
    <Check v-if="copied" :size="16" />
    <Copy v-else :size="16" />
    <span>{{ copied ? '已复制' : '复制' }}</span>
  </button>
</template>

<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next'
import { useCopyToClipboard } from '../composables/useCopyToClipboard'

defineProps<{ text: string }>()
const { copied, copy } = useCopyToClipboard()
</script>
