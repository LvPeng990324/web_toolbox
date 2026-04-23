<template>
  <div class="pt-14 min-h-screen">
    <div class="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <!-- Hero -->
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-bold mb-3" :style="{ color: 'var(--text-primary)' }">
          Web Toolbox
        </h1>
        <p class="text-base" :style="{ color: 'var(--text-secondary)' }">
          简洁高效的在线开发工具集，所有计算均在浏览器本地完成
        </p>
      </div>

      <!-- Search -->
      <div class="max-w-md mx-auto mb-8 relative">
        <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2" :style="{ color: 'var(--text-muted)' }" />
        <input v-model="keyword" type="text" placeholder="搜索工具..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          :style="{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }" />
      </div>

      <!-- Categories -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button v-for="cat in categories" :key="cat"
          class="px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer"
          :class="activeCategory === cat
            ? 'bg-primary text-white'
            : 'hover:bg-black/5 dark:hover:bg-white/10'"
          :style="activeCategory !== cat ? { color: 'var(--text-secondary)' } : {}"
          @click="activeCategory = cat">
          {{ cat }}
        </button>
      </div>

      <!-- Tool Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ToolCard v-for="tool in filteredTools" :key="tool.id" :tool="tool" />
      </div>

      <!-- Footer -->
      <footer class="mt-16 text-center text-sm pb-8" :style="{ color: 'var(--text-muted)' }">
        <p>Web Toolbox &copy; {{ new Date().getFullYear() }} &mdash; 所有工具均在浏览器本地运行</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'
import ToolCard from '../components/ToolCard.vue'
import { tools } from '../tools'

const keyword = ref('')
const activeCategory = ref('全部')

const categories = computed(() => {
  const cats = [...new Set(tools.map(t => t.category))]
  return ['全部', ...cats]
})

const filteredTools = computed(() => {
  let list = tools
  if (activeCategory.value !== '全部') {
    list = list.filter(t => t.category === activeCategory.value)
  }
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter(t =>
      t.name.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw)
    )
  }
  return list
})
</script>
