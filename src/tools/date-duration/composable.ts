import { ref, computed, watch } from 'vue'

interface DateTimePair {
  date: string
  time: string
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${h}:${min}:${s}`
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h = 0, min = 0, s = 0] = timeStr.split(':').map(Number)
  return new Date(y, m - 1, d, h, min, s)
}

function getDaysBetween(start: Date, end: Date): { totalDays: number; years: number; months: number; days: number } {
  const diffMs = end.getTime() - start.getTime()
  const totalDays = diffMs / (1000 * 60 * 60 * 24)

  const y1 = start.getFullYear(), m1 = start.getMonth(), d1 = start.getDate()
  const y2 = end.getFullYear(), m2 = end.getMonth(), d2 = end.getDate()

  let years = y2 - y1
  let months = m2 - m1
  let days = d2 - d1

  if (days < 0) {
    months--
    const prev = new Date(y2, m2, 0)
    days += prev.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }

  return { totalDays, years, months, days }
}

export function useDateDuration() {
  const today = formatDate(new Date())
  const nowTime = formatTime(new Date())

  const startDate = ref(today)
  const endDate = ref(today)
  const includeTime = ref(false)
  const startTime = ref('00:00:00')
  const endTime = ref(nowTime)

  const result = computed(() => {
    if (!startDate.value || !endDate.value) return null

    const start = includeTime.value
      ? parseDateTime(startDate.value, startTime.value)
      : new Date(startDate.value + 'T00:00:00')
    const end = includeTime.value
      ? parseDateTime(endDate.value, endTime.value)
      : new Date(endDate.value + 'T23:59:59.999')

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null
    if (end < start) return null

    const { totalDays, years, months, days } = getDaysBetween(start, end)

    const diffMs = end.getTime() - start.getTime()
    const totalSeconds = Math.floor(diffMs / 1000)
    const totalMinutes = Math.floor(totalSeconds / 60)
    const totalHours = Math.floor(totalSeconds / 3600)

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const remainMs = diffMs % (1000 * 60 * 60 * 24)
    const diffHours = Math.floor(remainMs / (1000 * 60 * 60))
    const remainMs2 = remainMs % (1000 * 60 * 60)
    const diffMinutes = Math.floor(remainMs2 / (1000 * 60))
    const diffSeconds = Math.floor(remainMs2 % (1000 * 60) / 1000)

    return {
      start,
      end,
      totalDays,
      totalSeconds,
      totalMinutes,
      totalHours,
      years,
      months,
      days,
      diffDays,
      diffHours,
      diffMinutes,
      diffSeconds,
    }
  })

  const isInvalid = computed(() => {
    if (!startDate.value || !endDate.value) return false
    const start = includeTime.value
      ? parseDateTime(startDate.value, startTime.value)
      : new Date(startDate.value)
    const end = includeTime.value
      ? parseDateTime(endDate.value, endTime.value)
      : new Date(endDate.value)
    return end < start
  })

  watch([startDate, endDate, startTime, endTime], () => {
    const t = new Date()
    if (!endDate.value) endDate.value = formatDate(t)
    if (!endTime.value) endTime.value = formatTime(t)
  }, { immediate: true })

  return {
    startDate,
    endDate,
    includeTime,
    startTime,
    endTime,
    result,
    isInvalid,
    formatDate,
    formatTime,
  }
}
