# Web Toolbox - 项目结构说明

> **重要提示**: 本文档用于帮助 AI 快速理解项目结构。每次修改项目结构后，请同步更新本文档。

## 项目概述

**Web Toolbox** 是一个基于 Vue 3 + TypeScript + Vite 构建的在线开发工具箱，所有计算均在浏览器本地完成，无需后端服务。

- **技术栈**: Vue 3 (Composition API) + TypeScript + Vite 5 + Tailwind CSS 3 + Vue Router 4
- **图标库**: lucide-vue-next
- **主题**: 支持深色/浅色模式切换
- **路由模式**: HTML5 History 模式

---

## 目录结构

```
web_toolbox/
├── index.html                  # 入口 HTML
├── package.json                # 项目依赖配置
├── vite.config.ts              # Vite 构建配置
├── tsconfig.json               # TypeScript 根配置
├── tsconfig.app.json           # 应用 TypeScript 配置
├── tsconfig.node.json          # Node 环境 TypeScript 配置
├── tailwind.config.js          # Tailwind CSS 配置
├── postcss.config.js           # PostCSS 配置
├── README.md                   # 项目说明文档
├── PROJECT_STRUCTURE.md        # 项目结构说明（本文件）
├── public/
│   └── favicon.svg             # 网站图标
└── src/
    ├── main.ts                 # 应用入口文件
    ├── App.vue                 # 根组件
    ├── assets/                 # 静态资源
    ├── components/             # 公共组件
    ├── composables/            # 组合式函数
    ├── router/                 # 路由配置
    ├── styles/                 # 全局样式
    ├── types/                  # TypeScript 类型定义
    ├── tools/                  # 工具集合（核心）
    └── views/                  # 页面视图
```

---

## 核心架构说明

### 1. 应用入口

#### `src/main.ts`
- 创建 Vue 应用实例
- 挂载 Vue Router
- 引入全局样式

#### `src/App.vue`
- 应用根组件
- 包含 `AppHeader` 组件
- 使用 `<router-view>` 渲染页面
- 添加页面切换过渡动画（fade）

---

### 2. 路由系统 (`src/router/`)

#### `src/router/index.ts`
- **路由配置**:
  - `/` → `HomeView` (主页，展示所有工具卡片)
  - `/tool/:id` → `ToolView` (动态加载工具页面)
- 使用懒加载方式加载工具组件

**路由参数**:
- `:id` - 工具的唯一标识符，对应 `src/tools/` 下的目录名

---

### 3. 类型定义 (`src/types/`)

#### `src/types/tool.ts`
定义工具元数据接口 `ToolMeta`:
```typescript
interface ToolMeta {
  id: string           // 工具唯一标识（对应目录名）
  name: string         // 工具显示名称
  description: string  // 工具描述
  icon: string         // 图标名称（lucide-vue-next 图标）
  category: string     // 工具分类
}
```

---

### 4. 工具系统 (`src/tools/`)

这是项目的核心部分，每个工具都是独立的模块。

#### 工具注册 (`src/tools/index.ts`)
- 导入所有工具的 `meta` 元数据
- 导出 `tools` 数组（所有工具的元数据列表）
- 导出 `toolMap`（工具 ID → 元数据的 Map，用于快速查找）

#### 单个工具的结构

每个工具位于 `src/tools/<tool-id>/` 目录下，包含以下文件：

```
src/tools/<tool-id>/
├── meta.ts           # 工具元数据（必需）
├── index.vue         # 工具主组件（必需）
└── composable.ts     # 工具逻辑组合式函数（可选）
```

**文件说明**:

1. **`meta.ts`** - 工具元数据
   - 定义工具的 `id`、`name`、`description`、`icon`、`category`
   - 导出 `meta` 对象
   - 示例: `src/tools/json-formatter/meta.ts`

2. **`index.vue`** - 工具主组件
   - 工具的 UI 和交互逻辑
   - 使用 `<script setup lang="ts">` 语法
   - 可引入同目录的 `composable.ts` 复用逻辑

3. **`composable.ts`** - 逻辑组合式函数（可选）
   - 封装工具的核心逻辑
   - 导出 `use<ToolName>` 函数
   - 便于逻辑复用和测试

#### 添加新工具的步骤

1. 在 `src/tools/` 下创建新工具目录（如 `my-tool/`）
2. 创建 `meta.ts` 定义工具元数据
3. 创建 `index.vue` 实现工具界面
4. 在 `src/tools/index.ts` 中导入并注册新工具

---

### 5. 页面视图 (`src/views/`)

#### `src/views/HomeView.vue`
- 应用主页
- 展示所有工具的卡片网格
- 功能:
  - 工具搜索（按名称/描述过滤）
  - 分类筛选（全部/各类别）
  - 工具卡片导航到具体工具页面

#### `src/views/ToolView.vue`
- 工具页面容器
- 根据路由参数 `:id` 动态加载对应的工具组件
- 使用 `defineAsyncComponent` 实现懒加载
- 工具不存在时显示 `NotFound` 页面

#### `src/views/NotFound.vue`
- 404 页面

---

### 6. 公共组件 (`src/components/`)

#### `src/components/AppHeader.vue`
- 应用顶部导航栏
- 功能:
  - Logo 和标题（点击返回首页）
  - 返回按钮（非首页时显示）
  - 深色/浅色主题切换按钮
  - Toast 通知容器

#### `src/components/ToolCard.vue`
- 工具卡片组件
- 展示工具图标、名称、描述
- 点击跳转到工具页面
- 使用 `lucide-vue-next` 图标

