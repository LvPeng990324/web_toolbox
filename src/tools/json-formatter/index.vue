<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">JSON 格式化</h2>

    <!-- Toolbar -->
    <div class="flex flex-wrap gap-2 mb-4">
      <button @click="format" class="btn btn-sm btn-primary">
        <FileJson :size="16" class="mr-1.5" /> 格式化
      </button>
      <button @click="compress" class="btn btn-sm btn-primary">
        <Minimize2 :size="16" class="mr-1.5" /> 压缩
      </button>
      <button @click="sample" class="btn btn-sm btn-outline">
        <Sparkles :size="16" class="mr-1.5" /> 示例
      </button>
      <CopyButton :text="input" />
      <button @click="clear" class="btn btn-sm btn-ghost">
        <Trash2 :size="16" class="mr-1.5" /> 清空
      </button>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="surface-card mb-4 px-4 py-3 text-sm"
      :style="{ color: '#DC2626', borderColor: '#FCA5A5' }"
    >
      <AlertCircle :size="16" class="inline-block mr-1.5 align-text-bottom" />
      {{ error }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Input Panel -->
      <div class="surface-card p-4">
        <div class="flex items-center justify-between mb-2">
          <label
            class="text-sm font-medium"
            :style="{ color: 'var(--text-secondary)' }"
          >输入</label>
          <span
            class="text-xs"
            :style="{ color: 'var(--text-muted)' }"
          >{{ input.length }} 字符</span>
        </div>
        <div class="editor-wrapper">
          <div class="line-numbers" ref="lineNumbersRef">
            <div v-for="n in lineCount" :key="n" class="line-number">{{ n }}</div>
          </div>
          <textarea
            v-model="input"
            class="editor-textarea"
            placeholder='粘贴 JSON 数据，例如: {"name": "web toolbox"}'
            rows="20"
            spellcheck="false"
            @scroll="syncScroll"
          ></textarea>
        </div>
      </div>

      <!-- Output Panel -->
      <div class="surface-card p-4">
        <div class="flex items-center justify-between mb-2 gap-2">
          <div class="flex items-center gap-2">
            <label
              class="text-sm font-medium"
              :style="{ color: 'var(--text-secondary)' }"
            >输出</label>
            <span
              v-if="isValid"
              class="inline-flex items-center text-xs px-1.5 py-0.5 rounded"
              :style="{ color: '#059669', backgroundColor: 'rgba(16, 185, 129, 0.12)' }"
            >
              <CheckCircle2 :size="12" class="mr-0.5" /> 有效 JSON
            </span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="btn btn-sm"
              :class="viewMode === 'tree' ? 'btn-primary' : 'btn-outline'"
              @click="toggleView('tree')"
            >
              <TreePine :size="14" class="mr-1" /> 树形
            </button>
            <button
              class="btn btn-sm"
              :class="viewMode === 'text' ? 'btn-primary' : 'btn-outline'"
              @click="toggleView('text')"
            >
              <AlignLeft :size="14" class="mr-1" /> 文本
            </button>
          </div>
        </div>

        <div v-if="!input.trim()" class="empty-state">
          <FileJson :size="32" :style="{ color: 'var(--text-muted)' }" />
          <p :style="{ color: 'var(--text-muted)' }" class="mt-2 text-sm">
            左侧粘贴 JSON 后将在此显示格式化结果
          </p>
        </div>

        <div v-else-if="!isValid" class="empty-state">
          <AlertCircle :size="32" style="color: #DC2626" />
          <p style="color: #DC2626" class="mt-2 text-sm">JSON 格式无效</p>
          <p :style="{ color: 'var(--text-muted)' }" class="mt-1 text-xs">请检查左侧输入</p>
        </div>

        <div v-else-if="viewMode === 'tree'" class="json-tree-wrapper">
          <VueJsonPretty
            :data="parsed"
            :theme="theme"
            :deep="3"
            :show-length="true"
            :show-line="true"
            :show-line-number="true"
            :show-icon="true"
            :show-double-quotes="true"
            :select-on-click-node="true"
            :highlight-selected-node="true"
            :virtual="false"
            :collapsed-on-click-brackets="true"
          />
        </div>

        <div v-else class="json-text-wrapper">
          <pre class="json-text"><code>{{ input }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import {
  FileJson,
  Minimize2,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TreePine,
  AlignLeft,
} from 'lucide-vue-next'
import CopyButton from '../../components/CopyButton.vue'
import { useJsonFormatter } from './composable'

const {
  input,
  parsed,
  isValid,
  error,
  viewMode,
  theme,
  format,
  compress,
  clear,
  sample,
  toggleView,
} = useJsonFormatter()

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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  border: 1px dashed var(--border);
  border-radius: 8px;
  background-color: var(--surface);
}

.json-tree-wrapper {
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--surface);
  padding: 12px;
  max-height: 540px;
  overflow: auto;
  font-size: 13px;
  line-height: 1.7;
}

.json-text-wrapper {
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--surface);
  padding: 12px;
  max-height: 540px;
  overflow: auto;
}

.json-text {
  margin: 0;
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre;
  color: var(--text-primary);
}

/* Override vue-json-pretty default styles to fit project theme */
.json-tree-wrapper :deep(.vjs-tree) {
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  color: var(--text-primary);
}

.json-tree-wrapper :deep(.vjs-key) {
  color: var(--primary);
}

.json-tree-wrapper :deep(.vjs-value-string),
.json-tree-wrapper :deep(.vjs-value-string-virtual) {
  color: #059669;
}

.json-tree-wrapper :deep(.vjs-value-number) {
  color: #D97706;
}

.json-tree-wrapper :deep(.vjs-value-boolean) {
  color: #7C3AED;
}

.json-tree-wrapper :deep(.vjs-value-null),
.json-tree-wrapper :deep(.vjs-value-undefined) {
  color: var(--text-muted);
}

.json-tree-wrapper :deep(.vjs-bracket),
.json-tree-wrapper :deep(.vjs-bracket-text) {
  color: var(--text-secondary);
}

.json-tree-wrapper :deep(.vjs-node-index),
.json-tree-wrapper :deep(.vjs-line-number) {
  color: var(--text-muted);
}

.json-tree-wrapper :deep(.vjs-tree-node .vjs-indent-unit.has-line) {
  border-left: 1px dashed var(--border);
}

.json-tree-wrapper :deep(.vjs-tree-node.is-highlight),
.json-tree-wrapper :deep(.vjs-tree-node:hover) {
  background-color: rgba(79, 110, 247, 0.08);
  border-radius: 4px;
}

.json-tree-wrapper :deep(.vjs-tree-node .vjs-tree-node-actions) {
  background-color: rgba(79, 110, 247, 0.08);
}

.json-tree-wrapper :deep(.vjs-tree-brackets:hover),
.json-tree-wrapper :deep(.vjs-carets:hover),
.json-tree-wrapper :deep(.vjs-tree-node .vjs-tree-node-actions .vjs-tree-node-actions-item:hover) {
  color: var(--primary);
}

/* Dark mode tweaks (vue-json-pretty applies theme="dark" as a class on nodes) */
.dark .json-tree-wrapper :deep(.vjs-tree) {
  color: var(--text-primary);
}

.dark .json-tree-wrapper :deep(.vjs-tree-node.is-highlight),
.dark .json-tree-wrapper :deep(.vjs-tree-node:hover) {
  background-color: rgba(108, 138, 255, 0.18);
}
</style>