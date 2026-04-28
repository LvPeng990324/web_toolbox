import { ref } from 'vue'

// MARD 拼豆颜色数据库
export interface MardoColor {
  code: string
  name: string
  r: number
  g: number
  b: number
}

// 常用MARD拼豆颜色库
export const mardColors: MardoColor[] = [
  // 基础黑色系
  { code: 'A01', name: '黑色', r: 0, g: 0, b: 0 },
  { code: 'A02', name: '深灰', r: 64, g: 64, b: 64 },
  { code: 'A03', name: '灰色', r: 128, g: 128, b: 128 },
  { code: 'A04', name: '浅灰', r: 192, g: 192, b: 192 },
  { code: 'A05', name: '白色', r: 255, g: 255, b: 255 },

  // 红色系
  { code: 'R01', name: '正红', r: 237, g: 28, b: 36 },
  { code: 'R02', name: '深红', r: 185, g: 14, b: 32 },
  { code: 'R03', name: '亮红', r: 255, g: 0, b: 0 },
  { code: 'R04', name: '橙红', r: 255, g: 83, b: 83 },
  { code: 'R05', name: '酒红', r: 128, g: 0, b: 32 },
  { code: 'R06', name: '砖红', r: 156, g: 82, b: 75 },
  { code: 'R07', name: '珊瑚红', r: 255, g: 127, b: 127 },
  { code: 'R08', name: '胭脂红', r: 170, g: 56, b: 73 },

  // 橙色系
  { code: 'O01', name: '橙色', r: 255, g: 165, b: 0 },
  { code: 'O02', name: '深橙', r: 232, g: 126, b: 4 },
  { code: 'O03', name: '亮橙', r: 255, g: 201, b: 71 },
  { code: 'O04', name: '桃色', r: 255, g: 182, b: 193 },
  { code: 'O05', name: '杏色', r: 255, g: 200, b: 160 },
  { code: 'O06', name: '焦糖色', r: 150, g: 90, b: 62 },

  // 黄色系
  { code: 'Y01', name: '黄色', r: 255, g: 242, b: 0 },
  { code: 'Y02', name: '金黄', r: 255, g: 215, b: 0 },
  { code: 'Y03', name: '柠檬黄', r: 255, g: 247, b: 83 },
  { code: 'Y04', name: '米黄', r: 255, g: 255, b: 220 },
  { code: 'Y05', name: '芥末黄', r: 227, g: 207, b: 87 },
  { code: 'Y06', name: '土黄', r: 204, g: 170, b: 102 },

  // 绿色系
  { code: 'G01', name: '绿色', r: 0, g: 175, b: 80 },
  { code: 'G02', name: '深绿', r: 34, g: 139, b: 34 },
  { code: 'G03', name: '亮绿', r: 0, g: 255, b: 0 },
  { code: 'G04', name: '浅绿', r: 144, g: 238, b: 144 },
  { code: 'G05', name: '草绿', r: 124, g: 252, b: 0 },
  { code: 'G06', name: '墨绿', r: 32, g: 100, b: 32 },
  { code: 'G07', name: '薄荷绿', r: 152, g: 255, b: 152 },
  { code: 'G08', name: '青绿', r: 64, g: 224, b: 208 },
  { code: 'G09', name: '松石绿', r: 0, g: 178, b: 169 },
  { code: 'G10', name: '苔绿', r: 138, g: 154, b: 73 },

  // 青色系
  { code: 'C01', name: '青色', r: 0, g: 183, b: 235 },
  { code: 'C02', name: '深青', r: 0, g: 128, b: 128 },
  { code: 'C03', name: '天蓝', r: 135, g: 206, b: 250 },
  { code: 'C04', name: '海蓝', r: 0, g: 105, b: 148 },
  { code: 'C05', name: '钴蓝', r: 0, g: 71, b: 171 },

  // 蓝色系
  { code: 'B01', name: '蓝色', r: 0, g: 85, b: 218 },
  { code: 'B02', name: '深蓝', r: 0, g: 0, b: 139 },
  { code: 'B03', name: '亮蓝', r: 30, g: 144, b: 255 },
  { code: 'B04', name: '湖蓝', r: 126, g: 192, b: 238 },
  { code: 'B05', name: '藏蓝', r: 0, g: 43, b: 91 },
  { code: 'B06', name: '普蓝', r: 25, g: 25, b: 112 },
  { code: 'B07', name: '午夜蓝', r: 0, g: 0, b: 128 },
  { code: 'B08', name: '浅蓝', r: 173, g: 216, b: 230 },
  { code: 'B09', name: '粉蓝', r: 176, g: 224, b: 230 },

  // 紫色系
  { code: 'P01', name: '紫色', r: 128, g: 0, b: 128 },
  { code: 'P02', name: '深紫', r: 102, g: 0, b: 153 },
  { code: 'P03', name: '亮紫', r: 155, g: 48, b: 255 },
  { code: 'P04', name: '品红', r: 255, g: 0, b: 255 },
  { code: 'P05', name: '紫罗兰', r: 138, g: 43, b: 226 },
  { code: 'P06', name: '兰紫', r: 138, g: 110, b: 197 },
  { code: 'P07', name: '暗紫', r: 75, g: 0, b: 130 },

  // 粉色系
  { code: 'F01', name: '粉色', r: 255, g: 192, b: 203 },
  { code: 'F02', name: '深粉', r: 255, g: 20, b: 147 },
  { code: 'F03', name: '亮粉', r: 255, g: 105, b: 180 },
  { code: 'F04', name: '玫瑰粉', r: 255, g: 174, b: 185 },
  { code: 'F05', name: '蜜桃粉', r: 255, g: 218, b: 185 },
  { code: 'F06', name: '藕粉', r: 216, g: 191, b: 216 },

  // 棕色系
  { code: 'W01', name: '棕色', r: 139, g: 69, b: 19 },
  { code: 'W02', name: '深棕', r: 101, g: 67, b: 33 },
  { code: 'W03', name: '浅棕', r: 205, g: 133, b: 63 },
  { code: 'W04', name: '可可色', r: 160, g: 82, b: 45 },
  { code: 'W05', name: '咖啡色', r: 111, g: 78, b: 55 },
  { code: 'W06', name: '栗色', r: 188, g: 82, b: 32 },
  { code: 'W07', name: '肉色', r: 255, g: 218, b: 185 },
  { code: 'W08', name: '驼色', r: 196, g: 154, b: 124 },
  { code: 'W09', name: '卡其色', r: 195, g: 176, b: 145 },
  { code: 'W10', name: '橄榄色', r: 128, g: 128, b: 0 },

  // 肤色系
  { code: 'S01', name: '肤色', r: 255, g: 223, b: 185 },
  { code: 'S02', name: '深肤色', r: 210, g: 180, b: 140 },
  { code: 'S03', name: '浅肤色', r: 255, g: 239, b: 213 },
  { code: 'S04', name: '古铜色', r: 255, g: 160, b: 122 },

  // 金属色系
  { code: 'M01', name: '银色', r: 192, g: 192, b: 192 },
  { code: 'M02', name: '金色', r: 255, g: 215, b: 0 },
  { code: 'M03', name: '古铜色', r: 205, g: 127, b: 50 },
  { code: 'M04', name: '铜色', r: 184, g: 115, b: 51 },
]

