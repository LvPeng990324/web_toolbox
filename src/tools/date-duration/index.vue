<template>
  <div>
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">时间日期距离</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 起始日期 -->
      <div class="surface-card p-4">
        <label class="block text-sm font-semibold mb-3" :style="{ color: 'var(--text-primary)' }">
          起始日期
        </label>
        <div class="space-y-3">
          <input type="date" v-model="startDate" class="tool-input flex-1" />
          <div v-if="includeTime" class="flex items-center gap-2">
            <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">时分秒</span>
            <input type="time" v-model="startTime" step="1" class="tool-input flex-1" />
          </div>
        </div>
      </div>

      <!-- 结束日期 -->
      <div class="surface-card p-4">
        <label class="block text-sm font-semibold mb-3" :style="{ color: 'var(--text-primary)' }">
          结束日期
          <span class="text-xs font-normal ml-1" :style="{ color: 'var(--text-secondary)' }">（默认今天）</span>
        </label>
        <div class="space-y-3">
          <input type="date" v-model="endDate" class="tool-input flex-1" />
          <div v-if="includeTime" class="flex items-center gap-2">
            <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">时分秒</span>
            <input type="time" v-model="endTime" step="1" class="tool-input flex-1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 时分秒开关 -->
    <label class="flex items-center gap-2 mb-6 cursor-pointer text-sm" :style="{ color: 'var(--text-secondary)' }">
      <input type="checkbox" v-model="includeTime" class="accent-primary" />
      计算时分秒（显示精确秒数）
    </label>

    <!-- 错误提示 -->
    <div v-if="isInvalid" class="error-box mb-6">
      结束日期不能早于起始日期
    </div>

    <!-- 结果 -->
    <div v-if="result && !isInvalid" class="space-y-4">
      <!-- 天数概览 -->
      <div class="surface-card p-5 text-center">
        <div class="text-sm mb-2" :style="{ color: 'var(--text-secondary)' }">相隔</div>
        <div class="text-4xl font-bold" :style="{ color: 'var(--primary)' }">
          {{ result.diffDays }}
          <span class="text-lg font-normal" :style="{ color: 'var(--text-secondary)' }">天</span>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="surface-card p-4 text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ result.years }}</div>
          <div class="text-sm mt-1" :style="{ color: 'var(--text-secondary)' }">年</div>
        </div>
        <div class="surface-card p-4 text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ result.months }}</div>
          <div class="text-sm mt-1" :style="{ color: 'var(--text-secondary)' }">月</div>
        </div>
        <div class="surface-card p-4 text-center">
          <div class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ result.days }}</div>
          <div class="text-sm mt-1" :style="{ color: 'var(--text-secondary)' }">零几天</div>
        </div>
      </div>

      <!-- 时分秒精度 -->
      <div v-if="includeTime" class="surface-card p-4 space-y-2">
        <div class="text-sm font-semibold mb-3" :style="{ color: 'var(--text-primary)' }">精确时间差</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="text-center">
            <div class="text-lg font-mono font-bold" :style="{ color: 'var(--text-primary)' }">{{ result.diffHours }}</div>
            <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">时</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-mono font-bold" :style="{ color: 'var(--text-primary)' }">{{ result.diffMinutes }}</div>
            <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">分</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-mono font-bold" :style="{ color: 'var(--text-primary)' }">{{ result.diffSeconds }}</div>
            <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">秒</div>
          </div>
          <div class="text-center">
            <div class="text-lg font-mono font-bold" :style="{ color: 'var(--primary)' }">{{ result.totalSeconds.toLocaleString() }}</div>
            <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">总秒数</div>
          </div>
        </div>
      </div>

      <!-- 总计摘要 -->
      <div class="surface-card p-4 text-sm space-y-1" :style="{ color: 'var(--text-secondary)' }">
        <div>总天数：<span class="font-mono font-semibold" :style="{ color: 'var(--text-primary)' }">{{ result.totalDays.toFixed(6) }}</span></div>
        <div>总小时：<span class="font-mono font-semibold" :style="{ color: 'var(--text-primary)' }">{{ result.totalHours.toLocaleString() }}</span></div>
        <div>总分钟：<span class="font-mono font-semibold" :style="{ color: 'var(--text-primary)' }">{{ result.totalMinutes.toLocaleString() }}</span></div>
        <div>总秒数：<span class="font-mono font-semibold" :style="{ color: 'var(--text-primary)' }">{{ result.totalSeconds.toLocaleString() }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDateDuration } from './composable'

const {
  startDate,
  endDate,
  includeTime,
  startTime,
  endTime,
  result,
  isInvalid,
} = useDateDuration()
</script>

<style scoped>
.tool-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  background-color: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
  transition: border-color 0.2s;
}
.tool-input:focus { border-color: #4F6EF7; }
.error-box {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}
</style>
