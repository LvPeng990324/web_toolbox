import { ref, computed } from 'vue'
import * as Diff from 'diff'

export function useTextDiff() {
  const original = ref('')
  const modified = ref('')
  const mode = ref<'unified' | 'split'>('split')

  const diffResult = computed(() => {
    return Diff.diffLines(original.value, modified.value)
  })

  const unifiedLines = computed(() => {
    return diffResult.value.map((part: Diff.Change) => ({
      value: part.value,
      added: part.added,
      removed: part.removed,
    }))
  })

  const splitResult = computed(() => {
    const changes = diffResult.value
    const leftLines: { value: string; removed: boolean }[] = []
    const rightLines: { value: string; added: boolean }[] = []

    for (const change of changes) {
      const lines = change.value.replace(/\n$/, '').split('\n')
      for (const line of lines) {
        if (change.removed) {
          leftLines.push({ value: line, removed: true })
        } else if (change.added) {
          rightLines.push({ value: line, added: true })
        } else {
          leftLines.push({ value: line, removed: false })
          rightLines.push({ value: line, added: false })
        }
      }
    }
    return { left: leftLines, right: rightLines }
  })

  const stats = computed(() => {
    let added = 0, removed = 0
    for (const part of diffResult.value) {
      if (part.added) added += part.count || 0
      if (part.removed) removed += part.count || 0
    }
    return { added, removed }
  })

  return { original, modified, mode, diffResult, unifiedLines, splitResult, stats }
}
