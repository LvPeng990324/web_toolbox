import type { ToolMeta } from '../types/tool'
import { meta as jsonFormatterMeta } from './json-formatter/meta'
import { meta as timestampConverterMeta } from './timestamp-converter/meta'
import { meta as hashGeneratorMeta } from './hash-generator/meta'
import { meta as textDiffMeta } from './text-diff/meta'
import { meta as regexTesterMeta } from './regex-tester/meta'

export const tools: ToolMeta[] = [
  jsonFormatterMeta,
  timestampConverterMeta,
  hashGeneratorMeta,
  textDiffMeta,
  regexTesterMeta,
]

export const toolMap = new Map(tools.map(t => [t.id, t]))
