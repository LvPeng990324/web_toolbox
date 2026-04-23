import { ref, computed } from 'vue'

export function useJsonFormatter() {
  const input = ref('')
  const error = ref('')

  const formatted = computed(() => {
    error.value = ''
    if (!input.value.trim()) return ''
    try {
      const parsed = JSON.parse(input.value)
      return JSON.stringify(parsed, null, 2)
    } catch (e: any) {
      error.value = e.message
      return ''
    }
  })

  const compressed = computed(() => {
    error.value = ''
    if (!input.value.trim()) return ''
    try {
      const parsed = JSON.parse(input.value)
      return JSON.stringify(parsed)
    } catch (e: any) {
      error.value = e.message
      return ''
    }
  })

  const format = () => {
    if (formatted.value) {
      input.value = formatted.value
    }
  }

  const compress = () => {
    if (compressed.value) {
      input.value = compressed.value
    }
  }

  const clear = () => {
    input.value = ''
    error.value = ''
  }

  return { input, error, formatted, compressed, format, compress, clear }
}
