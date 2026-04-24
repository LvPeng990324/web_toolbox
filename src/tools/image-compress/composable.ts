import { ref } from 'vue'

export interface CompressOptions {
  mode: 'percentage' | 'target'
  percentage: number
  targetSize: number
}

export interface ImageFile {
  file: File
  dataUrl: string
  width: number
  height: number
}

export function useImageCompress() {
  const image = ref<ImageFile | null>(null)
  const previewUrl = ref('')
  const isProcessing = ref(false)
  const error = ref('')

  const options = ref<CompressOptions>({
    mode: 'percentage',
    percentage: 80,
    targetSize: 500,
  })

  const loadImage = (file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          resolve({
            file,
            dataUrl: e.target?.result as string,
            width: img.width,
            height: img.height,
          })
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) {
      error.value = ''
      try {
        image.value = await loadImage(input.files[0])
        previewUrl.value = image.value.dataUrl
      } catch {
        error.value = '图片加载失败'
      }
    }
  }

  const handleDrop = async (e: DragEvent) => {
    const file = e.dataTransfer?.files[0]
    if (file?.type.startsWith('image/')) {
      error.value = ''
      try {
        image.value = await loadImage(file)
        previewUrl.value = image.value.dataUrl
      } catch {
        error.value = '图片加载失败'
      }
    }
  }

  const clear = () => {
    image.value = null
    previewUrl.value = ''
    error.value = ''
  }

  const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
    })
  }

  const compress = async () => {
    if (!image.value) {
      error.value = '请先上传图片'
      return
    }

    isProcessing.value = true
    error.value = ''

    try {
      const img = new Image()
      img.src = image.value.dataUrl
      await new Promise((resolve) => { img.onload = resolve })

      let targetWidth: number, targetHeight: number

      if (options.value.mode === 'percentage') {
        targetWidth = Math.round(img.width * options.value.percentage / 100)
        targetHeight = Math.round(img.height * options.value.percentage / 100)
      } else {
        targetWidth = img.width
        targetHeight = img.height
      }

      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

      let blob: Blob
      if (options.value.mode === 'target') {
        let quality = 0.92
        blob = await canvasToBlob(canvas, quality)
        while (blob.size > options.value.targetSize * 1024 && quality > 0.1) {
          quality -= 0.1
          blob = await canvasToBlob(canvas, quality)
        }
      } else {
        blob = await canvasToBlob(canvas, 0.92)
      }

      previewUrl.value = URL.createObjectURL(blob)
      downloadBlob(blob, `compressed_${image.value.file.name}`)
    } catch {
      error.value = '压缩失败，请重试'
    } finally {
      isProcessing.value = false
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return {
    image,
    previewUrl,
    isProcessing,
    error,
    options,
    handleFileSelect,
    handleDrop,
    clear,
    compress,
    formatSize,
  }
}
