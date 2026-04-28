import type { ToolMeta } from '../types/tool'
import { meta as jsonFormatterMeta } from './json-formatter/meta'
import { meta as timestampConverterMeta } from './timestamp-converter/meta'
import { meta as hashGeneratorMeta } from './hash-generator/meta'
import { meta as textDiffMeta } from './text-diff/meta'
import { meta as regexTesterMeta } from './regex-tester/meta'
import { meta as dateDurationMeta } from './date-duration/meta'
import { meta as imageCompressMeta } from './image-compress/meta'
import { meta as imageCropMeta } from './image-crop/meta'
import { meta as imageMergeMeta } from './image-merge/meta'
import { meta as videoAudioExtractMeta } from './video-audio-extract/meta'
import { meta as audioEditorMeta } from './audio-editor/meta'
import { meta as audioConverterMeta } from './audio-converter/meta'
import { meta as qrGenerateMeta } from './qr-generate/meta'
import { meta as qrScanMeta } from './qr-scan/meta'
import { meta as crontabMeta } from './crontab/meta'

export const tools: ToolMeta[] = [
  jsonFormatterMeta,
  timestampConverterMeta,
  hashGeneratorMeta,
  textDiffMeta,
  regexTesterMeta,
  dateDurationMeta,
  imageCompressMeta,
  imageCropMeta,
  imageMergeMeta,
  videoAudioExtractMeta,
  audioEditorMeta,
  audioConverterMeta,
  qrGenerateMeta,
  qrScanMeta,
  crontabMeta,
]

export const toolMap = new Map(tools.map(t => [t.id, t]))
