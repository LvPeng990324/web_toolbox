<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">时间戳转换</h2>

    <!-- Current Timestamp -->
    <div class="surface-card p-6 mb-6 text-center">
      <p class="text-sm mb-2" :style="{ color: 'var(--text-secondary)' }">当前时间戳</p>
      <div class="flex items-baseline justify-center gap-2 flex-wrap">
        <span class="text-3xl md:text-4xl font-bold font-mono text-primary">{{ currentTimestamp }}</span>
        <span class="text-sm font-mono" :style="{ color: 'var(--text-muted)' }">秒</span>
        <span class="text-xl font-mono" :style="{ color: 'var(--text-muted)' }">/ {{ currentMs }} 毫秒</span>
      </div>
      <p class="text-sm mt-2" :style="{ color: 'var(--text-muted)' }">
        {{ new Date().toLocaleString('zh-CN') }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Timestamp -> Date -->
      <div class="surface-card p-5">
        <h3 class="font-semibold mb-4" :style="{ color: 'var(--text-primary)' }">时间戳 → 日期时间</h3>
        <div class="flex gap-2 mb-3">
          <input v-model="tsInput" type="text" placeholder="输入时间戳" class="input flex-1" />
          <select v-model="tsUnit" class="input w-20">
            <option value="s">秒</option>
            <option value="ms">毫秒</option>
          </select>
        </div>
        <div class="flex gap-2 mb-3">
          <button @click="convertTsToDate" class="btn btn-primary">转换</button>
          <button @click="setNow" class="btn btn-ghost">使用当前</button>
        </div>
        <pre v-if="dateResult" class="result-box">{{ dateResult }}</pre>
      </div>

      <!-- Date -> Timestamp -->
      <div class="surface-card p-5">
        <h3 class="font-semibold mb-4" :style="{ color: 'var(--text-primary)' }">日期时间 → 时间戳</h3>
        <input v-model="dateTimeInput" type="datetime-local" class="input w-full mb-3" />
        <button @click="convertDateToTs" class="btn btn-primary mb-3">转换</button>
        <pre v-if="tsResult" class="result-box">{{ tsResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTimestampConverter } from './composable'

const {
  currentTimestamp, currentMs, tsInput, tsUnit, dateTimeInput,
  tsResult, dateResult, convertTsToDate, convertDateToTs, setNow,
} = useTimestampConverter()
</script>

<style scoped>
.btn {
  @apply inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all active:scale-95;
}
.btn-primary { @apply bg-primary text-white hover:bg-primary-light; }
.btn-ghost { color: var(--text-secondary); }
.btn-ghost:hover { background: rgba(0,0,0,0.05); }
.dark .btn-ghost:hover { background: rgba(255,255,255,0.1); }

.input {
  @apply px-3 py-2 rounded-lg text-sm outline-none transition-all;
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}
.input:focus { border-color: #4F6EF7; }

.result-box {
  padding: 12px;
  border-radius: 8px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  background-color: var(--background);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
</style>
