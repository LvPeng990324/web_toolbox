import { ref, watch } from 'vue'
import QRCode from 'qrcode'

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export function useQrGenerate() {
  const input = ref('')
  const size = ref(300)
  const errorLevel = ref<ErrorCorrectionLevel>('M')
  const qrDataUrl = ref('')
  const error = ref('')

  const generate = async () => {
    if (!input.value.trim()) {
      qrDataUrl.value = ''
      error.value = ''
      return
    }
    try {
      qrDataUrl.value = await QRCode.toDataURL(input.value, {
        width: size.value,
        margin: 2,
        errorCorrectionLevel: errorLevel.value,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      error.value = ''
    } catch (e: any) {
      error.value = '生成失败：' + (e.message || '未知错误')
      qrDataUrl.value = ''
    }
  }

  const download = () => {
    if (!qrDataUrl.value) return
    const a = document.createElement('a')
    a.href = qrDataUrl.value
    a.download = `qrcode_${Date.now()}.png`
    a.click()
  }

  const clear = () => {
    input.value = ''
    qrDataUrl.value = ''
    error.value = ''
  }

  watch([input, size, errorLevel], generate, { immediate: true })

  return { input, size, errorLevel, qrDataUrl, error, download, clear }
}
