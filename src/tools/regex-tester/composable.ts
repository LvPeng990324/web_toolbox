import { ref, computed } from 'vue'

interface MatchResult {
  match: string
  index: number
  groups: string[]
}

export function useRegexTester() {
  const pattern = ref('')
  const testText = ref('')
  const flags = ref({ g: true, i: false, m: false, s: false })

  const flagString = computed(() => {
    let f = ''
    if (flags.value.g) f += 'g'
    if (flags.value.i) f += 'i'
    if (flags.value.m) f += 'm'
    if (flags.value.s) f += 's'
    return f
  })

  const matches = computed<MatchResult[]>(() => {
    if (!pattern.value || !testText.value) return []
    try {
      const re = new RegExp(pattern.value, flagString.value)
      const results: MatchResult[] = []
      let match: RegExpExecArray | null

      if (flags.value.g) {
        while ((match = re.exec(testText.value)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          })
          if (!match[0]) re.lastIndex++
        }
      } else {
        match = re.exec(testText.value)
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          })
        }
      }
      return results
    } catch {
      return []
    }
  })

  const error = computed(() => {
    if (!pattern.value) return ''
    try {
      new RegExp(pattern.value)
      return ''
    } catch (e: any) {
      return e.message
    }
  })

  const highlightedHtml = computed(() => {
    if (!pattern.value || !testText.value || error.value) return ''
    try {
      const escaped = testText.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const re = new RegExp(pattern.value, flagString.value)
      return escaped.replace(re, '<mark class="bg-yellow-300 dark:bg-yellow-600/50 rounded px-0.5">$&</mark>')
    } catch {
      return ''
    }
  })

  const commonPatterns = [
    { name: '邮箱', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+' },
    { name: '手机号', pattern: '1[3-9]\\d{9}' },
    { name: 'URL', pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+' },
    { name: 'IP 地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+' },
    { name: '日期', pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}' },
  ]

  const insertPattern = (p: string) => {
    pattern.value = p
  }

  return { pattern, testText, flags, flagString, matches, error, highlightedHtml, commonPatterns, insertPattern }
}
