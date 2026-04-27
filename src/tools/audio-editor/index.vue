<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">音频剪辑</h2>

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
        <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">支持 MP3、WAV、OGG 等格式</p>
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
          时长: {{ formatTime(duration) }} | {{ formatSize(audioFile.file.size) }}
        </p>
      </div>
      <button @click="clear" class="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded">
        <X :size="16" :style="{ color: 'var(--text-muted)' }" />
      </button>
    </div>

    <!-- Waveform -->
    <div v-if="audioFile" class="mb-6">
      <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">
        波形 &amp; 裁剪区域
        <span class="text-xs font-normal ml-2" :style="{ color: 'var(--text-muted)' }">
          点击并拖拽选择区域
        </span>
      </label>

      <div class="p-4 rounded-xl" :style="{ backgroundColor: 'var(--surface)' }">
        <!-- Time Display -->
        <div class="flex justify-between text-xs mb-2" :style="{ color: 'var(--text-muted)' }">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>

        <!-- Waveform Container -->
        <div
          ref="waveformRef"
          class="relative h-24 cursor-crosshair select-none"
          @mousedown.prevent="onWaveformMouseDown"
          @mousemove="onWaveformMouseMove"
          @mouseup="onWaveformMouseUp"
          @mouseleave="onWaveformMouseLeave">
          <!-- Waveform Bars -->
          <div class="absolute inset-0 flex items-center gap-px px-1">
            <div
              v-for="(val, i) in waveformData"
              :key="i"
              class="flex-1 rounded-full transition-colors"
              :style="{
                height: `${val * 100}%`,
                backgroundColor: getBarColor(i),
              }">
            </div>
          </div>

          <!-- Selection Overlay -->
          <div
            v-if="isSelecting"
            class="absolute top-0 bottom-0 bg-primary/30 border-l-2 border-r-2 border-primary"
            :style="{
              left: `${(Math.min(selectionStart, selectionEnd) / duration) * 100}%`,
              width: `${(Math.abs(selectionEnd - selectionStart) / duration) * 100}%`,
            }">
          </div>

          <!-- Clip Regions -->
          <div
            v-for="clip in clips"
            :key="clip.id"
            class="absolute top-0 bottom-0 opacity-40 cursor-pointer"
            :style="{
              left: `${(clip.start / duration) * 100}%`,
              width: `${((clip.end - clip.start) / duration) * 100}%`,
              backgroundColor: clip.color,
            }"
            :class="{ 'ring-2 ring-white': selectedClipId === clip.id }"
            @click.stop="selectedClipId = clip.id">
          </div>

          <!-- Playhead -->
          <div
            class="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
            :style="{ left: `${(currentTime / duration) * 100}%` }">
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-3 text-xs" :style="{ color: 'var(--text-muted)' }">
          <p>1. 点击并拖拽波形选择区域</p>
          <p>2. 选择导出模式：保留选中区域 或 删除选中区域</p>
        </div>
      </div>
    </div>

    <!-- Selected Clips -->
    <div v-if="clips.length > 0" class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">
          已选片段 ({{ clips.length }})
        </label>
        <button @click="clearClips" class="text-xs px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10" :style="{ color: 'var(--text-muted)' }">
          清空全部
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="clip in clips"
          :key="clip.id"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all"
          :style="{ backgroundColor: clip.color + '30', borderLeft: `3px solid ${clip.color}` }"
          :class="{ 'ring-2 ring-offset-1': selectedClipId === clip.id }"
          @click="selectedClipId = selectedClipId === clip.id ? null : clip.id">
          <span class="text-xs font-medium" :style="{ color: 'var(--text-primary)' }">
            {{ formatTime(clip.start) }} - {{ formatTime(clip.end) }}
          </span>
          <button @click.stop="deleteClip(clip.id)" class="p-0.5 hover:bg-black/10 rounded">
            <X :size="12" :style="{ color: 'var(--text-muted)' }" />
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3">
      <button @click="exportAudio('keep')" :disabled="!audioFile || clips.length === 0 || isProcessing" class="btn btn-primary">
        <Loader2 :size="16" class="mr-1.5 animate-spin" v-if="isProcessing" />
        <Download :size="16" class="mr-1.5" v-else />
        导出保留片段
      </button>
      <button @click="exportAudio('remove')" :disabled="!audioFile || clips.length === 0 || isProcessing" class="btn btn-secondary">
        <Loader2 :size="16" class="mr-1.5 animate-spin" v-if="isProcessing" />
        <Eraser :size="16" class="mr-1.5" v-else />
        删除选中片段
      </button>
      <button @click="clear" class="btn btn-ghost" v-if="audioFile">
        <Trash2 :size="16" class="mr-1.5" />清空
      </button>
    </div>

    <!-- Audio Player -->
    <div v-if="audioFile" class="mt-6">
      <audio
        ref="audioPlayerRef"
        :src="audioUrl"
        @timeupdate="onTimeUpdate"
        @play="setPlaying(true)"
        @pause="setPlaying(false)"
        @ended="setPlaying(false)">
      </audio>
      <div class="flex items-center gap-3 mt-3">
        <button
          @click="togglePlay"
          class="w-10 h-10 rounded-full flex items-center justify-center"
          :style="{ backgroundColor: 'var(--primary)' }">
          <Pause v-if="isPlaying" :size="18" class="text-white" />
          <Play v-else :size="18" class="text-white" />
        </button>
        <div class="flex-1">
          <input
            type="range"
            :value="currentTime"
            min="0"
            :max="duration"
            step="0.01"
            class="w-full accent-primary"
            @input="onSeek" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Music, X, Play, Pause, Download, Eraser, Trash2, Loader2 } from 'lucide-vue-next'
