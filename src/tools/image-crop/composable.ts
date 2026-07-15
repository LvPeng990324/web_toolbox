import { ref, computed } from 'vue'
import { formatSize } from '../../composables/useFileUpload'

export interface ImageFile {
  file: File
  dataUrl: string
  width: number
  height: number
}

export interface CropRegion {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface Fragment {
  id: string
  dataUrl: string
  width: number
  height: number
  name: string
}

export function useImageCrop() {
  const image = ref<ImageFile | null>(null)
  const displaySize = ref({ width: 0, height: 0 })
  const scale = computed(() => (image.value && displaySize.value.width ? displaySize.value.width / image.value.width : 1))

  const regions = ref<CropRegion[]>([])
  const fragments = ref<Fragment[]>([])
  const isDrawing = ref(false)
  const currentRegion = ref<CropRegion | null>(null)
  const isProcessing = ref(false)
  const error = ref('')

  const loadImage = (file: File): Promise<ImageFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        const img = new Image()
        img.onload = () => resolve({ file, dataUrl, width: img.width, height: img.height })
        img.onerror = reject
        img.src = dataUrl
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const resetEditor = () => {
    regions.value = []
    fragments.value = []
    currentRegion.value = null
    isDrawing.value = false
    displaySize.value = { width: 0, height: 0 }
  }

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) {
      error.value = ''
      try {
        image.value = await loadImage(input.files[0])
        resetEditor()
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
        resetEditor()
      } catch {
        error.value = '图片加载失败'
      }
    }
  }

  const clear = () => {
    image.value = null
    resetEditor()
    error.value = ''
  }

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

  const startDraw = (e: MouseEvent, container: HTMLElement) => {
    if (!image.value || !displaySize.value.width) return

    const rect = container.getBoundingClientRect()
    const x = clamp(e.clientX - rect.left, 0, displaySize.value.width)
    const y = clamp(e.clientY - rect.top, 0, displaySize.value.height)

    isDrawing.value = true
    currentRegion.value = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      x: x / displaySize.value.width,
      y: y / displaySize.value.height,
      width: 0,
      height: 0,
    }
  }

  const updateDraw = (e: MouseEvent, container: HTMLElement) => {
    if (!isDrawing.value || !currentRegion.value || !image.value || !displaySize.value.width) return

    const rect = container.getBoundingClientRect()
    const x = clamp(e.clientX - rect.left, 0, displaySize.value.width)
    const y = clamp(e.clientY - rect.top, 0, displaySize.value.height)

    currentRegion.value.width = (x / displaySize.value.width) - currentRegion.value.x
    currentRegion.value.height = (y / displaySize.value.height) - currentRegion.value.y
  }

  const normalizeRegion = (region: CropRegion): CropRegion | null => {
    let { id, x, y, width, height } = region

    if (width < 0) {
      x += width
      width = -width
    }
    if (height < 0) {
      y += height
      height = -height
    }

    x = clamp(x, 0, 1)
    y = clamp(y, 0, 1)
    width = clamp(width, 0, 1 - x)
    height = clamp(height, 0, 1 - y)

    if (width * (image.value?.width || 0) < 5 || height * (image.value?.height || 0) < 5) {
      return null
    }

    return { id, x, y, width, height }
  }

  const cropImage = async (region: CropRegion): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!image.value) return reject(new Error('无图片'))

      const sx = Math.round(region.x * image.value.width)
      const sy = Math.round(region.y * image.value.height)
      const sw = Math.round(region.width * image.value.width)
      const sh = Math.round(region.height * image.value.height)

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = sw
        canvas.height = sh
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('无法创建画布'))
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      }
      img.onerror = reject
      img.src = image.value.dataUrl
    })
  }

  const createFragment = async (region: CropRegion) => {
    if (!image.value) return

    isProcessing.value = true
    error.value = ''

    try {
      const dataUrl = await cropImage(region)
      const sw = Math.round(region.width * image.value.width)
      const sh = Math.round(region.height * image.value.height)
      const baseName = image.value.file.name.replace(/\.[^.]+$/, '')

      fragments.value.push({
        id: region.id,
        dataUrl,
        width: sw,
        height: sh,
        name: `${baseName}_crop_${fragments.value.length + 1}.jpg`,
      })
    } catch {
      error.value = '生成片段失败，请重试'
    } finally {
      isProcessing.value = false
    }
  }

  const endDraw = () => {
    if (!isDrawing.value || !currentRegion.value) return

    isDrawing.value = false
    const normalized = normalizeRegion(currentRegion.value)
    currentRegion.value = null

    if (normalized) {
      regions.value.push(normalized)
      createFragment(normalized)
    }
  }

  const deleteRegion = (id: string) => {
    regions.value = regions.value.filter((r) => r.id !== id)
    fragments.value = fragments.value.filter((f) => f.id !== id)
  }

  const clearRegions = () => {
    regions.value = []
    fragments.value = []
  }

  const downloadFragment = (fragment: Fragment) => {
    const a = document.createElement('a')
    a.href = fragment.dataUrl
    a.download = fragment.name
    a.click()
  }

  const downloadAll = () => {
    fragments.value.forEach((fragment, index) => {
      setTimeout(() => downloadFragment(fragment), index * 150)
    })
  }

  const drawOverlay = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    regions.value.forEach((region, index) => {
      const x = region.x * canvas.width
      const y = region.y * canvas.height
      const w = region.width * canvas.width
      const h = region.height * canvas.height

      ctx.strokeStyle = '#4F6EF7'
      ctx.lineWidth = 2
      ctx.strokeRect(x, y, w, h)

      ctx.fillStyle = 'rgba(79, 110, 247, 0.15)'
      ctx.fillRect(x, y, w, h)

      ctx.fillStyle = '#4F6EF7'
      ctx.font = 'bold 12px system-ui, sans-serif'
      ctx.fillText(`#${index + 1}`, x + 4, y + 14)
    })

    if (currentRegion.value) {
      const { x, y, width, height } = currentRegion.value
      const px = x * canvas.width
      const py = y * canvas.height
      const pw = width * canvas.width
      const ph = height * canvas.height

      ctx.strokeStyle = '#7C3AED'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(px, py, pw, ph)
      ctx.setLineDash([])

      ctx.fillStyle = 'rgba(124, 58, 237, 0.15)'
      ctx.fillRect(px, py, pw, ph)
    }
  }

  return {
    image,
    displaySize,
    scale,
    regions,
    fragments,
    isDrawing,
    currentRegion,
    isProcessing,
    error,
    handleFileSelect,
    handleDrop,
    clear,
    startDraw,
    updateDraw,
    endDraw,
    deleteRegion,
    clearRegions,
    downloadFragment,
    downloadAll,
    drawOverlay,
    formatSize,
  }
}
