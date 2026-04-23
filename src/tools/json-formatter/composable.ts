import { ref } from 'vue'

export function useJsonFormatter() {
  const input = ref('')
  const error = ref('')

  const format = () => {
    error.value = ''
    if (!input.value.trim()) return
    try {
      const parsed = JSON.parse(input.value)
      input.value = JSON.stringify(parsed, null, 2)
    } catch (e: any) {
      error.value = e.message
    }
  }

  const compress = () => {
    error.value = ''
    if (!input.value.trim()) return
    try {
      const parsed = JSON.parse(input.value)
      input.value = JSON.stringify(parsed)
    } catch (e: any) {
      error.value = e.message
    }
  }

  const clear = () => {
    input.value = ''
    error.value = ''
  }

  return { input, error, format, compress, clear }
}