export interface ColorCount {
  code: string
  name: string
  r: number
  g: number
  b: number
  count: number
}

export interface PerlerOptions {
  gridWidth: number
  gridHeight: number
}

export interface ImageFile {
  file: File
  dataUrl: string
  width: number
  height: number
}

// 计算两个RGB颜色之间的欧几里得距离
function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  )
}

// 找到最接近的MARD颜色
function findClosestColor(r: number, g: number, b: number): MardoColor {
  let closest = mardColors[0]
  let minDistance = colorDistance(r, g, b, closest.r, closest.g, closest.b)

  for (const color of mardColors) {
    const distance = colorDistance(r, g, b, color.r, color.g, color.b)
    if (distance < minDistance) {
      minDistance = distance
      closest = color
    }
  }

  return closest
}

export function usePerlerBeads() {
  const image = ref<ImageFile | null>(null)
  const isProcessing = ref(false)
  const error = ref('')
  const previewUrl = ref('')
  const colorCounts = ref<ColorCount[]>([])

  // 标记当前正在修改的维度
  const editingWidth = ref(false)
  const editingHeight = ref(false)

  const options = ref<PerlerOptions>({
    gridWidth: 29,
    gridHeight: 29,
  })

  // 当图片加载时，初始化尺寸为原图比例
  const initGridSizeFromImage = () => {
    if (image.value) {
      const ratio = image.value.width / image.value.height
      // 默认宽度为 29，保持原图比例计算高度
      options.value.gridWidth = 29
      options.value.gridHeight = Math.round(29 / ratio)
    }
  }

  // 更新宽度时同步高度
  const onWidthInput = () => {
    if (!image.value) return
    const ratio = image.value.width / image.value.height
    options.value.gridHeight = Math.round(options.value.gridWidth / ratio)
  }

  // 更新高度时同步宽度
  const onHeightInput = () => {
    if (!image.value) return
    const ratio = image.value.width / image.value.height
    options.value.gridWidth = Math.round(options.value.gridHeight * ratio)
  }

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
        colorCounts.value = []
        initGridSizeFromImage()
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
        colorCounts.value = []
        initGridSizeFromImage()
      } catch {
        error.value = '图片加载失败'
      }
    }
  }

  const clear = () => {
    image.value = null
    previewUrl.value = ''
    error.value = ''
    colorCounts.value = []
  }

  const generatePattern = async () => {
    if (!image.value) {
      error.value = '请先上传图片'
      return
    }

    if (options.value.gridWidth < 5 || options.value.gridHeight < 5) {
      error.value = '尺寸至少需要 5x5'
      return
    }

    if (options.value.gridWidth > 200 || options.value.gridHeight > 200) {
      error.value = '尺寸最大为 200x200'
      return
    }

    isProcessing.value = true
    error.value = ''

    try {
      const img = new Image()
      img.src = image.value.dataUrl
      await new Promise((resolve) => { img.onload = resolve })

      // 计算每个格子的像素区域
      const cellWidth = img.width / options.value.gridWidth
      const cellHeight = img.height / options.value.gridHeight

      // 创建颜色计数Map
      const colorCountMap = new Map<string, ColorCount>()
      const gridData: MardoColor[][] = []

      // 创建画布用于绘制网格
      const canvas = document.createElement('canvas')
      canvas.width = options.value.gridWidth * 20
      canvas.height = options.value.gridHeight * 20
      const ctx = canvas.getContext('2d')!

      // 设置背景为白色
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制拼豆图案
      for (let y = 0; y < options.value.gridHeight; y++) {
        const row: MardoColor[] = []
        for (let x = 0; x < options.value.gridWidth; x++) {
          // 计算该格子对应的原图区域
          const startX = Math.floor(x * cellWidth)
          const startY = Math.floor(y * cellHeight)
          const endX = Math.floor((x + 1) * cellWidth)
          const endY = Math.floor((y + 1) * cellHeight)

          // 创建临时画布提取区域颜色
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = endX - startX
          tempCanvas.height = endY - startY
          const tempCtx = tempCanvas.getContext('2d')!
          tempCtx.drawImage(img, startX, startY, endX - startX, endY - startY, 0, 0, endX - startX, endY - startY)

          // 获取该区域所有像素
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
          const pixels = imageData.data

          // 计算平均颜色
          let totalR = 0, totalG = 0, totalB = 0
          let pixelCount = 0
          for (let i = 0; i < pixels.length; i += 4) {
            totalR += pixels[i]
            totalG += pixels[i + 1]
            totalB += pixels[i + 2]
            pixelCount++
          }

          const avgR = Math.round(totalR / pixelCount)
          const avgG = Math.round(totalG / pixelCount)
          const avgB = Math.round(totalB / pixelCount)

          // 找到最接近的MARD颜色
          const closestColor = findClosestColor(avgR, avgG, avgB)
          row.push(closestColor)

          // 绘制格子（正方形）
          const cellX = x * 20
          const cellY = y * 20
          const cellSize = 20
          ctx.fillStyle = `rgb(${closestColor.r}, ${closestColor.g}, ${closestColor.b})`
          ctx.fillRect(cellX, cellY, cellSize, cellSize)

          // 添加边框
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
          ctx.lineWidth = 1
          ctx.strokeRect(cellX, cellY, cellSize, cellSize)

          // 绘制颜色型号文字
          const code = closestColor.code
          // 根据亮度计算文字颜色（亮色背景用深色字，深色背景用浅色字）
          const brightness = (closestColor.r * 299 + closestColor.g * 587 + closestColor.b * 114) / 1000
          ctx.fillStyle = brightness > 128 ? '#333333' : '#ffffff'
          ctx.font = 'bold 7px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(code, cellX + cellSize / 2, cellY + cellSize / 2)

          // 更新颜色计数
          const key = closestColor.code
          if (colorCountMap.has(key)) {
            colorCountMap.get(key)!.count++
          } else {
            colorCountMap.set(key, {
              code: closestColor.code,
              name: closestColor.name,
              r: closestColor.r,
              g: closestColor.g,
              b: closestColor.b,
              count: 1,
            })
          }
        }
        gridData.push(row)
      }

      // 转换为数组并按数量排序
      colorCounts.value = Array.from(colorCountMap.values()).sort((a, b) => b.count - a.count)

      // 生成预览图
      previewUrl.value = canvas.toDataURL('image/png')
    } catch (err) {
      error.value = '生成失败，请重试'
      console.error(err)
    } finally {
      isProcessing.value = false
    }
  }

  const downloadPattern = () => {
    if (!previewUrl.value) {
      error.value = '请先生成图纸'
      return
    }

    const a = document.createElement('a')
    a.href = previewUrl.value
    a.download = `perler_pattern_${options.value.gridWidth}x${options.value.gridHeight}.png`
    a.click()
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return {
    image,
    isProcessing,
    error,
    previewUrl,
    colorCounts,
    options,
    handleFileSelect,
    handleDrop,
    onWidthInput,
    onHeightInput,
    clear,
    generatePattern,
    downloadPattern,
    formatSize,
  }
}
