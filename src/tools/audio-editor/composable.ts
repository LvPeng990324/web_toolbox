import { ref, shallowRef } from 'vue'

export interface AudioFile {
  file: File
  dataUrl: string
  duration: number
}

export interface Clip {
  id: string
  start: number
  end: number
  color: string
}

export function useAudioEditor() {
  const audioFile = ref<AudioFile | null>(null)
  const audioUrl = ref('')
  const audioBuffer = shallowRef<AudioBuffer | null>(null)
  const isProcessing = ref(false)
  const error = ref('')
  const duration = ref(0)
  const currentTime = ref(0)
  const isPlaying = ref(false)

  const clips = ref<Clip[]>([])
  const selectedClipId = ref<string | null>(null)
  const isSelecting = ref(false)
  const selectionStart = ref(0)
  const selectionEnd = ref(0)

  const waveformData = ref<number[]>([])

  const loadAudio = async (file: File): Promise<AudioFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const audioContext = new AudioContext()
          const arrayBuffer = e.target?.result as ArrayBuffer
          const decoded = await audioContext.decodeAudioData(arrayBuffer)
          audioBuffer.value = decoded
          duration.value = decoded.duration
          audioUrl.value = URL.createObjectURL(file)

          // 生成波形数据
          generateWaveformData(decoded)

          resolve({
            file,
            dataUrl: audioUrl.value,
            duration: decoded.duration,
          })
          audioContext.close()
        } catch (err) {
          reject(new Error('音频解码失败：' + (err instanceof Error ? err.message : '格式不支持')))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }

  const generateWaveformData = (buffer: AudioBuffer) => {
    const rawData = buffer.getChannelData(0)
    const samples = 200 // 波形的采样点数
    const blockSize = Math.floor(rawData.length / samples)
    const filteredData: number[] = []

    for (let i = 0; i < samples; i++) {
      let sum = 0
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j])
      }
      filteredData.push(sum / blockSize)
    }

    // 归一化
    const maxVal = Math.max(...filteredData)
    waveformData.value = filteredData.map(v => v / maxVal)
  }

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) {
      error.value = ''
      clips.value = []
      selectedClipId.value = null
      try {
        audioFile.value = await loadAudio(input.files[0])
      } catch (err) {
        error.value = err instanceof Error ? err.message : '音频加载失败'
      }
    }
  }

  const handleDrop = async (e: DragEvent) => {
    const file = e.dataTransfer?.files[0]
    if (file?.type.startsWith('audio/')) {
      error.value = ''
      clips.value = []
      selectedClipId.value = null
      try {
        audioFile.value = await loadAudio(file)
      } catch (err) {
        error.value = err instanceof Error ? err.message : '音频加载失败'
      }
    } else {
      error.value = '请上传音频文件'
    }
  }

  const clear = () => {
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
    }
    audioFile.value = null
    audioUrl.value = ''
    audioBuffer.value = null
    duration.value = 0
    currentTime.value = 0
    clips.value = []
    selectedClipId.value = null
    waveformData.value = []
    error.value = ''
  }

  const setCurrentTime = (time: number) => {
    currentTime.value = time
  }

  const setPlaying = (playing: boolean) => {
    isPlaying.value = playing
  }

  // 在波形上添加裁剪点
  const addClip = (start: number, end: number) => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b']
    const color = colors[clips.value.length % colors.length]
    clips.value.push({
      id: `clip-${Date.now()}`,
      start: Math.min(start, end),
      end: Math.max(start, end),
      color,
    })
  }

  // 删除选中的片段
  const deleteClip = (id: string) => {
    clips.value = clips.value.filter(c => c.id !== id)
    if (selectedClipId.value === id) {
      selectedClipId.value = null
    }
  }

  // 清空所有片段
  const clearClips = () => {
    clips.value = []
    selectedClipId.value = null
  }

  // 开始时间点选择
  const startSelection = (time: number) => {
    isSelecting.value = true
    selectionStart.value = time
    selectionEnd.value = time
  }

  // 更新选择
  const updateSelection = (time: number) => {
    if (isSelecting.value) {
      selectionEnd.value = time
    }
  }

  // 结束选择并添加片段
  const endSelection = () => {
    if (isSelecting.value) {
      const start = Math.min(selectionStart.value, selectionEnd.value)
      const end = Math.max(selectionStart.value, selectionEnd.value)
      if (end - start > 0.1) {
        addClip(start, end)
      }
      isSelecting.value = false
    }
  }

  // 导出音频
  const exportAudio = async (mode: 'keep' | 'remove') => {
    if (!audioBuffer.value || clips.value.length === 0) {
      error.value = '请先选择要保留或删除的片段'
      return
    }

    isProcessing.value = true
    error.value = ''

    try {
      const audioContext = new AudioContext()
      const originalBuffer = audioBuffer.value
      const sampleRate = originalBuffer.sampleRate

      // 获取要保留的时间范围
      const rangesToKeep: { start: number; end: number }[] = []

      if (mode === 'keep') {
        // 保留选中的片段
        rangesToKeep.push(...clips.value.map(c => ({ start: c.start, end: c.end })))
      } else {
        // 删除选中的片段，保留其他部分
        let currentPos = 0
        for (const clip of clips.value) {
          if (clip.start > currentPos) {
            rangesToKeep.push({ start: currentPos, end: clip.start })
          }
          currentPos = clip.end
        }
        if (currentPos < originalBuffer.duration) {
          rangesToKeep.push({ start: currentPos, end: originalBuffer.duration })
        }
      }

      // 计算新的长度
      let newLength = 0
      for (const range of rangesToKeep) {
        newLength += Math.floor((range.end - range.start) * sampleRate)
      }

      // 创建新的 AudioBuffer
      const newBuffer = audioContext.createBuffer(
        originalBuffer.numberOfChannels,
        newLength,
        sampleRate
      )

      // 复制音频数据
      let offset = 0
      for (const range of rangesToKeep) {
        const startSample = Math.floor(range.start * sampleRate)
        const endSample = Math.floor(range.end * sampleRate)
        const length = endSample - startSample

        for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
          const originalData = originalBuffer.getChannelData(channel)
          const newData = newBuffer.getChannelData(channel)
          for (let i = 0; i < length; i++) {
            newData[offset + i] = originalData[startSample + i]
          }
        }
        offset += length
      }

      // 转换为 WAV 并下载
      const wavBlob = audioBufferToWav(newBuffer)
      downloadBlob(wavBlob, `edited_${audioFile.value?.file.name.replace(/\.[^.]+$/, '_edited.wav') || 'audio.wav'}`)

      audioContext.close()
    } catch (err) {
      error.value = '导出失败：' + (err instanceof Error ? err.message : '未知错误')
    } finally {
      isProcessing.value = false
    }
  }

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const format = 1
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
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)

    // data chunk
    writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

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

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  return {
    audioFile,
    audioUrl,
    audioBuffer,
    isProcessing,
    error,
    duration,
    currentTime,
    isPlaying,
    clips,
    selectedClipId,
    isSelecting,
    selectionStart,
    selectionEnd,
    waveformData,
    handleFileSelect,
    handleDrop,
    clear,
    setCurrentTime,
    setPlaying,
    addClip,
    deleteClip,
    clearClips,
    startSelection,
    updateSelection,
    endSelection,
    exportAudio,
    formatSize,
    formatTime,
  }
}
