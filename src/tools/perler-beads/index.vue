<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">拼豆图纸生成</h2>

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
        <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">
          图纸尺寸: {{ options.gridWidth }} × {{ options.gridHeight }}
        </label>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-xs mb-1 block" :style="{ color: 'var(--text-muted)' }">宽度 (格)</label>
            <input
              type="number"
              v-model.number="options.gridWidth"
              min="5"
              max="200"
              class="w-full px-3 py-2 rounded-lg border text-sm"
              :style="{ borderColor: 'var(--border)', backgroundColor: 'transparent', color: 'var(--text-primary)' }"
              @input="onWidthInput"
            />
          </div>
          <div>
            <label class="text-xs mb-1 block" :style="{ color: 'var(--text-muted)' }">高度 (格)</label>
            <input
              type="number"
              v-model.number="options.gridHeight"
              min="5"
              max="200"
              class="w-full px-3 py-2 rounded-lg border text-sm"
              :style="{ borderColor: 'var(--border)', backgroundColor: 'transparent', color: 'var(--text-primary)' }"
              @input="onHeightInput"
            />
          </div>
        </div>
        <div class="flex justify-between text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
          <span>5</span><span>200</span>
        </div>
      </div>

      <!-- Preset Sizes -->
      <div>
        <label class="text-xs font-medium mb-2 block" :style="{ color: 'var(--text-muted)' }">常用尺寸</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in presets"
            :key="preset.label"
            @click="applyPreset(preset)"
            class="px-2 py-1 text-xs rounded border transition-colors hover:bg-primary/10"
            :style="{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button @click="generatePattern" :disabled="!image || isProcessing" class="btn btn-primary">
        <Loader2 :size="16" class="mr-1.5 animate-spin" v-if="isProcessing" />
        <Grid3x3 :size="16" class="mr-1.5" v-else />
        {{ isProcessing ? '生成中...' : '生成图纸' }}
      </button>
      <button @click="clear" class="btn btn-ghost">
        <Trash2 :size="16" class="mr-1.5" />
        清空
      </button>
    </div>

    <!-- Preview -->
    <div v-if="previewUrl && image" class="mt-6">
      <div class="flex items-center justify-between mb-2">
        <label class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">图纸预览</label>
        <button @click="downloadPattern" class="btn btn-outline text-xs">
          <Download :size="14" class="mr-1" />
          下载图纸
        </button>
      </div>
      <div class="rounded-lg overflow-hidden border" :style="{ borderColor: 'var(--border)' }">
        <img :src="previewUrl" class="max-w-full h-auto" />
      </div>
    </div>

    <!-- Color Legend -->
    <div v-if="colorCounts.length > 0" class="mt-6">
      <label class="text-sm font-medium mb-3 block" :style="{ color: 'var(--text-secondary)' }">
        所需颜色 ({{ colorCounts.length }} 种)
      </label>
      <div class="rounded-xl overflow-hidden border" :style="{ borderColor: 'var(--border)' }">
        <div class="max-h-64 overflow-y-auto">
          <table class="w-full text-sm">
            <thead class="sticky top-0" :style="{ backgroundColor: 'var(--surface)' }">
              <tr>
                <th class="text-left py-2 px-3 font-medium" :style="{ color: 'var(--text-secondary)' }">色卡</th>
                <th class="text-left py-2 px-3 font-medium" :style="{ color: 'var(--text-secondary)' }">型号</th>
                <th class="text-left py-2 px-3 font-medium" :style="{ color: 'var(--text-secondary)' }">名称</th>
                <th class="text-right py-2 px-3 font-medium" :style="{ color: 'var(--text-secondary)' }">数量</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="color in colorCounts"
                :key="color.code"
                class="border-t"
                :style="{ borderColor: 'var(--border)' }"
              >
                <td class="py-2 px-3">
                  <div
                    class="w-6 h-6 rounded border"
                    :style="{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`, borderColor: 'var(--border)' }"
                  />
                </td>
                <td class="py-2 px-3 font-mono text-xs" :style="{ color: 'var(--text-primary)' }">{{ color.code }}</td>
                <td class="py-2 px-3" :style="{ color: 'var(--text-primary)' }">{{ color.name }}</td>
                <td class="py-2 px-3 text-right font-medium" :style="{ color: 'var(--primary)' }">{{ color.count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary -->
      <div class="mt-4 p-3 rounded-lg flex items-center justify-between" :style="{ backgroundColor: 'var(--surface)' }">
        <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">总计</span>
        <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">
          {{ colorCounts.reduce((sum, c) => sum + c.count, 0) }} 颗
        </span>
      </div>
    </div>

    <!-- Tips -->
    <div class="mt-6 p-4 rounded-xl" :style="{ backgroundColor: 'var(--surface)' }">
      <h3 class="text-sm font-medium mb-2" :style="{ color: 'var(--text-primary)' }">使用提示</h3>
      <ul class="text-xs space-y-1" :style="{ color: 'var(--text-muted)' }">
        <li>• 尺寸越大，图案越精细，但需要的拼豆越多</li>
        <li>• 推荐从 29x29 或 38x38 开始尝试</li>
        <li>• 下载的图纸可直接打印或对照拼豆</li>
        <li>• 每个格子中央标注该位置的拼豆色型号</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Grid3x3, Trash2, Loader2, X, Download } from 'lucide-vue-next'
import { usePerlerBeads } from './composable'

const fileInputRef = ref<HTMLInputElement | null>(null)
const {
  image,
  isProcessing,
  error,
  previewUrl,
  colorCounts,
  options,
  handleFileSelect,
  handleDrop,
  onWidthInput,
  onHeightInput,
  clear,
  generatePattern,
  downloadPattern,
  formatSize,
} = usePerlerBeads()

interface Preset {
  label: string
  width: number
  height: number
}

const presets: Preset[] = [
  { label: '16×16', width: 16, height: 16 },
  { label: '29×29', width: 29, height: 29 },
  { label: '38×38', width: 38, height: 38 },
  { label: '48×48', width: 48, height: 48 },
  { label: '64×64', width: 64, height: 64 },
  { label: '100×100', width: 100, height: 100 },
]

const applyPreset = (preset: Preset) => {
  options.value.gridWidth = preset.width
  options.value.gridHeight = preset.height
}

const triggerFileInput = () => fileInputRef.value?.click()
</script>

<style scoped>
.btn { @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all; }
.btn-primary { @apply bg-primary text-white hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-ghost { color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(0,0,0,0.05); }
.dark .btn-ghost:hover { background: rgba(255,255,255,0.1); }
.btn-outline { border: 1px solid var(--border); color: var(--text-secondary); }
.btn-outline:hover { background: var(--surface); }
</style>
