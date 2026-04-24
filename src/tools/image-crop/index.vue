<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">图片裁切</h2>

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
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" v-model="unit" value="percent" class="accent-primary" />
          <span class="text-sm" :style="{ color: 'var(--text-primary)' }">百分比</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="radio" v-model="unit" value="pixel" class="accent-primary" />
          <span class="text-sm" :style="{ color: 'var(--text-primary)' }">像素</span>
        </label>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium mb-1 block" :style="{ color: 'var(--text-secondary)' }">
            X {{ unit === 'percent' ? '(%)' : '(px)' }}
          </label>
          <input type="number" v-model.number="cropArea.x" min="0" :max="unit === 'percent' ? 100 : image?.width || 100" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block" :style="{ color: 'var(--text-secondary)' }">
            Y {{ unit === 'percent' ? '(%)' : '(px)' }}
          </label>
          <input type="number" v-model.number="cropArea.y" min="0" :max="unit === 'percent' ? 100 : image?.height || 100" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block" :style="{ color: 'var(--text-secondary)' }">
            宽度 {{ unit === 'percent' ? '(%)' : '(px)' }}
          </label>
          <input type="number" v-model.number="cropArea.width" min="1" :max="unit === 'percent' ? 100 : image?.width || 100" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium mb-1 block" :style="{ color: 'var(--text-secondary)' }">
            高度 {{ unit === 'percent' ? '(%)' : '(px)' }}
          </label>
          <input type="number" v-model.number="cropArea.height" min="1" :max="unit === 'percent' ? 100 : image?.height || 100" class="input-field" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button @click="crop" :disabled="!image || isProcessing" class="btn btn-primary">
        <Loader2 :size="16" class="mr-1.5 animate-spin" v-if="isProcessing" />
        <Crop :size="16" class="mr-1.5" v-else />
        {{ isProcessing ? '裁切中...' : '开始裁切' }}
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
import { Upload, Crop, Trash2, Loader2, X } from 'lucide-vue-next'
import { useImageCrop } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)
const { image, previewUrl, isProcessing, error, unit, cropArea, handleFileSelect, handleDrop, clear, crop, formatSize } = useImageCrop()

const triggerFileInput = () => fileInputRef.value?.click()
</script>

<style scoped>
.btn { @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all; }
.btn-primary { @apply bg-primary text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-ghost { color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(0,0,0,0.05); }
.dark .btn-ghost:hover { background: rgba(255,255,255,0.1); }
.input-field { @apply w-full px-3 py-2 rounded-lg text-sm outline-none; background-color: var(--surface); border: 1px solid var(--border); color: var(--text-primary); }
.input-field:focus { border-color: var(--primary); }
</style>
