# Web Toolbox - 在线工具箱

> **Agent 规则**：每次对项目结构、工具列表、依赖库、样式规范或配置文件进行修改后，必须同步更新 `AGENTS.md`，确保文档与代码保持一致。

## 项目概述

Web Toolbox 是一个基于浏览器的在线开发工具集合，所有计算均在客户端本地完成，不涉及服务器上传。项目采用 Vue 3 + TypeScript + Vite 构建，使用 Tailwind CSS 进行样式设计，支持浅色/深色主题切换。

项目面向中文用户，界面语言为简体中文（zh-CN）。

## 技术栈

- **框架**: Vue 3（Composition API + `<script setup>`）
- **语言**: TypeScript（严格模式）
- **构建工具**: Vite 5
- **路由**: Vue Router 4（history 模式）
- **样式**: Tailwind CSS 3 + PostCSS + Autoprefixer
- **图标**: Lucide Vue Next
- **依赖库**:
  - `diff` — 文本差异对比
  - `jsqr` — 二维码识别
  - `qrcode` — 二维码生成

## 项目结构

```
src/
├── main.ts                 # 应用入口：创建 Vue 实例、挂载路由、初始化主题
├── App.vue                 # 根组件：包含 AppHeader 和 router-view 过渡动画
├── vite-env.d.ts           # Vite 客户端类型声明
├── components/             # 全局共享组件
│   ├── AppHeader.vue       # 顶部导航栏（返回、主题切换、Toast 容器）
│   ├── ToolCard.vue        # 首页工具卡片
│   └── CopyButton.vue      # 复制到剪贴板按钮（带状态反馈）
├── composables/            # 可复用组合式函数
│   ├── useCopyToClipboard.ts
│   ├── useFileUpload.ts    # 文件上传辅助（readFileAsDataURL、formatSize）
│   ├── useTheme.ts         # 深色/浅色主题管理（localStorage + prefers-color-scheme）
│   └── useToast.ts         # 全局 Toast 通知
├── router/
│   └── index.ts            # 路由配置：'/' 首页，'/tool/:id' 工具页
├── styles/
│   └── index.css           # Tailwind 指令 + CSS 变量 + 通用组件样式
├── types/
│   └── tool.ts             # ToolMeta 接口定义
├── views/
│   ├── HomeView.vue        # 首页（搜索、分类筛选、工具网格）
│   ├── ToolView.vue        # 工具动态加载容器（异步组件）
│   └── NotFound.vue        # 工具未找到页面
└── tools/                  # 各工具目录（每个工具独立子目录）
    ├── index.ts            # 自动收集所有工具的 meta 信息
    └── <tool-id>/
        ├── meta.ts         # 工具元数据（id、name、description、icon、category）
        ├── composable.ts   # 工具业务逻辑（Composition API）
        └── index.vue       # 工具 UI 组件
```

## 构建与运行命令

```bash
# 开发服务器（host: 0.0.0.0，允许外部访问）
npm run dev

# 生产构建（类型检查 + Vite 打包）
npm run build

# 预览生产构建
npm run preview
```

构建产物输出至 `dist/` 目录，为纯静态文件，可直接部署到任何静态托管服务。

## 工具开发规范

### 新增工具的目录结构

每个工具必须是一个独立的子目录，位于 `src/tools/<tool-id>/`，包含三个文件：

1. **`meta.ts`** — 导出 `meta` 对象，遵循 `ToolMeta` 接口：
   ```ts
   export interface ToolMeta {
     id: string      // 唯一标识，作为路由参数
     name: string    // 工具名称（中文）
     description: string
     icon: string    // Lucide 图标组件名称
     category: string // 分类名称（如：文本处理、编码转换、图片处理等）
   }
   ```

2. **`composable.ts`** — 封装工具的业务逻辑，以 `useXxx()` 函数导出：
   - 使用 Vue 的 `ref`、`computed` 等响应式 API
   - 处理输入验证、错误状态
   - 返回需要在模板中使用的状态和操作方法

