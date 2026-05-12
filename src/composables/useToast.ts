import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
}

const toasts = ref<Toast[]>([])
let nextId = 0

export function useToast() {
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
  const { show } = useToast()

  const showToast = (message: string) => {
    show(message)
  }

  return { toasts, showToast }
}
