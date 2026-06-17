# 全局水印 — Global Watermark

## TL;DR

> **Quick Summary**: 在 Vue 3 + Cesium 应用中添加全屏斜铺 Canvas 水印，实时显示当前时间（YYYY-MM-DD HH:mm:ss），每秒刷新，半透明不阻挡操作。
>
> **Deliverables**:
> - `src/components/watermark/GlobalWatermark.vue` — Canvas 水印组件
> - `src/App.vue` — 集成 Teleport 挂载
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO — 2 sequential tasks
> **Critical Path**: Task 1 → Task 2 → Task F1-F4

---

## Context

### Original Request
设置一个全局水印，显示为打开网页的时间，精确到秒。后续确认：实时走动的当前时间、全屏斜铺重复水印、灰色半透明、仅显示时间文字。

### Interview Summary
**Key Discussions**:
- 样式：斜铺重复水印 —— 对角线-22°、全屏平铺
- 时间：YYYY-MM-DD HH:mm:ss，每秒实时更新（非页面打开固定时间戳）
- 颜色：`rgba(180,180,180,0.15)` 灰色半透明
- 文字：仅当前时间，无附加信息
- 实现：纯 Canvas 2D，不引入第三方库（library 搜索未找到合适的实时更新水印库）
- 测试：无需自动化测试，Playwright agent QA 验证

**Research Findings**:
- App.vue 布局：`n-config-provider > .app-shell` （flex-col, 100vh），无 router-view
- AppHeader z-index: 100，是当前最高层级
- `.app-shell` 有 `overflow: hidden`
- 无现有 fixed-position 元素或 overlay 组件
- 推荐挂载方式：`<Teleport to="body">` 避开 overflow:hidden

### Metis Review
**Identified Gaps** (addressed):
- Z-index 未指定 → 9999（高于 AppHeader 的 100）
- 挂载策略不清 → Teleport to body
- Canvas 参数缺失 → -22°角、16px字体、Arial、devicePixelRatio
- HiDPI 未处理 → canvas buffer = CSS尺寸 × devicePixelRatio
- Tab 隐藏未暂停 → Page Visibility API
- 打印未隐藏 → @media print
- 无障碍未处理 → aria-hidden + role="presentation"

---

## Work Objectives

### Core Objective
在 Vue 3 + Cesium 应用中添加全屏 Canvas 水印覆盖层，实时显示当前时间（每秒刷新），半透明斜铺重复，不阻挡用户操作。

### Concrete Deliverables
- `src/components/watermark/GlobalWatermark.vue` — 自包含水印组件
- 修改 `src/App.vue` — 引入并挂载水印组件

### Definition of Done
- [ ] 浏览器打开页面后，全屏可见灰色半透明时间水印
- [ ] 水印文字沿对角线-22°重复平铺
- [ ] 时间每秒更新（Playwright 两次截图可检测变化）
- [ ] 点击/拖拽 Cesium 地图正常工作（水印不阻挡交互）
- [ ] 切换示例组件水印持续显示
- [ ] Tab 切到后台水印暂停更新
- [ ] 打印时不显示水印
- [ ] Canvas 尺寸随窗口 resize 自适应

### Must Have
- 全屏覆盖（z-index: 9999）
- 实时更新时间（每秒 via setInterval）
- pointer-events: none
- devicePixelRatio 高清适配
- Page Visibility API 暂停/恢复
- 组件卸载时清理所有定时器和事件监听器
- aria-hidden="true", role="presentation"

### Must NOT Have (Guardrails)
- ❌ 不引入任何 npm 依赖（纯 Canvas 2D）
- ❌ 不修改 index.html
- ❌ 不添加开关按钮/配置面板
- ❌ 不附加用户名/IP/域名
- ❌ 不影响 Cesium 地图交互
- ❌ 不修改 CesiumPreview.vue 或其他示例组件
- ❌ 不添加 CSS transition/animation

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None
- **Framework**: N/A
- **Verification**: Agent-executed QA via Playwright ONLY

### QA Policy
Every task includes agent-executed QA scenarios. Evidence saved to `.omo/evidence/`.

- **Frontend/UI**: Playwright — navigate, screenshot, interact, check console errors

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Implementation):
├── Task 1: Create GlobalWatermark.vue component
└── Task 2: Integrate into App.vue

Wave FINAL (After implementation):
├── Task F1: Plan Compliance Audit (oracle)
├── Task F2: Code Quality Review (unspecified-high)
├── Task F3: Real Manual QA (unspecified-high + playwright)
└── Task F4: Scope Fidelity Check (deep)