import { useAudioEditor } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)
const audioPlayerRef = ref<HTMLAudioElement | null>(null)
const waveformRef = ref<HTMLElement | null>(null)

const {
  audioFile,
  audioUrl,
  isProcessing,
  error,
  duration,
  currentTime,
  isPlaying,
  clips,
  selectedClipId,
  isSelecting,
  selectionStart,
  selectionEnd,
  waveformData,
  handleFileSelect,
  handleDrop,
  clear,
  setCurrentTime,
  setPlaying,
  deleteClip,
  clearClips,
  startSelection,
  updateSelection,
  endSelection,
  exportAudio,
  formatSize,
  formatTime,
} = useAudioEditor()

const triggerFileInput = () => fileInputRef.value?.click()

const getBarColor = (index: number): string => {
  const time = (index / waveformData.value.length) * duration.value
  const isInSelection = isSelecting.value &&
    time >= Math.min(selectionStart.value, selectionEnd.value) &&
    time <= Math.max(selectionStart.value, selectionEnd.value)

  if (isInSelection) {
    return 'var(--primary)'
  }

  for (const clip of clips.value) {
    if (time >= clip.start && time <= clip.end) {
      return clip.color
    }
  }

  return 'var(--text-muted)'
}

const getTimeFromEvent = (e: MouseEvent): number => {
  if (!waveformRef.value) return 0
  const rect = waveformRef.value.getBoundingClientRect()
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
  return (x / rect.width) * duration.value
}

const onWaveformMouseDown = (e: MouseEvent) => {
  if (!audioFile.value) return
  const time = getTimeFromEvent(e)
  startSelection(time)
}

const onWaveformMouseMove = (e: MouseEvent) => {
  if (isSelecting.value) {
    const time = getTimeFromEvent(e)
    updateSelection(time)
  }
}

const onWaveformMouseUp = () => {
  if (isSelecting.value) {
    endSelection()
  }
}

const onWaveformMouseLeave = () => {
  // Don't end selection on leave, only on mouseup
}

const onTimeUpdate = () => {
  if (audioPlayerRef.value) {
    setCurrentTime(audioPlayerRef.value.currentTime)
  }
}

const togglePlay = () => {
  if (!audioPlayerRef.value) return
  if (isPlaying.value) {
    audioPlayerRef.value.pause()
  } else {
    audioPlayerRef.value.play()
  }
}

const onSeek = (e: Event) => {
  const input = e.target as HTMLInputElement
  const time = parseFloat(input.value)
  if (audioPlayerRef.value) {
    audioPlayerRef.value.currentTime = time
    setCurrentTime(time)
  }
}
</script>

<style scoped>
.btn { @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all; }
.btn-primary { @apply bg-primary text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-secondary text-white hover:bg-secondary-light disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-ghost { color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(0,0,0,0.05); }
.dark .btn-ghost:hover { background: rgba(255,255,255,0.1); }
</style>
