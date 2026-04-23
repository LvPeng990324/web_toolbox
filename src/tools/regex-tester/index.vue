<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">正则表达式测试</h2>

    <!-- Pattern Input -->
    <div class="surface-card p-4 mb-4">
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <span class="text-lg font-mono text-primary">/</span>
        <input v-model="pattern" type="text" class="regex-input flex-1 min-w-0"
          placeholder="输入正则表达式..." spellcheck="false" />
        <span class="text-lg font-mono text-primary">/{{ flagString }}/</span>
      </div>
      <!-- Flags -->
      <div class="flex flex-wrap gap-4 text-sm">
        <label v-for="(val, key) in flags" :key="key" class="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" v-model="flags[key]" class="accent-primary" />
          <span class="font-mono font-semibold" :style="{ color: 'var(--text-primary)' }">{{ key }}</span>
          <span :style="{ color: 'var(--text-muted)' }">{{ flagDesc[key] }}</span>
        </label>
      </div>
    </div>

    <!-- Common Patterns -->
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="text-xs self-center" :style="{ color: 'var(--text-muted)' }">常用模板:</span>
      <button v-for="p in commonPatterns" :key="p.name"
        @click="insertPattern(p.pattern)"
        class="px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all
          bg-primary/10 text-primary hover:bg-primary/20">
        {{ p.name }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
      <AlertCircle :size="16" class="inline mr-1.5" /> {{ error }}
    </div>

    <!-- Test Text -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">测试文本</label>
        <textarea v-model="testText" class="regex-textarea" rows="14" placeholder="输入测试文本..."></textarea>
        <p v-if="matches.length" class="mt-2 text-sm" :style="{ color: 'var(--text-muted)' }">
          匹配 <span class="text-primary font-semibold">{{ matches.length }}</span> 处
        </p>
      </div>

      <!-- Highlighted -->
      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">匹配结果</label>
        <div class="regex-textarea overflow-auto" v-html="highlightedHtml || '<span class=\'text-gray-400\'>匹配高亮将在此显示</span>'"></div>
      </div>
    </div>

    <!-- Match Details -->
    <div v-if="matches.length" class="mt-4">
      <h3 class="text-sm font-semibold mb-2" :style="{ color: 'var(--text-secondary)' }">匹配详情</h3>
      <div class="surface-card overflow-hidden">
        <div v-for="(m, i) in matches" :key="i"
          class="flex items-start gap-3 px-4 py-2 text-sm border-b last:border-b-0"
          :style="{ borderColor: 'var(--border)' }">
          <span class="shrink-0 font-mono text-primary text-xs mt-0.5">#{{ i + 1 }}</span>
          <div class="min-w-0">
            <div class="font-mono" :style="{ color: 'var(--text-primary)' }">
              "{{ m.match }}"
              <span class="text-xs ml-2" :style="{ color: 'var(--text-muted)' }">位置: {{ m.index }}</span>
            </div>
            <div v-if="m.groups.length" class="flex flex-wrap gap-2 mt-1">
              <span v-for="(g, gi) in m.groups" :key="gi"
                class="px-1.5 py-0.5 rounded text-xs bg-primary/10 text-primary font-mono">
                ${{ gi + 1 }}: {{ g }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'
import { useRegexTester } from './composable'

const {
  pattern, testText, flags, flagString, matches, error,
  highlightedHtml, commonPatterns, insertPattern,
} = useRegexTester()

const flagDesc: Record<string, string> = {
  g: '全局',
  i: '忽略大小写',
  m: '多行',
  s: '点匹配换行',
}
</script>

<style scoped>
.regex-input {
  @apply px-2 py-1 rounded-lg text-base font-mono outline-none;
  background-color: var(--background);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.regex-input:focus { border-color: #4F6EF7; }

.regex-textarea {
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
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 200px;
}
.regex-textarea:focus { border-color: #4F6EF7; }
</style>
