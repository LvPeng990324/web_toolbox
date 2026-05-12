import type { ToolMeta } from '../types/tool'

const metaModules = import.meta.glob('./*/meta.ts', { eager: true })

export const tools: ToolMeta[] = Object.values(metaModules)
  .map((mod: any) => mod.meta as ToolMeta)
  .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))

export const toolMap = new Map(tools.map(t => [t.id, t]))
