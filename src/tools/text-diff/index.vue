<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">文本对比</h2>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <div class="flex rounded-lg overflow-hidden border" :style="{ borderColor: 'var(--border)' }">
        <button @click="mode = 'split'"
          class="px-3 py-1.5 text-sm font-medium cursor-pointer transition-all"
          :class="mode === 'split' ? 'bg-primary text-white' : ''"
          :style="mode !== 'split' ? { color: 'var(--text-secondary)' } : {}">
          并排视图
        </button>
        <button @click="mode = 'unified'"
          class="px-3 py-1.5 text-sm font-medium cursor-pointer transition-all"
          :class="mode === 'unified' ? 'bg-primary text-white' : ''"
          :style="mode !== 'unified' ? { color: 'var(--text-secondary)' } : {}">
          统一视图
        </button>
      </div>
      <span v-if="stats.added || stats.removed" class="text-sm" :style="{ color: 'var(--text-muted)' }">
        <span class="text-green-500">+{{ stats.added }}</span> /
        <span class="text-red-500">-{{ stats.removed }}</span>
      </span>
    </div>

    <!-- Split Mode -->
    <template v-if="mode === 'split'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">原始文本</label>
          <textarea v-model="original" class="diff-textarea" rows="14" placeholder="粘贴原始文本"></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">修改文本</label>
          <textarea v-model="modified" class="diff-textarea" rows="14" placeholder="粘贴修改文本"></textarea>
        </div>
      </div>
      <!-- Diff Result -->
      <div v-if="original || modified" class="grid grid-cols-1 lg:grid-cols-2 gap-0 mt-4 border rounded-lg overflow-hidden" :style="{ borderColor: 'var(--border)' }">
        <div class="border-r overflow-auto max-h-96" :style="{ borderColor: 'var(--border)' }">
          <div v-for="(line, i) in splitResult.left" :key="'l' + i"
            class="diff-line font-mono text-sm px-3 py-0.5 whitespace-pre"
            :class="line.removed ? 'bg-red-500/10 text-red-500' : ''">
            <span class="inline-block w-8 text-right mr-3 opacity-40 select-none">{{ i + 1 }}</span>{{ line.value }}
          </div>
        </div>
        <div class="overflow-auto max-h-96">
          <div v-for="(line, i) in splitResult.right" :key="'r' + i"
            class="diff-line font-mono text-sm px-3 py-0.5 whitespace-pre"
            :class="line.added ? 'bg-green-500/10 text-green-500' : ''">
            <span class="inline-block w-8 text-right mr-3 opacity-40 select-none">{{ i + 1 }}</span>{{ line.value }}
          </div>
        </div>
      </div>
    </template>

    <!-- Unified Mode -->
    <template v-else>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">原始文本</label>
        <textarea v-model="original" class="diff-textarea" rows="10" placeholder="粘贴原始文本"></textarea>
      </div>
      <div class="mb-4">
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">修改文本</label>
        <textarea v-model="modified" class="diff-textarea" rows="10" placeholder="粘贴修改文本"></textarea>
      </div>
      <div v-if="original || modified" class="border rounded-lg overflow-auto max-h-96" :style="{ borderColor: 'var(--border)' }">
        <div v-for="(line, i) in unifiedLines" :key="i"
          class="diff-line font-mono text-sm px-3 py-0.5 whitespace-pre"
          :class="{
            'bg-green-500/10 text-green-500': line.added,
            'bg-red-500/10 text-red-500': line.removed,
          }">
          <span class="inline-block w-8 text-right mr-3 opacity-40 select-none">
            {{ line.added ? '+' : line.removed ? '-' : ' ' }}
          </span>{{ line.value.replace(/\n$/, '') || '\n' }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTextDiff } from './composable'

const { original, modified, mode, splitResult, unifiedLines, stats } = useTextDiff()
</script>

<style scoped>
.diff-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.diff-textarea:focus { border-color: #4F6EF7; }
.diff-line { line-height: 1.7; }
</style>
