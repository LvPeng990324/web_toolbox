<template>
  <div class="max-w-xl mx-auto">
    <h2 class="text-xl font-semibold mb-6" :style="{ color: 'var(--text-primary)' }">文本粘贴</h2>

    <div class="surface-card p-8 rounded-lg border text-center" :style="{ borderColor: 'var(--border)' }">
      <div class="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <ClipboardPaste :size="28" class="text-primary" />
      </div>

      <h3 class="text-lg font-semibold mb-2" :style="{ color: 'var(--text-primary)' }">
        在线文本粘贴板
      </h3>
      <p class="text-sm mb-6 leading-relaxed" :style="{ color: 'var(--text-secondary)' }">
        该工具托管在外部站点，点击按钮将在新标签页中打开。<br>
        支持临时分享文本内容，无需注册即可使用。
      </p>

      <a
        href="http://paste.lvpeng990324.cn"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-primary inline-flex items-center gap-2"
      >
        <ExternalLink :size="16" />
        <span>在新标签页打开</span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardPaste, ExternalLink } from 'lucide-vue-next'
</script>
