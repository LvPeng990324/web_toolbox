<template>
  <header class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 md:px-6 border-b"
    :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', backdropFilter: 'blur(12px)' }">
    <div class="flex items-center gap-3">
      <button v-if="showBack" @click="$router.push('/')"
        class="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer">
        <ArrowLeft :size="20" />
      </button>
      <router-link to="/" class="flex items-center gap-2 no-underline">
        <LayoutGrid :size="22" class="text-primary" />
        <span class="font-semibold text-base hidden sm:inline" :style="{ color: 'var(--text-primary)' }">
          Web Toolbox
        </span>
      </router-link>
    </div>

    <div class="flex items-center gap-2">
      <button @click="toggleTheme"
        class="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
        :title="isDark ? '切换浅色' : '切换深色'">
        <Moon v-if="!isDark" :size="20" />
        <Sun v-else :size="20" />
      </button>
    </div>
  </header>

  <!-- Toast -->
  <div class="fixed top-16 right-4 z-[100] flex flex-col gap-2">
    <transition-group name="toast">
      <div v-for="t in toasts" :key="t.id"
        class="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary shadow-lg">
        {{ t.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Sun, Moon, ArrowLeft, LayoutGrid } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import { useToastProvider } from '../composables/useToast'

const { isDark, initTheme, toggleTheme } = useTheme()
initTheme()

const { toasts } = useToastProvider()

const route = useRoute()
const showBack = computed(() => route.path !== '/')
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
