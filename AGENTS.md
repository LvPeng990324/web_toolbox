# AI 协作规则 - Web Toolbox

本文档描述 AI 在参与本项目开发时必须遵循的规则。

---

## 1. 项目结构理解

- **每次** 对项目进行理解、分析或修改前，**必须先阅读** `PROJECT_STRUCTURE.md` 文件。
- 通过该文档快速掌握项目目录结构、技术栈和核心架构。

## 2. 项目结构维护

- 当对项目结构进行**重大修改**后（如新增目录、调整文件组织、新增/删除工具等），**必须同步更新** `PROJECT_STRUCTURE.md` 文件。
- 保持该文档与实际项目结构一致。

## 3. 工具开发约定

本项目采用模块化工具架构，每个工具位于 `src/tools/<tool-id>/` 目录下。

### 3.1 文件规范

| 文件 | 必需 | 说明 |
|------|------|------|
| `meta.ts` | 是 | 定义工具元数据（`id`、`name`、`description`、`icon`、`category`） |
| `index.vue` | 是 | 工具主组件，使用 `<script setup lang="ts">` 语法 |
| `composable.ts` | 否 | 可选，封装工具核心逻辑，导出 `use<ToolName>` 函数 |

### 3.2 添加新工具步骤

1. 在 `src/tools/` 下创建新工具目录（如 `my-tool/`）。
2. 创建 `meta.ts` 定义工具元数据。
3. 创建 `index.vue` 实现工具界面。
4. 如需，创建 `composable.ts` 封装核心逻辑。
5. 在 `src/tools/index.ts` 中导入并注册新工具。
6. **更新** `PROJECT_STRUCTURE.md` 中的工具列表和分类。

## 4. 代码规范

- **语言**: 使用 TypeScript，严禁使用 `any` 类型（除非确实无法避免）。
- **Vue 语法**: 统一使用 Composition API + `<script setup lang="ts">`。
- **样式**: 
  - 全局样式修改 → `src/styles/index.css`
  - 组件局部样式 → `.vue` 文件的 `<style scoped>`
  - 优先使用 Tailwind CSS 工具类。
- **图标**: 统一使用 `lucide-vue-next` 图标库。

## 5. 路由约定

- 工具路由采用动态参数 `/tool/:id`，`:id` 对应工具目录名。
- 如需调整路由，编辑 `src/router/index.ts`。

## 6. 公共组件与组合式函数

- 新增公共组件 → `src/components/` 目录。
- 新增组合式函数 → `src/composables/` 目录，命名格式为 `use<FunctionName>`。

## 7. 构建与验证

- 修改后应确保项目能正常构建：`npm run build`。
- 开发调试使用：`npm run dev`。

---

> 注意：本文档与 `PROJECT_STRUCTURE.md` 相辅相成。前者规定**AI 行为规则**，后者描述**项目结构细节**。
