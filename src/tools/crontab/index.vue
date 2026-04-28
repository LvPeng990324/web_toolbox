<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">Crontab 表达式</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：配置 -->
      <div>
        <!-- 表达式输入框 -->
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">Cron 表达式</label>
        <div class="flex gap-2 mb-2">
          <input v-model="expression" class="cron-input flex-1" placeholder="*/5 * * * *" />
          <button v-if="expression" @click="copyExpression" class="btn btn-ghost px-3" title="复制">
            <Copy :size="16" />
          </button>
        </div>
        <!-- 表达式含义 -->
        <div v-if="expressionDesc" class="mb-4 p-2.5 rounded-lg text-sm" :style="{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }">
          {{ expressionDesc }}
        </div>
        <!-- 字段标签 -->
        <div class="flex gap-1 mb-3 text-xs font-medium" :style="{ color: 'var(--text-muted)' }">
          <span class="flex-1 text-center">分钟</span>
          <span class="flex-1 text-center">小时</span>
          <span class="flex-1 text-center">日</span>
          <span class="flex-1 text-center">月</span>
          <span class="flex-1 text-center">星期</span>
        </div>
        <!-- 当前表达式各字段高亮 -->
        <div class="flex gap-1 mb-5">
          <template v-for="(part, idx) in expressionParts" :key="idx">
            <div class="flex-1 text-center py-1.5 rounded text-sm font-mono font-semibold"
              :style="{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }">
              {{ part }}
            </div>
          </template>
        </div>

        <!-- 字段配置 -->
        <div class="space-y-4">
          <div v-for="field in fieldOrder" :key="field" class="p-4 rounded-xl" :style="{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium" :style="{ color: 'var(--text-primary)' }">{{ fieldOptions[field].label }}</span>
              <select v-model="fieldModes[field]" class="mode-select">
                <option value="every">每{{ fieldOptions[field].label }}</option>
                <option value="specific">指定</option>
                <option value="range">范围</option>
                <option value="step">步长</option>
                <option value="custom">自定义</option>
              </select>
            </div>

            <!-- 每X -->
            <div v-if="fieldModes[field] === 'every'" class="text-sm" :style="{ color: 'var(--text-muted)' }">
              每{{ fieldOptions[field].label }}都执行
            </div>

            <!-- 指定值 -->
            <div v-if="fieldModes[field] === 'specific'" class="flex flex-wrap gap-1.5">
              <button v-for="val in getFieldRange(field)" :key="val"
                @click="toggleSelected(field, val)"
                class="spec-btn"
                :class="fieldSelected[field].includes(val) ? 'spec-btn-active' : ''">
                {{ field === 'weekday' ? weekdayNames[val] : (field === 'month' ? val + '月' : val) }}
              </button>
            </div>

            <!-- 范围 -->
            <div v-if="fieldModes[field] === 'range'" class="flex items-center gap-2 text-sm">
              <span :style="{ color: 'var(--text-secondary)' }">从</span>
              <select v-model.number="fieldRangeStart[field]" class="range-select">
                <option v-for="v in getFieldRange(field)" :key="v" :value="v">{{ formatFieldValue(field, v) }}</option>
              </select>
              <span :style="{ color: 'var(--text-secondary)' }">到</span>
              <select v-model.number="fieldRangeEnd[field]" class="range-select">
                <option v-for="v in getFieldRange(field)" :key="v" :value="v">{{ formatFieldValue(field, v) }}</option>
              </select>
            </div>

            <!-- 步长 -->
            <div v-if="fieldModes[field] === 'step'" class="flex items-center gap-2 text-sm">
              <span :style="{ color: 'var(--text-secondary)' }">从</span>
              <select v-model.number="fieldStepStart[field]" class="range-select">
                <option v-for="v in getFieldRange(field)" :key="v" :value="v">{{ formatFieldValue(field, v) }}</option>
              </select>
              <span :style="{ color: 'var(--text-secondary)' }">开始，每隔</span>
              <input type="number" v-model.number="fieldStepValue[field]" :min="1" :max="fieldOptions[field].max" class="step-input" />
              <span :style="{ color: 'var(--text-secondary)' }">{{ fieldOptions[field].label }}</span>
            </div>

            <!-- 自定义 -->
            <div v-if="fieldModes[field] === 'custom'" class="text-xs" :style="{ color: 'var(--text-muted)' }">
              请在上方表达式输入框中直接编辑此字段
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：执行时间 -->
      <div>
        <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">最近 10 次执行时间</label>

        <div v-if="error" class="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm mb-4">
          <AlertCircle :size="16" class="inline mr-1.5" /> {{ error }}
        </div>

        <div v-if="nextExecutions.length > 0" class="space-y-2">
          <div v-for="(dt, idx) in nextExecutions" :key="idx"
            class="surface-card p-3 flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
              {{ idx + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-mono" :style="{ color: 'var(--text-primary)' }">{{ formatDateTime(dt) }}</p>
              <p class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatRelative(dt) }}</p>
            </div>
            <button @click="copyDateTime(dt)" class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer" title="复制">
              <Copy :size="14" :style="{ color: 'var(--text-muted)' }" />
            </button>
          </div>
        </div>

        <div v-else-if="!error" class="surface-card p-12 flex flex-col items-center" :style="{ color: 'var(--text-muted)' }">
          <Timer :size="48" class="mb-3 opacity-30" />
          <p class="text-sm">输入 Crontab 表达式查看执行时间</p>
        </div>

        <!-- 常用表达式 -->
        <div class="mt-6">
          <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--text-secondary)' }">常用表达式</label>
          <div class="grid grid-cols-1 gap-2">
            <button v-for="preset in presets" :key="preset.expr"
              @click="expression = preset.expr"
              class="preset-btn text-left">
              <span class="font-mono text-xs" :style="{ color: 'var(--text-primary)' }">{{ preset.expr }}</span>
              <span class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ preset.desc }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Timer, Copy, AlertCircle } from 'lucide-vue-next'
