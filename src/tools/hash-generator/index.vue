<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">哈希加密</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Input -->
      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">输入文本</label>
        <textarea v-model="input" class="editor-textarea" rows="10" placeholder="输入待加密的文本"></textarea>
        <label class="flex items-center gap-2 mt-3 cursor-pointer text-sm" :style="{ color: 'var(--text-secondary)' }">
          <input type="checkbox" v-model="uppercase" class="accent-primary" />
          大写输出
        </label>
      </div>

      <!-- Results -->
      <div class="flex flex-col gap-3">
        <div v-for="algo in algos" :key="algo" class="surface-card p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">{{ algo }}</span>
            <CopyButton v-if="results[algo]" :text="results[algo]" />
          </div>
          <div class="font-mono text-sm break-all" :style="{ color: 'var(--text-secondary)' }">
            {{ results[algo] || '等待输入...' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CopyButton from '../../components/CopyButton.vue'
import { useHashGenerator } from './composable'

const algos = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'] as const

const { input, uppercase, results } = useHashGenerator()
</script>

<style scoped>
.editor-textarea {
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
.editor-textarea:focus { border-color: #4F6EF7; }
</style>
