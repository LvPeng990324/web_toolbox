import { ref } from 'vue'

export interface ImageFile {
  file: File
  dataUrl: string
  width: number
  height: number
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function useImageCrop() {
  const image = ref<ImageFile | null>(null)
  const previewUrl = ref('')
  const isProcessing = ref(false)
  const error = ref('')

  const unit = ref<'percent' | 'pixel'>('percent')
  const cropArea = ref<CropArea>({ x: 0, y: 0, width: 100, height: 100 })

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
    if (input.files?.[0]) {
      error.value = ''
      try {
        image.value = await loadImage(input.files[0])
        previewUrl.value = image.value.dataUrl
        cropArea.value = { x: 0, y: 0, width: 100, height: 100 }
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
        cropArea.value = { x: 0, y: 0, width: 100, height: 100 }
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

  const crop = async () => {
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

      let sx: number, sy: number, sw: number, sh: number

      if (unit.value === 'percent') {
        sx = img.width * cropArea.value.x / 100
        sy = img.height * cropArea.value.y / 100
        sw = img.width * cropArea.value.width / 100
        sh = img.height * cropArea.value.height / 100
      } else {
        sx = cropArea.value.x
        sy = cropArea.value.y
        sw = cropArea.value.width
        sh = cropArea.value.height
      }

      const canvas = document.createElement('canvas')
      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)

      canvas.toBlob((blob) => {
        if (blob) {
          previewUrl.value = URL.createObjectURL(blob)
          downloadBlob(blob, `cropped_${image.value!.file.name}`)
        }
      }, 'image/jpeg', 0.92)
    } catch {
      error.value = '裁切失败，请重试'
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
    unit,
    cropArea,
    handleFileSelect,
    handleDrop,
    clear,
    crop,
    formatSize,
  }
}
