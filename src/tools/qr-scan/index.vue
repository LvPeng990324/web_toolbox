<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">扫描二维码</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：上传 -->
      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">上传二维码图片</label>
        <div
          class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary"
          :style="{ borderColor: 'var(--border)' }"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput">
          <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />
          <Upload :size="32" class="mx-auto mb-2" :style="{ color: 'var(--text-muted)' }" />
          <p :style="{ color: 'var(--text-secondary)' }">点击或拖拽二维码图片到此处</p>
          <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">支持 JPG、PNG、GIF、BMP 等格式</p>
        </div>

        <!-- 图片预览 -->
        <div v-if="image" class="mt-4 p-3 rounded-lg flex items-center gap-3" :style="{ backgroundColor: 'var(--surface)' }">
          <img :src="image.dataUrl" class="w-16 h-16 object-contain rounded" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" :style="{ color: 'var(--text-primary)' }">{{ image.file.name }}</p>
            <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">{{ formatSize(image.file.size) }}</p>
          </div>
          <button @click="clear" class="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded cursor-pointer">
            <X :size="16" :style="{ color: 'var(--text-muted)' }" />
          </button>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          <AlertCircle :size="16" class="inline mr-1.5" /> {{ error }}
        </div>
      </div>

      <!-- 右侧：扫描结果 -->
      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">扫描结果</label>
        <div v-if="result" class="surface-card p-5">
          <div class="mb-3">
            <span class="text-xs font-medium px-2 py-0.5 rounded-full"
              :class="isUrl ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'">
              {{ isUrl ? '链接' : '文本' }}
            </span>
          </div>
          <div class="p-3 rounded-lg text-sm break-all font-mono leading-relaxed"
            :style="{ backgroundColor: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--border)' }">
            {{ result }}
          </div>
          <div class="flex gap-3 mt-4">
            <CopyButton :text="result" />
            <a v-if="isUrl" :href="result" target="_blank" rel="noopener noreferrer"
              class="btn btn-primary inline-flex items-center no-underline">
              <ExternalLink :size="16" class="mr-1.5" /> 打开链接
            </a>
            <button @click="clear" class="btn btn-ghost">
              <Trash2 :size="16" class="mr-1.5" /> 清空
            </button>
          </div>
        </div>
        <div v-else class="surface-card p-12 flex flex-col items-center" :style="{ color: 'var(--text-muted)' }">
          <ScanLine :size="48" class="mb-3 opacity-30" />
          <p class="text-sm">上传二维码图片后自动识别</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, X, ScanLine, AlertCircle, ExternalLink, Trash2 } from 'lucide-vue-next'
import CopyButton from '../../components/CopyButton.vue'
import { useQrScan } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)
const { image, result, error, isProcessing, handleFileSelect, handleDrop, clear } = useQrScan()

const triggerFileInput = () => fileInputRef.value?.click()

const isUrl = computed(() => {
  if (!result.value) return false
  try {
    const url = new URL(result.value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
})

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all;
}
.btn-primary {
  @apply bg-primary text-white hover:bg-primary-light;
}
.btn-ghost {
  color: var(--text-secondary);
}
.btn-ghost:hover {
  background: rgba(0,0,0,0.05);
}
.dark .btn-ghost:hover {
  background: rgba(255,255,255,0.1);
}
</style>