Critical Path: Task 1 → Task 2 → F1-F4
```

### Agent Dispatch Summary
- **1**: **2** — T1 → `quick`, T2 → `quick`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Create GlobalWatermark.vue component

  **What to do**:
  - 创建 `src/components/watermark/GlobalWatermark.vue`
  - 使用 `<script setup lang="ts">` + `<Teleport to="body">`
  - Canvas 元素：`<canvas ref="canvasRef" aria-hidden="true" role="presentation" data-watermark />`
  - CSS：`position: fixed; inset: 0; z-index: 9999; pointer-events: none;`
  - Canvas 绘制逻辑（`drawWatermark` 函数）：
    - 获取 `window.devicePixelRatio`，设置 canvas.width/height = CSS尺寸 × dpr
    - 填充透明背景
    - 格式化时间：`YYYY-MM-DD HH:mm:ss`（用 `new Date()` 手动格式化）
    - 字体：`${16 * dpr}px Arial, Helvetica, sans-serif`
    - 颜色：`rgba(180, 180, 180, 0.15)`
    - 旋转：`ctx.rotate(-22 * Math.PI / 180)`，平铺循环绘制
    - 间距：水平 ~5列，垂直 ~4行（基于 Canvas 逻辑尺寸计算）
  - 实时更新：`setInterval(drawWatermark, 1000)` 每秒重绘
  - Tab 暂停：`document.addEventListener('visibilitychange')` → 隐藏时 `clearInterval`，可见时恢复
  - 窗口 resize：`window.addEventListener('resize')` → 更新 Canvas 尺寸并重绘
  - 打印隐藏：`@media print { canvas { display: none; } }`（在 `<style>` 中）
  - `onUnmounted` 清理：`clearInterval` + `removeEventListener('resize')` + `removeEventListener('visibilitychange')`

  **Must NOT do**:
  - 不引入任何第三方库
  - 不添加 props/emits（无外部配置）
  - 不使用 `requestAnimationFrame`（1 FPS 足够）
  - 不修改 index.html

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file, pure Canvas 2D logic, no complex dependencies
  - **Skills**: []
    - No special skills required — Vue 3 composition API + Canvas 2D

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (solo — App.vue integration requires this component)
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References**:
  - `src/App.vue:1-54` — App layout structure, see `<n-config-provider>` wrapper for Teleport sibling placement
  - `src/components/layout/AppHeader.vue:74` — AppHeader z-index: 100, watermark must exceed this
  - `src/components/map/CesiumPreview.vue:10-31` — Viewer mount pattern, Cesium canvas lifecycle
  - `src/assets/main.css` — Global styles, dark theme background `#0a1628`
  - Canvas 2D API: `ctx.rotate()`, `ctx.fillText()`, `ctx.font`, `ctx.fillStyle` — standard API, no library needed
  - `window.devicePixelRatio` — MDN reference for HiDPI canvas scaling
  - Page Visibility API: `document.visibilitychange` event + `document.hidden` property

  **Acceptance Criteria**:
  - [ ] File created: `src/components/watermark/GlobalWatermark.vue`
  - [ ] Component renders a full-screen Canvas via Teleport to body
  - [ ] Canvas displays current time in `YYYY-MM-DD HH:mm:ss` format
  - [ ] Text repeats in diagonal pattern (~5 columns × ~4 rows)
  - [ ] `npm run build-only` passes

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Watermark renders and shows current time
    Tool: Playwright (browser_navigate + browser_run_code_unsafe)
    Preconditions: Dev app running on http://127.0.0.1:5173
    Steps:
      1. Navigate to http://127.0.0.1:5173/
      2. Wait 2s for Cesium + watermark to load
      3. Check: `document.querySelector('canvas[data-watermark]')` returns non-null element
      4. Check: Canvas bounding box width ≈ window.innerWidth, height ≈ window.innerHeight
      5. Check: Canvas has `style.pointerEvents === 'none'`
      6. Check: Canvas has `aria-hidden === 'true'`
    Expected Result: Canvas watermark element exists, full viewport, non-interactive, accessible
    Failure Indicators: Canvas not found, wrong dimensions, pointer-events not 'none', missing aria-hidden
    Evidence: .omo/evidence/task-1-watermark-exists.png

  Scenario: Time format is correct and updates every second
    Tool: Playwright (browser_run_code_unsafe)
    Preconditions: Watermark loaded
    Steps:
      1. Read canvas pixel data via toDataURL at t=0
      2. Wait 1500ms
      3. Read canvas pixel data via toDataURL at t=1.5s
      4. Compare: two data URLs are different (proves time updated)
    Expected Result: Canvas content changes between captures (second digit updates)
    Failure Indicators: Data URLs identical after 1.5s (time not updating)
    Evidence: .omo/evidence/task-1-time-updates.txt (data URL diff summary)

  Scenario: Canvas handles HiDPI scaling
    Tool: Playwright (browser_evaluate)
    Preconditions: Watermark loaded
    Steps:
      1. Evaluate: `const c = document.querySelector('canvas[data-watermark]'); JSON.stringify({ cssW: c.style.width, cssH: c.style.height, bufW: c.width, bufH: c.height, dpr: window.devicePixelRatio })`
      2. Assert: `bufW === cssW * dpr` (approximately)
    Expected Result: Canvas buffer dimensions account for devicePixelRatio
    Failure Indicators: bufW === cssW (no scaling, blurry text on Retina)
    Evidence: .omo/evidence/task-1-hidpi.json
  ```

  **Evidence to Capture**:
  - [ ] `.omo/evidence/task-1-watermark-exists.png` — screenshot of full page with watermark
  - [ ] `.omo/evidence/task-1-time-updates.txt` — data URL diff summary
  - [ ] `.omo/evidence/task-1-hidpi.json` — canvas dimensions vs DPR

  **Commit**: YES
  - Message: `feat(watermark): add global Canvas watermark with live clock`
  - Files: `src/components/watermark/GlobalWatermark.vue`
  - Pre-commit: `npm run build-only`

- [x] 2. Integrate watermark into App.vue

  **What to do**:
  - 在 `src/App.vue` 的 `<script setup>` 中 import GlobalWatermark
  - 在 `<template>` 中，`<n-config-provider>` 内部、`.app-shell` 的**同级**（sibling）位置添加 `<GlobalWatermark />`
  - 确认 `<Teleport to="body">` 挂载不受 `.app-shell` 的 `overflow: hidden` 影响

  **具体修改位置** (App.vue template):
  ```html
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <GlobalWatermark />
    <div class="app-shell">
      <!-- existing layout -->
    </div>
  </n-config-provider>
  ```

  **Must NOT do**:
  - 不修改 `.app-shell` 内部结构
  - 不修改 AppHeader/AppSidebar/CesiumPreview/CodePanel
  - 不修改 index.html

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single import + one line template insertion, trivial
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sequential, depends on Task 1)
  - **Blocks**: Final Verification Wave (F1-F4)
  - **Blocked By**: Task 1

  **References**:
  - `src/App.vue:30-46` — template structure, insert point after `<n-config-provider>` opening tag
  - `src/components/watermark/GlobalWatermark.vue` — component created in Task 1

  **Acceptance Criteria**:
  - [ ] `GlobalWatermark` imported in App.vue `<script setup>`
  - [ ] `<GlobalWatermark />` placed as sibling to `.app-shell` inside `<n-config-provider>`
  - [ ] `npm run build-only` passes
  - [ ] Dev server starts without errors

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Watermark persists across example switching
    Tool: Playwright (browser_run_code_unsafe)
    Preconditions: App running on http://127.0.0.1:5173
    Steps:
      1. Navigate to http://127.0.0.1:5173/
      2. Confirm canvas[data-watermark] exists
      3. Navigate to /example/cesium/entity/polyline
      4. Wait 1s, confirm canvas[data-watermark] still exists
      5. Navigate to /example/cesium/visualization/primitive-geometry
      6. Wait 1s, confirm canvas[data-watermark] still exists
      7. Navigate to /example/cesium/effects/particle-system
      8. Wait 1s, confirm canvas[data-watermark] still exists
    Expected Result: Watermark canvas present on ALL routes (not destroyed during component switching)
    Failure Indicators: Canvas missing after route change — component unmounted
    Evidence: .omo/evidence/task-2-persists-across-routes.txt

  Scenario: Cesium map interaction works through watermark
    Tool: Playwright (browser_run_code_unsafe)
    Preconditions: App on a route with 3D globe visible
    Steps:
      1. Navigate to http://127.0.0.1:5173/example/cesium/entity/polyline
      2. Wait 3s for Cesium globe to load
      3. Click and drag on the center of the Cesium container (.cesium-preview)
      4. Wait 1s
      5. Check: no console errors with 'destroyed' or 'pointer-events'
    Expected Result: Map orbit/pan works, no Cesium interaction errors
    Failure Indicators: Cesium DeveloperError, 'pointer-events' blocking, map doesn't respond
    Evidence: .omo/evidence/task-2-cesium-interaction.png

  Scenario: Console is clean after integration
    Tool: Playwright (browser_console_messages)
    Preconditions: App loaded with watermark
    Steps:
      1. Collect all console error messages
      2. Assert: zero errors (filter out Cesium pre-existing type warnings if any)
    Expected Result: No new JavaScript errors introduced
    Failure Indicators: Any error message related to watermark/canvas/Teleport
    Evidence: .omo/evidence/task-2-console-clean.txt
  ```

  **Evidence to Capture**:
  - [ ] `.omo/evidence/task-2-persists-across-routes.txt` — route-by-route canvas presence log
  - [ ] `.omo/evidence/task-2-cesium-interaction.png` — screenshot after map drag
  - [ ] `.omo/evidence/task-2-console-clean.txt` — console error dump (should be empty)

  **Commit**: YES
  - Message: `feat(watermark): integrate watermark into App.vue via Teleport`
  - Files: `src/App.vue`
  - Pre-commit: `npm run build-only`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify: Must Have [N/N] present, Must NOT Have [N/N] absent, deliverables match plan.
  **Acceptance Criteria**:
  - [ ] 8 Must Have items verified in implementation (full-screen, z-index≥9999, live-update, pointer-events:none, HiDPI dpr, tab-pause, cleanup on unmount, aria-hidden)
  - [ ] 7 Must NOT Have items verified absent (no npm deps, no index.html change, no toggle, no extra text, no Cesium interference, no other component changes, no CSS animation)
  - [ ] Deliverables: `GlobalWatermark.vue` exists, App.vue imports it
  Output: `Must Have [8/8] | Must NOT Have [7/7] | Files [2/2] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build-only`. Review GlobalWatermark.vue and App.vue for: type safety, unused imports, cleanup completeness (onUnmounted clears interval + event listeners), Canvas performance.
  **Acceptance Criteria**:
  - [ ] `npm run build-only` exits 0 with no new errors
  - [ ] GlobalWatermark.vue: `onUnmounted` calls `clearInterval` + `removeEventListener('resize')` + `removeEventListener('visibilitychange')`
  - [ ] No unused imports in either file
  - [ ] No `console.log` / debug statements left in code
  - [ ] No type assertions (`as` / `!`) without justification
  Output: `Build [PASS/FAIL] | Cleanup [COMPLETE/ISSUES] | Imports [CLEAN/N] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Execute ALL QA scenarios from Task 1 and Task 2. Verify: watermark renders, time updates, canvas covers viewport, Cesium interaction works, tab pause, resize adapts.
  **Acceptance Criteria**:
  - [ ] Task 1 Scenario 1: Watermark canvas exists with correct attributes (pointer-events:none, aria-hidden, full viewport)
  - [ ] Task 1 Scenario 2: Canvas content changes between two captures 1.5s apart (time updating)
  - [ ] Task 1 Scenario 3: Canvas buffer dimensions = CSS dimensions × devicePixelRatio
  - [ ] Task 2 Scenario 1: Canvas persists across 3+ route changes
  - [ ] Task 2 Scenario 2: Dragging Cesium map works through watermark, no console errors
  - [ ] Task 2 Scenario 3: Zero console errors after all interactions
  Output: `Scenarios [6/6 pass] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  Verify no scope creep: check git diff for unexpected changes.
  **Acceptance Criteria**:
  - [ ] Only 2 files changed: `src/components/watermark/GlobalWatermark.vue` (new), `src/App.vue` (modified)
  - [ ] No `package.json` changes (no new dependencies)
  - [ ] No `index.html` changes
  - [ ] No changes to CesiumPreview, AppHeader, AppSidebar, CodePanel, or any example components
  - [ ] All Must NOT Have items verified absent in diff
  Output: `Files [expected 2/actual N] | Creep [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1**: `feat(watermark): add global Canvas watermark with live clock` — `src/components/watermark/GlobalWatermark.vue`
- **2**: `feat(watermark): integrate Teleport watermark into App.vue` — `src/App.vue`

---

## Success Criteria

### Verification Commands
```bash
npm run build-only  # Expected: build succeeds, no new errors
```

### Final Checklist
- [ ] Canvas watermark visible full-screen with live time
- [ ] Time format `YYYY-MM-DD HH:mm:ss`, updates every second
- [ ] Cesium map interaction works through overlay
- [ ] Tab hidden → watermark pauses
- [ ] Window resize → canvas adapts
- [ ] Print → watermark hidden
- [ ] Zero new npm dependencies
- [ ] Zero console errors
