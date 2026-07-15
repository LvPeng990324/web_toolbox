<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">图片裁切</h2>

    <!-- Upload Area -->
    <div v-if="!image" class="mb-6">
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

    <!-- Editor -->
    <div v-else class="space-y-6">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg" :style="{ backgroundColor: 'var(--surface)' }">
        <div class="flex items-center gap-3 min-w-0">
          <img :src="image.dataUrl" class="w-10 h-10 object-cover rounded flex-shrink-0" />
          <div class="min-w-0">
            <p class="text-sm font-medium truncate" :style="{ color: 'var(--text-primary)' }">{{ image.file.name }}</p>
            <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">
              {{ image.width }} × {{ image.height }} | {{ formatSize(image.file.size) }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="clearRegions" class="btn btn-ghost btn-sm" :disabled="regions.length === 0">
            <RefreshCcw :size="14" class="mr-1" />清空选择
          </button>
          <button @click="clear" class="btn btn-ghost btn-sm">
            <X :size="14" class="mr-1" />重新上传
          </button>
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="overflow-auto">
        <div
          ref="containerRef"
          class="relative inline-block rounded-lg overflow-hidden border cursor-crosshair select-none"
          :style="{ borderColor: 'var(--border)' }"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp">
          <img
            ref="imageRef"
            :src="image.dataUrl"
            class="block max-w-full h-auto"
            draggable="false"
            @load="onImageLoad" />
          <canvas
            ref="canvasRef"
            class="absolute top-0 left-0 pointer-events-none"
            :width="displaySize.width"
            :height="displaySize.height" />
        </div>
      </div>

      <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
        在图片上按住鼠标左键框选要裁切的区域，可框选多个区域生成多张片段图。
      </p>

      <!-- Fragments -->
      <div v-if="fragments.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">
            已生成 {{ fragments.length }} 张片段
          </h3>
          <button @click="downloadAll" class="btn btn-primary btn-sm">
            <Download :size="14" class="mr-1" />下载全部
          </button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div
            v-for="(fragment, index) in fragments"
            :key="fragment.id"
            class="surface-card p-2 space-y-2">
            <div class="aspect-square rounded-md overflow-hidden" :style="{ backgroundColor: 'var(--background)' }">
              <img :src="fragment.dataUrl" class="w-full h-full object-contain" />
            </div>
            <div class="space-y-1">
              <p class="text-xs truncate" :style="{ color: 'var(--text-secondary)' }">
                #{{ index + 1 }} · {{ fragment.width }}×{{ fragment.height }}
              </p>
              <div class="flex gap-2">
                <button @click="downloadFragment(fragment)" class="btn btn-primary btn-sm flex-1 justify-center">
                  <Download :size="14" />
                </button>
                <button @click="deleteRegion(fragment.id)" class="btn btn-ghost btn-sm px-2">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { Upload, Download, Trash2, RefreshCcw, X } from 'lucide-vue-next'
import { useImageCrop } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const {
  image,
  displaySize,
  regions,
  fragments,
  error,
  handleFileSelect,
  handleDrop,
  clear,
  startDraw,
  updateDraw,
  endDraw,
  deleteRegion,
  clearRegions,
  downloadFragment,
  downloadAll,
  drawOverlay,
  formatSize,
} = useImageCrop()

const triggerFileInput = () => fileInputRef.value?.click()

const onImageLoad = () => {
  if (!imageRef.value) return
  displaySize.value = {
    width: imageRef.value.offsetWidth,
    height: imageRef.value.offsetHeight,
  }
  nextTick(() => drawOverlay(canvasRef.value))
}

const onMouseDown = (e: MouseEvent) => {
  if (!containerRef.value) return
  startDraw(e, containerRef.value)
}

const onMouseMove = (e: MouseEvent) => {
  if (!containerRef.value) return
  updateDraw(e, containerRef.value)
  drawOverlay(canvasRef.value)
}

const onMouseUp = () => {
  endDraw()
  drawOverlay(canvasRef.value)
}

const updateDisplaySize = () => {
  if (!imageRef.value) return
  displaySize.value = {
    width: imageRef.value.offsetWidth,
    height: imageRef.value.offsetHeight,
  }
  drawOverlay(canvasRef.value)
}

watch(regions, () => {
  drawOverlay(canvasRef.value)
})

window.addEventListener('resize', updateDisplaySize)
onUnmounted(() => {
  window.removeEventListener('resize', updateDisplaySize)
})
</script>