#### `src/components/CopyButton.vue`
- 复制到剪贴板按钮
- 使用 `useCopyToClipboard` 组合式函数

---

### 7. 组合式函数 (`src/composables/`)

#### `src/composables/useTheme.ts`
- 主题管理（深色/浅色模式）
- 功能:
  - `initTheme()` - 初始化主题（从 localStorage 或系统偏好读取）
  - `toggleTheme()` - 切换主题
  - `isDark` - 当前是否为深色模式
- 主题状态保存在 `localStorage`

#### `src/composables/useToast.ts`
- Toast 通知系统
- 功能:
  - `show(message, duration)` - 显示通知
  - `toasts` - 当前活动的通知列表
- 自动定时移除通知

#### `src/composables/useCopyToClipboard.ts`
- 剪贴板操作
- 功能:
  - `copy(text)` - 复制文本到剪贴板
  - `copied` - 复制状态（用于显示反馈）

---

### 8. 样式系统 (`src/styles/`)

#### `src/styles/index.css`
- 全局样式入口
- 使用 Tailwind CSS 的 `@tailwind` 指令
- 定义 CSS 变量（支持深色/浅色模式）:
  - `--background` - 背景色
  - `--surface` - 表面色（卡片等）
  - `--text-primary` - 主要文字色
  - `--text-secondary` - 次要文字色
  - `--text-muted` - 静默文字色
  - `--border` - 边框色
  - `--shadow` - 阴影
  - `--primary` - 主题色
  - `--secondary` - 辅助色
- 定义公共组件类（如 `.surface-card`）

---

## 已实现的工具列表

| 工具 ID | 名称 | 分类 | 目录 |
|---------|------|------|------|
| `json-formatter` | JSON 格式化 | 文本处理 | `src/tools/json-formatter/` |
| `timestamp-converter` | 时间戳转换 | 文本处理 | `src/tools/timestamp-converter/` |
| `hash-generator` | 哈希生成器 | 文本处理 | `src/tools/hash-generator/` |
| `text-diff` | 文本对比 | 文本处理 | `src/tools/text-diff/` |
| `regex-tester` | 正则表达式测试 | 文本处理 | `src/tools/regex-tester/` |
| `date-duration` | 日期持续时间 | 文本处理 | `src/tools/date-duration/` |
| `image-compress` | 图片压缩 | 图片处理 | `src/tools/image-compress/` |
| `image-crop` | 图片裁剪 | 图片处理 | `src/tools/image-crop/` |
| `image-merge` | 图片合并 | 图片处理 | `src/tools/image-merge/` |
| `perler-beads` | 拼豆图纸生成 | 图片处理 | `src/tools/perler-beads/` |
| `video-audio-extract` | 视频音频提取 | 音视频处理 | `src/tools/video-audio-extract/` |
| `audio-editor` | 音频编辑器 | 音视频处理 | `src/tools/audio-editor/` |
| `audio-converter` | 音频转换器 | 音视频处理 | `src/tools/audio-converter/` |
| `qr-generate` | 二维码生成 | 其他 | `src/tools/qr-generate/` |
| `qr-scan` | 二维码扫描 | 其他 | `src/tools/qr-scan/` |
| `crontab` | Crontab | 其他 | `src/tools/crontab/` |

---

## 工具分类

- **文本处理**: JSON 格式化、时间戳转换、哈希生成器、文本对比、正则表达式测试、日期持续时间
- **图片处理**: 图片压缩、图片裁剪、图片合并、拼豆图纸生成
- **音视频处理**: 视频音频提取、音频编辑器、音频转换器
- **其他**: 二维码生成、二维码扫描、Crontab

---

## 开发指南

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

---

## 关键依赖说明

| 依赖 | 用途 |
|------|------|
| `vue` | Vue 3 框架 |
| `vue-router` | 路由管理 |
| `typescript` | TypeScript 支持 |
| `vite` | 构建工具 |
| `@vitejs/plugin-vue` | Vite Vue 插件 |
| `vue-tsc` | Vue TypeScript 类型检查 |
| `tailwindcss` | CSS 框架 |
| `tailwind-merge` | Tailwind 类名合并 |
| `tailwindcss-animate` | Tailwind 动画 |
| `lucide-vue-next` | 图标库 |
| `diff` | 文本对比功能 |
| `qrcode` | 二维码生成 |
| `jsqr` | 二维码扫描 |

---

## AI 修改指南

当你需要修改这个项目时：

1. **添加新工具**:
   - 在 `src/tools/` 创建新工具目录
   - 实现 `meta.ts`、`index.vue`（可选 `composable.ts`）
   - 在 `src/tools/index.ts` 中注册新工具

2. **修改现有工具**:
   - 找到 `src/tools/<tool-id>/` 目录
   - 修改对应的文件

3. **修改样式**:
   - 全局样式: `src/styles/index.css`
   - 组件样式: 在 `.vue` 文件的 `<style scoped>` 中修改

4. **修改路由**:
   - 编辑 `src/router/index.ts`

5. **添加公共组件**:
   - 在 `src/components/` 下创建新组件
   - 在需要的地方导入使用

6. **添加组合式函数**:
   - 在 `src/composables/` 下创建新文件
   - 导出 `use<FunctionName>` 函数

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-04-28 | v1.0 | 初始版本，创建项目结构说明文档 |

---

**注意**: 每次对项目结构进行重大修改后，请更新本文档以保持同步。
