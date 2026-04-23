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
    <div class="relative">
      <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">输入</label>
      <div class="editor-wrapper">
        <div class="line-numbers" ref="lineNumbersRef">
          <div v-for="n in lineCount" :key="n" class="line-number">{{ n }}</div>
        </div>
        <textarea v-model="input"
          class="editor-textarea"
          placeholder='粘贴 JSON 数据，例如: {"name": "web toolbox"}'
          rows="20"
          spellcheck="false"
          @scroll="syncScroll"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { FileJson, Minimize2, Trash2 } from 'lucide-vue-next'
import CopyButton from '../../components/CopyButton.vue'
import { useJsonFormatter } from './composable'

const { input, format, compress, clear } = useJsonFormatter()

const lineNumbersRef = ref<HTMLElement | null>(null)

const lineCount = computed(() => {
  const lines = input.value.split('\n').length
  return Math.max(lines, 20)
})

const syncScroll = (e: Event) => {
  if (lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = (e.target as HTMLTextAreaElement).scrollTop
  }
}
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

.editor-wrapper {
  display: flex;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-color: var(--surface);
  overflow: hidden;
}
.line-numbers {
  padding: 12px 8px;
  background-color: var(--surface);
  border-right: 1px solid var(--border);
  user-select: none;
  overflow: hidden;
  text-align: right;
  min-width: 40px;
}
.line-number {
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-muted);
}
.editor-textarea {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 0;
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  background-color: var(--surface);
  color: var(--text-primary);
}
.editor-textarea:focus {
  outline: none;
}
</style>