3. **`index.vue`** — 工具的 UI 组件：
   - 使用 `<script setup lang="ts">`
   - 导入 `./composable` 获取业务逻辑
   - 标题使用 `h2.text-xl.font-semibold.mb-6`
   - 使用 CSS 变量（如 `var(--text-primary)`、`var(--surface)`）适配主题
   - 按钮使用 `.btn`、`.btn-primary`、`.btn-ghost` 等预定义类
   - 卡片容器使用 `.surface-card`
   - 文本域和输入框遵循统一的圆角、边框、聚焦样式

### 图标规范

- 统一使用 `lucide-vue-next` 图标库
- 在 `ToolCard.vue` 的 `iconMap` 中注册新增图标，否则回退到 `Braces`
- 常用图标尺寸：`size="16"`（按钮内）、`size="20"`（导航栏）、`size="22"`（卡片图标）

### 主题与样式规范

- **颜色系统**: 通过 CSS 变量定义，支持 `dark` 类切换：
  - `--background` / `--surface` — 背景色
  - `--text-primary` / `--text-secondary` / `--text-muted` — 文字层级
  - `--border` — 边框色
  - `--primary` / `--primary-light` / `--secondary` — 品牌色
- **Tailwind 配置**: `tailwind.config.js` 中扩展了 `primary` 和 `secondary` 颜色，并启用 `darkMode: 'class'`
- **过渡动画**: 主题切换时有 `0.3s` 的背景/边框/颜色过渡
- **按钮样式**: 使用 `src/styles/index.css` 中定义的 `.btn`、`.btn-primary`、`.btn-secondary`、`.btn-ghost`、`.btn-outline`

### 代码风格

- TypeScript 严格模式开启（`strict: true`）
- 未使用的局部变量和参数会报错（`noUnusedLocals`、`noUnusedParameters`）
- 使用 ES Module（`"type": "module"`）
- 组件内样式使用 `<style scoped>`，通用样式放 `src/styles/index.css`
- 字符串使用单引号

## 路由与导航

- 首页 `/`：展示所有工具卡片，支持搜索和分类筛选
- 工具页 `/tool/:id`：通过 `defineAsyncComponent` 动态导入 `src/tools/:id/index.vue`
- 无效工具 ID：回退到 `NotFound.vue`

## 状态管理与共享逻辑

- **无全局状态管理库**（无 Pinia/Vuex）
- 主题状态通过 `useTheme()` 管理，使用 `localStorage` 持久化
- Toast 通过模块级 `ref` 实现全局单例，`AppHeader.vue` 中渲染容器
- 各工具的业务逻辑封装在各自的 `composable.ts` 中，保持独立

## 测试策略

**当前项目未配置测试框架**，无单元测试、集成测试或 E2E 测试。

如需添加测试，建议：
- 单元测试：Vitest（与 Vite 生态一致）
- 组件测试：Vue Test Utils
- E2E 测试：Playwright

## 安全注意事项

- **纯前端应用**：所有数据处理在浏览器本地完成，无后端 API
- 文件处理工具（图片压缩、视频音频提取等）使用 `FileReader` 和 `URL.createObjectURL`，不上传服务器
- 使用 `navigator.clipboard.writeText` 进行剪贴板操作，需在安全上下文（HTTPS/localhost）中运行
- 无用户认证、无会话管理、无敏感数据存储

## 部署说明

1. 运行 `npm run build` 生成 `dist/` 目录
2. `dist/` 为纯静态资源，可直接部署到：
   - Nginx / Apache
   - GitHub Pages / Vercel / Netlify / Cloudflare Pages
   - 对象存储（OSS / S3 + CDN）
3. 由于是 SPA，部署时需配置路由回退到 `index.html`

## 开发环境要求

- Node.js（建议 v18+）
- npm

```bash
npm install
npm run dev
```

开发服务器默认监听 `0.0.0.0`，可通过局域网 IP 访问。