import { useCrontab, type CronField } from './composable'

const {
  expression, error, fieldOptions, fieldModes, fieldSelected,
  fieldRangeStart, fieldRangeEnd, fieldStepStart, fieldStepValue,
  nextExecutions, expressionDesc, weekdayNames, toggleSelected,
  fieldOrder,
} = useCrontab()

const expressionParts = computed(() => {
  const parts = expression.value.trim().split(/\s+/)
  while (parts.length < 5) parts.push('*')
  return parts.slice(0, 5)
})

const presets = [
  { expr: '* * * * *', desc: '每分钟' },
  { expr: '*/5 * * * *', desc: '每 5 分钟' },
  { expr: '0 * * * *', desc: '每小时' },
  { expr: '0 */2 * * *', desc: '每 2 小时' },
  { expr: '0 8 * * *', desc: '每天 8:00' },
  { expr: '0 8,18 * * *', desc: '每天 8:00 和 18:00' },
  { expr: '0 0 * * *', desc: '每天午夜' },
  { expr: '0 0 * * 1-5', desc: '工作日午夜' },
  { expr: '0 0 1 * *', desc: '每月 1 号午夜' },
  { expr: '0 0 1 1 *', desc: '每年 1 月 1 日午夜' },
]

const getFieldRange = (field: CronField): number[] => {
  const opt = fieldOptions[field]
  const result: number[] = []
  for (let i = opt.min; i <= opt.max; i++) result.push(i)
  return result
}

const formatFieldValue = (field: CronField, val: number): string => {
  if (field === 'weekday') return `星期${weekdayNames[val]}`
  if (field === 'month') return `${val}月`
  return String(val)
}

const formatDateTime = (dt: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`
}

const formatRelative = (dt: Date): string => {
  const now = new Date()
  const diff = dt.getTime() - now.getTime()
  if (diff < 0) return '已过'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} 分钟后`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时 ${minutes % 60} 分钟后`
  const days = Math.floor(hours / 24)
  return `${days} 天 ${hours % 24} 小时后`
}

const copyExpression = () => {
  navigator.clipboard.writeText(expression.value)
}

const copyDateTime = (dt: Date) => {
  navigator.clipboard.writeText(formatDateTime(dt))
}
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all;
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

.cron-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 2px;
  outline: none;
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.cron-input:focus {
  border-color: #4F6EF7;
}

.mode-select {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  background-color: var(--background);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
}

.spec-btn {
  width: 36px;
  height: 32px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  background: transparent;
}
.spec-btn:hover {
  border-color: #4F6EF7;
  color: var(--text-primary);
}
.spec-btn-active {
  background-color: #4F6EF7;
  border-color: #4F6EF7;
  color: #fff !important;
}

.range-select {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background-color: var(--background);
  border: 1px solid var(--border);
  color: var(--text-primary);
  cursor: pointer;
}

.step-input {
  width: 60px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  text-align: center;
  background-color: var(--background);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.step-input:focus {
  border-color: #4F6EF7;
}

.preset-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid var(--border);
  background: transparent;
}
.preset-btn:hover {
  border-color: #4F6EF7;
  background: rgba(79, 110, 247, 0.05);
}
</style>
