import { ref } from 'vue'

export interface ImageFile {
  file: File
  dataUrl: string
  width: number
  height: number
}

export function useImageMerge() {
  const images = ref<ImageFile[]>([])
  const previewUrl = ref('')
  const isProcessing = ref(false)
  const error = ref('')

  const direction = ref<'horizontal' | 'vertical'>('horizontal')
  const gap = ref(0)
  const bgColor = ref('#ffffff')

  const loadImage = (file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => resolve({ file, dataUrl: e.target?.result as string, width: img.width, height: img.height })
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files) {
      await addImages(input.files)
    }
  }

  const handleDrop = async (e: DragEvent) => {
    const files = e.dataTransfer?.files
    if (files) {
      await addImages(files)
    }
  }

  const addImages = async (files: FileList | File[]) => {
    error.value = ''
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'))

    if (fileArray.length === 0) {
      error.value = '请选择有效的图片文件'
      return
    }

    try {
      const loaded = await Promise.all(fileArray.map(loadImage))
      images.value.push(...loaded)
    } catch {
      error.value = '图片加载失败'
    }
  }

  const removeImage = (index: number) => {
    images.value.splice(index, 1)
  }

  const clear = () => {
    images.value = []
    previewUrl.value = ''
    error.value = ''
  }

  const merge = async () => {
    if (images.value.length < 2) {
      error.value = '至少需要2张图片'
      return
    }

    isProcessing.value = true
    error.value = ''

    try {
      const loadedImages = await Promise.all(
        images.value.map(img => {
          return new Promise<HTMLImageElement>((resolve) => {
            const imageEl = new Image()
            imageEl.onload = () => resolve(imageEl)
            imageEl.src = img.dataUrl
          })
        })
      )

      let totalWidth: number, totalHeight: number
      const gapPx = gap.value * (loadedImages.length - 1)

      if (direction.value === 'horizontal') {
        totalWidth = loadedImages.reduce((sum, img) => sum + img.width, 0) + gapPx
        totalHeight = Math.max(...loadedImages.map(img => img.height))
      } else {
        totalWidth = Math.max(...loadedImages.map(img => img.width))
        totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0) + gapPx
      }

      const canvas = document.createElement('canvas')
      canvas.width = totalWidth
      canvas.height = totalHeight
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = bgColor.value
      ctx.fillRect(0, 0, totalWidth, totalHeight)

      let offset = 0
      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i]
        if (direction.value === 'horizontal') {
          ctx.drawImage(img, offset, 0)
          offset += img.width + gap.value
        } else {
          ctx.drawImage(img, 0, offset)
          offset += img.height + gap.value
        }
      }

      canvas.toBlob((blob) => {
        if (blob) {
          previewUrl.value = URL.createObjectURL(blob)
          downloadBlob(blob, `merged_${Date.now()}.jpg`)
        }
      }, 'image/jpeg', 0.92)
    } catch {
      error.value = '拼接失败，请重试'
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
    images,
    previewUrl,
    isProcessing,
    error,
    direction,
    gap,
    bgColor,
    handleFileSelect,
    handleDrop,
    removeImage,
    clear,
    merge,
    formatSize,
  }
}
