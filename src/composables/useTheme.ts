import { ref, watchEffect } from 'vue'

const isDark = ref(false)

const applyTheme = () => {
  document.documentElement.classList.toggle('dark', isDark.value)
}

watchEffect(() => {
  applyTheme()
})

export function useTheme() {
  const initTheme = () => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      isDark.value = stored === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  return { isDark, initTheme, toggleTheme }
}
