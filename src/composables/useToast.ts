import { computed, ref } from 'vue'

export function useToast() {
  const toasts = ref<{ id: number; message: string }[]>([])
  let nextId = 0

  const show = (message: string, duration = 2000) => {
    const id = nextId++
    toasts.value.push({ id, message })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  return { toasts, show }
}

export function useToastProvider() {
  const toast = useToast()

  const showToast = (message: string) => {
    toast.show(message)
  }

  return { toasts: toast.toasts, showToast }
}
