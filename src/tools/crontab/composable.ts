import { ref, computed, watch } from 'vue'

export type CronField = 'minute' | 'hour' | 'day' | 'month' | 'weekday'

export interface CronFieldOption {
  label: string
  min: number
  max: number
}

const fieldOptions: Record<CronField, CronFieldOption> = {
  minute: { label: '分钟', min: 0, max: 59 },
  hour: { label: '小时', min: 0, max: 23 },
  day: { label: '日', min: 1, max: 31 },
  month: { label: '月', min: 1, max: 12 },
  weekday: { label: '星期', min: 0, max: 6 },
}

const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
const monthNames = ['', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export function useCrontab() {
  const expression = ref('*/5 * * * *')
  const error = ref('')

  // 各字段的选择模式: every / specific / range / step / custom
  const fieldModes = ref<Record<CronField, string>>({
    minute: 'step',
    hour: 'every',
    day: 'every',
    month: 'every',
    weekday: 'every',
  })

  // specific 模式下选中的值
  const fieldSelected = ref<Record<CronField, number[]>>({
    minute: [],
    hour: [],
    day: [],
    month: [],
    weekday: [],
  })

  // range 模式
  const fieldRangeStart = ref<Record<CronField, number>>({
    minute: 0, hour: 0, day: 1, month: 1, weekday: 0,
  })
  const fieldRangeEnd = ref<Record<CronField, number>>({
    minute: 59, hour: 23, day: 31, month: 12, weekday: 6,
  })

  // step 模式
  const fieldStepStart = ref<Record<CronField, number>>({
    minute: 0, hour: 0, day: 1, month: 1, weekday: 0,
  })
  const fieldStepValue = ref<Record<CronField, number>>({
    minute: 5, hour: 1, day: 1, month: 1, weekday: 1,
  })

  const generateFieldExpr = (field: CronField): string => {
    const mode = fieldModes.value[field]
    const opt = fieldOptions[field]

    switch (mode) {
      case 'every':
        return '*'
      case 'specific': {
        const selected = [...fieldSelected.value[field]].sort((a, b) => a - b)
        if (selected.length === 0) return '*'
        return selected.join(',')
      }
      case 'range': {
        const start = fieldRangeStart.value[field]
        const end = fieldRangeEnd.value[field]
        if (start === opt.min && end === opt.max) return '*'
        return `${start}-${end}`
      }
      case 'step': {
        const start = fieldStepStart.value[field]
        const step = fieldStepValue.value[field]
        if (step <= 1) return '*'
        return start === 0 ? `*/${step}` : `${start}/${step}`
      }
      case 'custom':
        // custom mode: expression is manually edited, return current field value from expression
        return parseExpressionToFields()[field]
      default:
        return '*'
    }
  }

  const buildExpression = (): string => {
    const fields: CronField[] = ['minute', 'hour', 'day', 'month', 'weekday']
    return fields.map(f => generateFieldExpr(f)).join(' ')
  }

  // 从表达式解析各字段
  const parseExpressionToFields = (): Record<CronField, string> => {
    const parts = expression.value.trim().split(/\s+/)
    const fields: CronField[] = ['minute', 'hour', 'day', 'month', 'weekday']
    const result: Record<CronField, string> = { minute: '*', hour: '*', day: '*', month: '*', weekday: '*' }
    fields.forEach((f, i) => {
      if (parts[i]) result[f] = parts[i]
    })
    return result
  }

  // 根据选择的字段模式更新表达式
  const updateExpressionFromFields = () => {
    expression.value = buildExpression()
  }

  // 监听字段配置变化，自动更新表达式（仅在非 custom 模式下）
  watch(
    [fieldModes, fieldSelected, fieldRangeStart, fieldRangeEnd, fieldStepStart, fieldStepValue],
    () => {
      // 如果所有字段都不是 custom 模式，则自动更新表达式
      const anyCustom = (Object.keys(fieldModes.value) as CronField[]).some(
        f => fieldModes.value[f] === 'custom'
      )
      if (!anyCustom) {
        updateExpressionFromFields()
      }
    },
    { deep: true }
  )

  // 解析 cron 表达式，计算下一次执行时间
  const parseCronField = (expr: string, min: number, max: number): number[] => {
    const values = new Set<number>()
    const parts = expr.split(',')

    for (const part of parts) {
      if (part === '*') {
        for (let i = min; i <= max; i++) values.add(i)
      } else if (part.includes('/')) {
        const [rangeStr, stepStr] = part.split('/')
        const step = parseInt(stepStr)
        if (isNaN(step) || step <= 0) continue
        let start = min
        let end = max
        if (rangeStr !== '*') {
          if (rangeStr.includes('-')) {
            const [s, e] = rangeStr.split('-').map(Number)
            start = s
            end = e
          } else {
            start = parseInt(rangeStr)
          }
        }
        for (let i = start; i <= end; i += step) values.add(i)
      } else if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) values.add(i)
        }
      } else {
        const val = parseInt(part)
        if (!isNaN(val)) values.add(val)
      }
    }

    return [...values].sort((a, b) => a - b).filter(v => v >= min && v <= max)
  }

  const nextExecutions = computed(() => {
    const parts = expression.value.trim().split(/\s+/)
    if (parts.length !== 5) return []

    try {
      const minutes = parseCronField(parts[0], 0, 59)
      const hours = parseCronField(parts[1], 0, 23)
      const days = parseCronField(parts[2], 1, 31)
      const months = parseCronField(parts[3], 1, 12)
      const weekdays = parseCronField(parts[4], 0, 6)

      if (minutes.length === 0 || hours.length === 0 || days.length === 0 || months.length === 0 || weekdays.length === 0) {
        error.value = '表达式无效'
        return []
      }

      error.value = ''
      const results: Date[] = []
      const now = new Date()
      // 从下一分钟开始搜索
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0)

      let current = new Date(start)
      const maxIterations = 366 * 24 * 60 // 最多搜索一年
      let iterations = 0

      while (results.length < 10 && iterations < maxIterations) {
        iterations++
        if (months.includes(current.getMonth() + 1) &&
            days.includes(current.getDate()) &&
            weekdays.includes(current.getDay()) &&
            hours.includes(current.getHours()) &&
            minutes.includes(current.getMinutes())) {
          results.push(new Date(current))
        }
        // 前进一分钟
        current = new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours(), current.getMinutes() + 1)
      }

      if (results.length === 0) {
        error.value = '未找到匹配的执行时间'
      }

      return results
    } catch {
      error.value = '表达式解析失败'
      return []
    }
  })

  const expressionDesc = computed(() => {
    const parts = expression.value.trim().split(/\s+/)
    if (parts.length !== 5) return ''

    const descs: string[] = []
    const fieldLabels: Record<CronField, string> = {
      minute: '分钟', hour: '小时', day: '日', month: '月', weekday: '星期',
    }
    const fields: CronField[] = ['minute', 'hour', 'day', 'month', 'weekday']

    fields.forEach((f, i) => {
      const part = parts[i]
      const label = fieldLabels[f]
      if (part === '*') return

      if (f === 'weekday') {
        if (part.includes(',')) {
          const nums = part.split(',').map(Number)
          descs.push(`星期${nums.map(n => weekdayNames[n]).join('、')}`)
        } else if (part.includes('-')) {
          const [s, e] = part.split('-').map(Number)
          descs.push(`星期${weekdayNames[s]}到星期${weekdayNames[e]}`)
        } else if (part.includes('/')) {
          const [range, step] = part.split('/')
          if (range === '*') descs.push(`每隔${step}天(星期)`)
          else descs.push(`从星期${weekdayNames[parseInt(range)]}开始每隔${step}天`)
        } else {
          descs.push(`星期${weekdayNames[parseInt(part)]}`)
        }
      } else if (f === 'month') {
        if (part.includes(',')) {
          const nums = part.split(',').map(Number)
          descs.push(`${nums.map(n => monthNames[n]).join('、')}`)
        } else if (part.includes('-')) {
          const [s, e] = part.split('-').map(Number)
          descs.push(`${monthNames[s]}到${monthNames[e]}`)
        } else if (part.includes('/')) {
          const [range, step] = part.split('/')
          if (range === '*') descs.push(`每隔${step}个月`)
          else descs.push(`从${monthNames[parseInt(range)]}开始每隔${step}个月`)
        } else {
          descs.push(`${monthNames[parseInt(part)]}`)
        }
      } else if (part.includes('/')) {
        const [range, step] = part.split('/')
        if (range === '*') descs.push(`每隔${step}${label}`)
        else descs.push(`从第${range}${label}开始每隔${step}${label}`)
      } else if (part.includes('-')) {
        const [s, e] = part.split('-')
        descs.push(`${label}${s}到${label}${e}`)
      } else if (part.includes(',')) {
        descs.push(`${label}${part}`)
      } else {
        descs.push(`${label}${part}`)
      }
    })

    if (descs.length === 0) return '每分钟执行'
    return descs.join('，') + ' 执行'
  })

  const toggleSelected = (field: CronField, value: number) => {
    const idx = fieldSelected.value[field].indexOf(value)
    if (idx >= 0) {
      fieldSelected.value[field].splice(idx, 1)
    } else {
      fieldSelected.value[field].push(value)
    }
  }

  return {
    expression,
    error,
    fieldOptions,
    fieldModes,
    fieldSelected,
    fieldRangeStart,
    fieldRangeEnd,
    fieldStepStart,
    fieldStepValue,
    nextExecutions,
    expressionDesc,
    weekdayNames,
    monthNames,
    toggleSelected,
    fieldOrder: ['minute', 'hour', 'day', 'month', 'weekday'] as CronField[],
  }
}
