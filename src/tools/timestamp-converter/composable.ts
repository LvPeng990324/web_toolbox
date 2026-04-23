import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useTimestampConverter() {
  const currentTimestamp = ref(Math.floor(Date.now() / 1000))
  const tsInput = ref('')
  const tsUnit = ref<'s' | 'ms'>('s')
  const dateTimeInput = ref('')
  const tsResult = ref('')
  const dateResult = ref('')

  let timer: number

  onMounted(() => {
    timer = window.setInterval(() => {
      currentTimestamp.value = Math.floor(Date.now() / 1000)
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(timer)
  })

  const currentMs = computed(() => currentTimestamp.value * 1000)

  const convertTsToDate = () => {
    const raw = Number(tsInput.value)
    if (isNaN(raw)) { dateResult.value = '请输入有效数字'; return }
    const ms = tsUnit.value === 's' ? raw * 1000 : raw
    const d = new Date(ms)
    if (isNaN(d.getTime())) { dateResult.value = '无效时间戳'; return }
    dateResult.value = [
      `本地时间: ${d.toLocaleString('zh-CN')}`,
      `UTC 时间: ${d.toISOString()}`,
      `ISO 格式: ${d.toISOString()}`,
    ].join('\n')
  }

  const setNow = () => {
    tsInput.value = String(currentTimestamp.value)
    convertTsToDate()
  }

  const convertDateToTs = () => {
    if (!dateTimeInput.value) { tsResult.value = ''; return }
    const d = new Date(dateTimeInput.value)
    if (isNaN(d.getTime())) { tsResult.value = '无效日期时间'; return }
    tsResult.value = [
      `秒级时间戳: ${Math.floor(d.getTime() / 1000)}`,
      `毫秒级时间戳: ${d.getTime()}`,
    ].join('\n')
  }

  return {
    currentTimestamp, currentMs, tsInput, tsUnit, dateTimeInput,
    tsResult, dateResult, convertTsToDate, convertDateToTs, setNow,
  }
}
