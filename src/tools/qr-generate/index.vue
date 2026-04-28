<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">生成二维码</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：输入 -->
      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">二维码内容</label>
        <textarea v-model="input" class="qr-textarea" rows="6" placeholder="输入文本或链接..."></textarea>

        <div class="mt-4 space-y-4">
          <!-- 尺寸 -->
          <div>
            <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">
              尺寸: {{ size }} × {{ size }} px
            </label>
            <input type="range" v-model.number="size" min="100" max="800" step="50" class="w-full accent-primary" />
            <div class="flex justify-between text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
              <span>100px</span><span>800px</span>
            </div>
          </div>

          <!-- 容错级别 -->
          <div>
            <label class="text-sm font-medium mb-2 block" :style="{ color: 'var(--text-secondary)' }">容错级别</label>
            <div class="flex gap-2">
              <button v-for="level in errorLevels" :key="level.value"
                @click="errorLevel = level.value"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
                :class="errorLevel === level.value ? 'bg-primary text-white' : ''"
                :style="errorLevel !== level.value ? { border: '1px solid var(--border)', color: 'var(--text-secondary)' } : {}">
                {{ level.label }}
              </button>
            </div>
            <p class="text-xs mt-2" :style="{ color: 'var(--text-muted)' }">{{ currentLevelDesc }}</p>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mt-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{{ error }}</div>
      </div>

      <!-- 右侧：预览 -->
      <div class="flex flex-col items-center">
        <label class="block text-sm font-medium mb-2 self-start" :style="{ color: 'var(--text-secondary)' }">预览</label>
        <div v-if="qrDataUrl" class="surface-card p-6 flex flex-col items-center">
          <img :src="qrDataUrl" :style="{ width: Math.min(size, 360) + 'px', height: Math.min(size, 360) + 'px', imageRendering: 'pixelated' }" class="rounded" />
          <div class="flex gap-3 mt-4">
            <button @click="download" class="btn btn-primary">
              <Download :size="16" class="mr-1.5" /> 下载
            </button>
            <button @click="clear" class="btn btn-ghost">
              <Trash2 :size="16" class="mr-1.5" /> 清空
            </button>
          </div>
        </div>
        <div v-else class="surface-card p-12 flex flex-col items-center" :style="{ color: 'var(--text-muted)' }">
          <QrCode :size="48" class="mb-3 opacity-30" />
          <p class="text-sm">输入内容后自动生成二维码</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QrCode, Download, Trash2 } from 'lucide-vue-next'
import { useQrGenerate } from './composable'

const errorLevels = [
  { value: 'L' as const, label: 'L (7%)', desc: '低容错：约 7% 的数据可恢复，适合干净环境' },
  { value: 'M' as const, label: 'M (15%)', desc: '中等容错：约 15% 的数据可恢复，推荐默认使用' },
  { value: 'Q' as const, label: 'Q (25%)', desc: '较高容错：约 25% 的数据可恢复，适合有遮挡场景' },
  { value: 'H' as const, label: 'H (30%)', desc: '高容错：约 30% 的数据可恢复，适合恶劣环境或加 logo' },
]

const { input, size, errorLevel, qrDataUrl, error, download, clear } = useQrGenerate()

const currentLevelDesc = computed(() => {
  return errorLevels.find(l => l.value === errorLevel.value)?.desc || ''
})
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

.qr-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.qr-textarea:focus {
  border-color: #4F6EF7;
}
</style>
