<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">音频格式转换</h2>

    <!-- Upload Area -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">上传音频</label>
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-primary"
        :style="{ borderColor: 'var(--border)' }"
        @dragover.prevent
        @drop.prevent="handleDrop"
        @click="triggerFileInput">
        <input ref="fileInputRef" type="file" accept="audio/*" class="hidden" @change="handleFileSelect" />
        <Upload :size="32" class="mx-auto mb-2" :style="{ color: 'var(--text-muted)' }" />
        <p :style="{ color: 'var(--text-secondary)' }">点击或拖拽音频到此处</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">支持 MP3、WAV、OGG、FLAC、AAC 等格式</p>
      </div>
    </div>

    <!-- Audio Info -->
    <div v-if="audioFile" class="mb-4 p-3 rounded-lg flex items-center gap-3" :style="{ backgroundColor: 'var(--surface)' }">
      <div class="w-12 h-12 rounded flex items-center justify-center" :style="{ backgroundColor: 'var(--border)' }">
        <Music :size="20" :style="{ color: 'var(--text-secondary)' }" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium truncate" :style="{ color: 'var(--text-primary)' }">{{ audioFile.file.name }}</p>
        <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">
          时长: {{ formatDuration(audioFile.duration) }} | {{ formatSize(audioFile.file.size) }}
        </p>
      </div>
      <button @click="clear" class="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded">
        <X :size="16" :style="{ color: 'var(--text-muted)' }" />
      </button>
    </div>

    <!-- Audio Preview -->
    <div v-if="audioFile" class="mb-6">
      <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">音频预览</label>
      <audio :src="audioUrl" controls class="w-full" :style="{ backgroundColor: 'var(--surface)' }"></audio>
    </div>

    <!-- Format Options -->
    <div v-if="audioFile" class="mb-6 p-4 rounded-xl" :style="{ backgroundColor: 'var(--surface)' }">
      <label class="text-sm font-medium mb-3 block" :style="{ color: 'var(--text-secondary)' }">输出格式</label>
      <div class="flex gap-3">
        <button
          @click="outputFormat = 'mp3'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="outputFormat === 'mp3' ? 'bg-primary text-white' : ''"
          :style="outputFormat !== 'mp3' ? { border: '1px solid var(--border)', color: 'var(--text-secondary)' } : {}">
          MP3
        </button>
        <button
          @click="outputFormat = 'wav'"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          :class="outputFormat === 'wav' ? 'bg-primary text-white' : ''"
          :style="outputFormat !== 'wav' ? { border: '1px solid var(--border)', color: 'var(--text-secondary)' } : {}">
          WAV
        </button>
      </div>
      <p class="text-xs mt-2" :style="{ color: 'var(--text-muted)' }">
        {{ outputFormat === 'mp3' ? 'MP3：压缩格式，文件更小，适合日常使用' : 'WAV：无损格式，文件较大，保留全部音质' }}
      </p>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button @click="convert" :disabled="!audioFile || isProcessing" class="btn btn-primary">
        <Loader2 :size="16" class="mr-1.5 animate-spin" v-if="isProcessing" />
        <Repeat :size="16" class="mr-1.5" v-else />
        {{ isProcessing ? '转换中...' : '开始转换' }}
      </button>
      <button @click="clear" class="btn btn-ghost" v-if="audioFile">
        <Trash2 :size="16" class="mr-1.5" />清空
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Music, X, Repeat, Trash2, Loader2 } from 'lucide-vue-next'
import { useAudioConverter } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)

const {
  audioFile,
  audioUrl,
  isProcessing,
  error,
  outputFormat,
  handleFileSelect,
  handleDrop,
  clear,
  convert,
  formatSize,
  formatDuration,
} = useAudioConverter()

const triggerFileInput = () => fileInputRef.value?.click()
</script>

<style scoped>
.btn { @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all; }
.btn-primary { @apply bg-primary text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-ghost { color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(0,0,0,0.05); }
.dark .btn-ghost:hover { background: rgba(255,255,255,0.1); }
</style>
