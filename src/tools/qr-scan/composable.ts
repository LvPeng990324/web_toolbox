import { ref } from 'vue'
import jsQR from 'jsqr'

export interface QrScanResult {
  content: string
  format: string
}

export function useQrScan() {
  const image = ref<{ dataUrl: string; file: File } | null>(null)
  const result = ref('')
  const error = ref('')
  const isProcessing = ref(false)

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) {
      await loadImage(input.files[0])
    }
  }

  const handleDrop = async (e: DragEvent) => {
    const file = e.dataTransfer?.files[0]
    if (file?.type.startsWith('image/')) {
      await loadImage(file)
    } else if (file) {
      error.value = '请上传图片文件'
    }
  }

  const loadImage = async (file: File) => {
    error.value = ''
    result.value = ''
    isProcessing.value = true

    try {
      const dataUrl = await readFileAsDataUrl(file)
      image.value = { dataUrl, file }
      await scanQrCode(dataUrl)
    } catch (e: any) {
      error.value = '图片加载失败'
    } finally {
      isProcessing.value = false
    }
  }

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const scanQrCode = (dataUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        if (code) {
          result.value = code.data
          resolve()
        } else {
          // 尝试反色扫描
          const code2 = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          })
          if (code2) {
            result.value = code2.data
            resolve()
          } else {
            error.value = '未检测到二维码，请确保图片中包含有效的二维码'
            resolve()
          }
        }
      }
      img.onerror = () => {
        error.value = '图片加载失败'
        resolve()
      }
      img.src = dataUrl
    })
  }

  const clear = () => {
    image.value = null
    result.value = ''
    error.value = ''
  }

  return { image, result, error, isProcessing, handleFileSelect, handleDrop, clear }
}
