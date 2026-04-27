<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">视频音频提取</h2>

    <!-- Upload Area -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">上传视频</label>
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary"
        :style="{ borderColor: 'var(--border)' }"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerFileInput">
        <input ref="fileInputRef" type="file" accept="video/*" class="hidden" @change="handleFileSelect" />
        <Upload :size="32" class="mx-auto mb-2" :style="{ color: 'var(--text-muted)' }" />
        <p :style="{ color: 'var(--text-secondary)' }">点击或拖拽视频到此处</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">支持 MP4、AVI、MOV、WEBM 等格式</p>
      </div>
    </div>

    <!-- Video Info -->
    <div v-if="video" class="mb-4 p-3 rounded-lg flex items-center gap-3" :style="{ backgroundColor: 'var(--surface)' }">
      <div class="w-12 h-12 rounded flex items-center justify-center" :style="{ backgroundColor: 'var(--border)' }">
        <Film :size="20" :style="{ color: 'var(--text-secondary)' }" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate" :style="{ color: 'var(--text-primary)' }">{{ video.file.name }}</p>
        <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">
          时长: {{ formatDuration(video.duration) }} | {{ formatSize(video.file.size) }}
        </p>
      </div>
      <button @click="clear" class="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded">
        <X :size="16" :style="{ color: 'var(--text-muted)' }" />
      </button>
    </div>

    <!-- Video Preview -->
    <div v-if="video" class="mb-6">
      <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">视频预览</label>
      <video :src="video.dataUrl" controls class="w-full max-h-64 rounded-lg" :style="{ backgroundColor: 'var(--surface)' }"></video>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button @click="extractAudio" :disabled="!video || isProcessing" class="btn btn-primary">
        <Loader2 :size="16" class="mr-1.5 animate-spin" v-if="isProcessing" />
        <Music :size="16" class="mr-1.5" v-else />
        {{ isProcessing ? '提取中...' : '提取音频' }}
      </button>
      <button @click="clear" class="btn btn-ghost">
        <Trash2 :size="16" class="mr-1.5" />清空
      </button>
    </div>

    <!-- Audio Preview -->
    <div v-if="audioUrl && video" class="mt-6">
      <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">提取的音频</label>
      <div class="p-4 rounded-xl" :style="{ backgroundColor: 'var(--surface)' }">
        <audio :src="audioUrl" controls class="w-full"></audio>
        <p class="text-xs mt-2 text-center" :style="{ color: 'var(--text-muted)' }">
          音频已自动下载为 WAV 格式
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Music, Trash2, Loader2, X, Film } from 'lucide-vue-next'
import { useVideoAudioExtract } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)
const { video, audioUrl, isProcessing, error, handleFileSelect, handleDrop, extractAudio, clear, formatSize, formatDuration } = useVideoAudioExtract()

const triggerFileInput = () => fileInputRef.value?.click()
</script>

<style scoped>
.btn { @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all; }
.btn-primary { @apply bg-primary text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-ghost { color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(0,0,0,0.05); }
.dark .btn-ghost:hover { background: rgba(255,255,255,0.1); }
</style>
