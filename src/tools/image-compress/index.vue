<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">图片压缩</h2>

    <!-- Upload Area -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">上传图片</label>
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary"
        :style="{ borderColor: 'var(--border)' }"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerFileInput">
        <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
        <Upload :size="32" class="mx-auto mb-2" :style="{ color: 'var(--text-muted)' }" />
        <p :style="{ color: 'var(--text-secondary)' }">点击或拖拽图片到此处</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">支持 JPG、PNG、GIF、WebP</p>
      </div>
    </div>

    <!-- Image Info -->
    <div v-if="image" class="mb-4 p-3 rounded-lg flex items-center gap-3" :style="{ backgroundColor: 'var(--surface)' }">
      <img :src="image.dataUrl" class="w-12 h-12 object-cover rounded" />
      <div class="flex-1">
        <p class="text-sm font-medium truncate" :style="{ color: 'var(--text-primary)' }">{{ image.file.name }}</p>
        <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">
          {{ image.width }} × {{ image.height }} | {{ formatSize(image.file.size) }}
        </p>
      </div>
      <button @click="clear" class="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded">
        <X :size="16" :style="{ color: 'var(--text-muted)' }" />
      </button>
    </div>

    <!-- Options -->
    <div class="mb-6 p-4 rounded-xl space-y-4" :style="{ backgroundColor: 'var(--surface)' }">
      <div>
        <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">压缩模式</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="options.mode" value="percentage" class="accent-primary" />
            <span class="text-sm" :style="{ color: 'var(--text-primary)' }">按百分比</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="options.mode" value="target" class="accent-primary" />
            <span class="text-sm" :style="{ color: 'var(--text-primary)' }">按目标大小</span>
          </label>
        </div>
      </div>

      <div v-if="options.mode === 'percentage'">
        <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">
          压缩比例: {{ options.percentage }}%
        </label>
        <input type="range" v-model.number="options.percentage" min="10" max="100" step="5" class="w-full accent-primary" />
        <div class="flex justify-between text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
          <span>10%</span><span>100%</span>
        </div>
      </div>

      <div v-else>
        <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">
          目标大小: {{ options.targetSize }} KB
        </label>
        <input type="range" v-model.number="options.targetSize" min="50" max="5000" step="50" class="w-full accent-primary" />
        <div class="flex justify-between text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
          <span>50 KB</span><span>5 MB</span>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button @click="compress" :disabled="!image || isProcessing" class="btn btn-primary">
        <Loader2 :size="16" class="mr-1.5 animate-spin" v-if="isProcessing" />
        <Shrink :size="16" class="mr-1.5" v-else />
        {{ isProcessing ? '压缩中...' : '开始压缩' }}
      </button>
      <button @click="clear" class="btn btn-ghost">
        <Trash2 :size="16" class="mr-1.5" />清空
      </button>
    </div>

    <!-- Preview -->
    <div v-if="previewUrl && image" class="mt-6">
      <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">预览</label>
      <div class="rounded-lg overflow-hidden border" :style="{ borderColor: 'var(--border)' }">
        <img :src="previewUrl" class="max-w-full h-auto" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Shrink, Trash2, Loader2, X } from 'lucide-vue-next'
import { useImageCompress } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)
const { image, previewUrl, isProcessing, error, options, handleFileSelect, handleDrop, clear, compress, formatSize } = useImageCompress()

const triggerFileInput = () => fileInputRef.value?.click()
</script>

<style scoped>
.btn { @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all; }
.btn-primary { @apply bg-primary text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-ghost { color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(0,0,0,0.05); }
.dark .btn-ghost:hover { background: rgba(255,255,255,0.1); }
</style>
