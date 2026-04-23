<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">JSON 格式化</h2>

    <!-- Toolbar -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button @click="format" class="btn btn-primary"><FileJson :size="16" class="mr-1.5" /> 格式化</button>
      <button @click="compress" class="btn btn-primary"><Minimize2 :size="16" class="mr-1.5" /> 压缩</button>
      <CopyButton :text="input" />
      <button @click="clear" class="btn btn-ghost"><Trash2 :size="16" class="mr-1.5" /> 清空</button>
    </div>

    <!-- Editor -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="relative">
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">输入</label>
        <textarea v-model="input"
          class="editor-textarea"
          placeholder='粘贴 JSON 数据，例如: {"name": "web toolbox"}'
          rows="20"
          spellcheck="false"></textarea>
      </div>
      <div class="relative">
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">
          输出
          <span v-if="error" class="text-red-500 ml-2">{{ error }}</span>
        </label>
        <pre v-if="formatted" class="editor-output"><code>{{ formatted }}</code></pre>
        <div v-else class="editor-output flex items-center justify-center text-sm"
          :style="{ color: 'var(--text-muted)' }">
          {{ error ? '' : '格式化结果将在此显示' }}
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-3 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
      <AlertCircle :size="16" class="inline mr-1.5" />
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileJson, Minimize2, Trash2, AlertCircle } from 'lucide-vue-next'
import CopyButton from '../../components/CopyButton.vue'
import { useJsonFormatter } from './composable'

const { input, error, formatted, format, compress, clear } = useJsonFormatter()
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all active:scale-95;
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

.editor-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.editor-textarea:focus {
  border-color: #4F6EF7;
}

.editor-output {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
</style>
