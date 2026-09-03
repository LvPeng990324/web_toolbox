import { ref, computed } from 'vue'
import { useTheme } from '../../composables/useTheme'

export type ViewMode = 'tree' | 'text'
export type JsonData =
  | string
  | number
  | boolean
  | null
  | JsonData[]
  | { [key: string]: JsonData }

export function useJsonFormatter() {
  const input = ref('')
  const error = ref('')
  const viewMode = ref<ViewMode>('tree')

  const parsed = computed<JsonData | null>(() => {
    if (!input.value.trim()) return null
    try {
      return JSON.parse(input.value) as JsonData
    } catch {
      return null
    }
  })

  const isValid = computed(() => {
    if (!input.value.trim()) return false
    try {
      JSON.parse(input.value)
      return true
    } catch {
      return false
    }
  })

  const format = () => {
    error.value = ''
    if (!input.value.trim()) return
    try {
      const data = JSON.parse(input.value)
      input.value = JSON.stringify(data, null, 2)
    } catch (e: any) {
      error.value = e.message
    }
  }

  const compress = () => {
    error.value = ''
    if (!input.value.trim()) return
    try {
      const data = JSON.parse(input.value)
      input.value = JSON.stringify(data)
    } catch (e: any) {
      error.value = e.message
    }
  }

  const clear = () => {
    input.value = ''
    error.value = ''
  }

  const sample = () => {
    input.value = JSON.stringify(
      {
        name: 'web toolbox',
          version: '1.0.0',
          features: ['JSON 格式化', '二维码生成', '图片处理'],
          author: { name: 'Lv Peng', homepage: 'https://example.com' },
          settings: { theme: 'auto', notifications: true, deep: 3 },
          tags: null,
          count: 42,
          active: false,
        },
        null,
        2
    )
    error.value = ''
  }

  const toggleView = (mode: ViewMode) => {
    viewMode.value = mode
  }

  const { isDark } = useTheme()
  const theme = computed<'light' | 'dark'>(() => (isDark.value ? 'dark' : 'light'))

  return {
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
  }
}