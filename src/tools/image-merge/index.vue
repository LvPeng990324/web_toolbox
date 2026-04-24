<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">图片拼接</h2>

    <!-- Upload Area -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">上传图片（至少2张）</label>
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary"
        :style="{ borderColor: 'var(--border)' }"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerFileInput">
        <input ref="fileInputRef" type="file" accept="image/*" multiple class="hidden" @change="handleFileSelect" />
        <Upload :size="32" class="mx-auto mb-2" :style="{ color: 'var(--text-muted)' }" />
        <p :style="{ color: 'var(--text-secondary)' }">点击或拖拽图片到此处</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">支持 JPG、PNG、GIF、WebP</p>
      </div>
    </div>

    <!-- Image List -->
    <div v-if="images.length > 0" class="mb-6">
      <div class="flex flex-wrap gap-3">
        <div v-for="(img, index) in images" :key="index" class="relative group">
          <img :src="img.dataUrl" class="w-20 h-20 object-cover rounded-lg" />
          <button
            @click="removeImage(index)"
            class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            ×
          </button>
          <span class="absolute -bottom-1 -left-1 bg-black/60 text-white text-xs px-1 rounded">
            {{ index + 1 }}
          </span>
        </div>
      </div>
      <p class="text-xs mt-2" :style="{ color: 'var(--text-muted)' }">共 {{ images.length }} 张图片</p>
    </div>

    <!-- Options -->
    <div class="mb-6 p-4 rounded-xl space-y-4" :style="{ backgroundColor: 'var(--surface)' }">
      <div>
        <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">拼接方向</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="direction" value="horizontal" class="accent-primary" />
            <span class="text-sm" :style="{ color: 'var(--text-primary)' }">水平拼接</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="direction" value="vertical" class="accent-primary" />
            <span class="text-sm" :style="{ color: 'var(--text-primary)' }">垂直拼接</span>
          </label>
        </div>
      </div>

      <div>
        <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">
          图片间距: {{ gap }} px
        </label>
        <input type="range" v-model.number="gap" min="0" max="50" step="1" class="w-full accent-primary" />
      </div>

      <div>
        <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">背景颜色</label>
        <input type="color" v-model="bgColor" class="w-12 h-8 rounded cursor-pointer" />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button @click="merge" :disabled="images.length < 2 || isProcessing" class="btn btn-primary">
        <Loader2 :size="16" class="mr-1.5 animate-spin" v-if="isProcessing" />
        <GalleryHorizontalEnd :size="16" class="mr-1.5" v-else />
        {{ isProcessing ? '拼接中...' : '开始拼接' }}
      </button>
      <button @click="clear" class="btn btn-ghost">
        <Trash2 :size="16" class="mr-1.5" />清空
      </button>
    </div>

    <!-- Preview -->
    <div v-if="previewUrl && images.length >= 2" class="mt-6">
      <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">预览</label>
      <div class="rounded-lg overflow-hidden border" :style="{ borderColor: 'var(--border)' }">
        <img :src="previewUrl" class="max-w-full h-auto" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, GalleryHorizontalEnd, Trash2, Loader2 } from 'lucide-vue-next'
import { useImageMerge } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)
const { images, previewUrl, isProcessing, error, direction, gap, bgColor, handleFileSelect, handleDrop, removeImage, clear, merge } = useImageMerge()

const triggerFileInput = () => fileInputRef.value?.click()
</script>

<style scoped>
.btn { @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all; }
.btn-primary { @apply bg-primary text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-ghost { color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(0,0,0,0.05); }
.dark .btn-ghost:hover { background: rgba(255,255,255,0.1); }
</style>
