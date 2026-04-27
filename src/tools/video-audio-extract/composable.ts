import { ref } from 'vue'

export interface VideoFile {
  file: File
  dataUrl: string
  duration: number
}

export function useVideoAudioExtract() {
  const video = ref<VideoFile | null>(null)
  const audioUrl = ref('')
  const isProcessing = ref(false)
  const error = ref('')

  const loadVideo = (file: File): Promise<VideoFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const videoEl = document.createElement('video')
        videoEl.preload = 'metadata'
        videoEl.onloadedmetadata = () => {
          resolve({
            file,
            dataUrl: e.target?.result as string,
            duration: videoEl.duration,
          })
          videoEl.remove()
        }
        videoEl.onerror = () => {
          reject(new Error('视频加载失败'))
          videoEl.remove()
        }
        videoEl.src = e.target?.result as string
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
        video.value = await loadVideo(input.files[0])
        audioUrl.value = ''
      } catch {
        error.value = '视频加载失败，请确保文件格式正确'
      }
    }
  }

  const handleDrop = async (e: DragEvent) => {
    const file = e.dataTransfer?.files[0]
    if (file?.type.startsWith('video/')) {
      error.value = ''
      try {
        video.value = await loadVideo(file)
        audioUrl.value = ''
      } catch {
        error.value = '视频加载失败，请确保文件格式正确'
      }
    } else {
      error.value = '请上传视频文件'
    }
  }

  const extractAudio = async () => {
    if (!video.value) {
      error.value = '请先上传视频'
      return
    }

    isProcessing.value = true
    error.value = ''

    try {
      const audioContext = new AudioContext()
      const response = await fetch(video.value.dataUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // 获取原始音频参数
      const numberOfChannels = audioBuffer.numberOfChannels
      const sampleRate = audioBuffer.sampleRate
      const length = audioBuffer.length

      // 创建新的 AudioBuffer（仅音频）
      const newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate)

      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel)
        newBuffer.copyToChannel(channelData, channel)
      }

      // 转换为 WAV 格式
      const wavBlob = audioBufferToWav(newBuffer)
      audioUrl.value = URL.createObjectURL(wavBlob)

      // 自动下载
      downloadBlob(wavBlob, video.value.file.name.replace(/\.[^.]+$/, '_audio.wav'))

      audioContext.close()
    } catch (err) {
      error.value = '音频提取失败：' + (err instanceof Error ? err.message : '未知错误')
    } finally {
      isProcessing.value = false
    }
  }

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numberOfChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = buffer.length * blockAlign
    const headerSize = 44
    const totalSize = headerSize + dataSize

    const arrayBuffer = new ArrayBuffer(totalSize)
    const view = new DataView(arrayBuffer)

    // RIFF header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, totalSize - 8, true)
    writeString(view, 8, 'WAVE')

    // fmt chunk
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // chunk size
    view.setUint16(20, format, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)

    // data chunk
    writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

    // 写入音频数据
    const channels: Float32Array[] = []
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    let offset = 44
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]))
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(offset, intSample, true)
        offset += 2
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
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

  const clear = () => {
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
    }
    video.value = null
    audioUrl.value = ''
    error.value = ''
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    video,
    audioUrl,
    isProcessing,
    error,
    handleFileSelect,
    handleDrop,
    extractAudio,
    clear,
    formatSize,
    formatDuration,
  }
}
