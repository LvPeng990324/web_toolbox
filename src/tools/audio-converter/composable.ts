import { ref } from 'vue'

// lamejs 类型声明
declare const lamejs: {
  Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => {
    encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array
    flush(): Int8Array
  }
}

export interface AudioFile {
  file: File
  dataUrl: string
  duration: number
}

export type OutputFormat = 'wav' | 'mp3'

export function useAudioConverter() {
  const audioFile = ref<AudioFile | null>(null)
  const audioUrl = ref('')
  const audioBuffer = ref<AudioBuffer | null>(null)
  const isProcessing = ref(false)
  const error = ref('')
  const outputFormat = ref<OutputFormat>('mp3')

  const loadAudio = async (file: File): Promise<AudioFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const audioContext = new AudioContext()
          const arrayBuffer = e.target?.result as ArrayBuffer
          const decoded = await audioContext.decodeAudioData(arrayBuffer)
          audioBuffer.value = decoded
          audioUrl.value = URL.createObjectURL(file)

          resolve({
            file,
            dataUrl: audioUrl.value,
            duration: decoded.duration,
          })
        } catch (err) {
          reject(new Error('音频解码失败：' + (err instanceof Error ? err.message : '格式不支持')))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsArrayBuffer(file)
    })
  }

  const handleFileSelect = async (e: Event) => {
    const input = e.target as HTMLInputElement
    if (input.files?.[0]) {
      error.value = ''
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
    error.value = ''
  }

  const convert = async () => {
    if (!audioFile.value || !audioBuffer.value) {
      error.value = '请先上传音频文件'
      return
    }

    isProcessing.value = true
    error.value = ''

    try {
      let blob: Blob

      if (outputFormat.value === 'wav') {
        blob = audioBufferToWav(audioBuffer.value)
      } else {
        blob = await audioBufferToMp3(audioBuffer.value)
      }

      const filename = audioFile.value.file.name.replace(/\.[^.]+$/, `.${outputFormat.value}`)
      downloadBlob(blob, filename)
    } catch (err) {
      error.value = '转换失败：' + (err instanceof Error ? err.message : '未知错误')
    } finally {
      isProcessing.value = false
    }
  }

  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
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
    view.setUint16(20, 1, true) // PCM
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

  const audioBufferToMp3 = async (buffer: AudioBuffer): Promise<Blob> => {
    // 动态加载 lamejs
    const lamejs = await loadLameJs()

    const mp3encoder = new lamejs.Mp3Encoder(buffer.numberOfChannels, buffer.sampleRate, 128)
    const mp3Data: Int8Array[] = []

    const sampleBlockSize = 1152
    const leftChannel = buffer.getChannelData(0)
    const rightChannel = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel

    for (let i = 0; i < leftChannel.length; i += sampleBlockSize) {
      const leftChunk = new Int16Array(sampleBlockSize)
      const rightChunk = new Int16Array(sampleBlockSize)

      for (let j = 0; j < sampleBlockSize && i + j < leftChannel.length; j++) {
        leftChunk[j] = Math.max(-32768, Math.min(32767, Math.floor(leftChannel[i + j] * 32767.5)))
        rightChunk[j] = Math.max(-32768, Math.min(32767, Math.floor(rightChannel[i + j] * 32767.5)))
      }

      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk)
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf)
      }
    }

    const mp3End = mp3encoder.flush()
    if (mp3End.length > 0) {
      mp3Data.push(mp3End)
    }

    return new Blob(mp3Data, { type: 'audio/mp3' })
  }

  const loadLameJs = (): Promise<typeof lamejs> => {
    return new Promise((resolve, reject) => {
      if (typeof lamejs !== 'undefined') {
        resolve(lamejs)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js'
      script.onload = () => resolve(lamejs)
      script.onerror = () => reject(new Error('加载 MP3 编码器失败'))
      document.head.appendChild(script)
    })
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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    audioFile,
    audioUrl,
    isProcessing,
    error,
    outputFormat,
    handleFileSelect,
    handleDrop,
    clear,
    convert,
    formatSize,
    formatDuration,
  }
}
