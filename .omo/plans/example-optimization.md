# 示例组件逐级优化

## TL;DR

> **Quick Summary**: �?24 �?Cesium 示例组件�?P0→P1→P2→P3 优先级逐级优化，从"静态看一眼就�?升级�?可交互参数面�?+ 视觉反馈 + 完善生命周期"�?>
> **Deliverables**:
> - 3 �?P0 基础示例重写（coordinate-pick / mouse-events / load-basemap�?> - 8 �?entity 示例添加参数面板
> - 2 �?effects 占位符功能化（water / custom-shader�?> - 6 �?effects/terrain 示例添加控制面板
> - 4 �?visualization 示例增强交互
> - 1 个共�?ExamplePanel 组件 + 统一 CSS 变量
> - Store 级安全网 + 3 个现�?bug 修复
>
> **Estimated Effort**: XL
> **Parallel Execution**: YES - 7 waves
> **Critical Path**: Wave 0 (safety net) �?Wave 1 (P0) �?Wave 2 (shared component) �?Wave 3 (entity panels) �?Wave 4 (effects placeholders) �?Wave 5 (terrain+viz A) �?Wave 6 (viz B+inspector) �?Wave FINAL

---

## Context

### Original Request
用户指出基础入门示例太过简单且与用户交互性不强，要求逐级优化�?
### Interview Summary
**Key Discussions**:
- 58% 的示例是纯静态（14/24 无任何交互），仅 2 个有丰富交互
- entity/ 全部 6 个静态、visualization/ 4 个无 template、effects/ 2 个占位符
- 核心问题：零参数暴露、黑箱反馈、占位符未实现、清理不完整

**Research Findings**:
- Naive UI 已安装且配置暗色主题，主�?`#4fc3f7`
- 项目无测试基础设施，以 agent visual QA 为主
- Viewer 是全局单例，示例通过 `defineProps<{ viewer }>` 接收
- `terrain-load.vue` onUnmounted 为空（terrainProvider 未恢复）
- `measurement.vue` `points[]` 数组�?onUnmounted 中未清空

### Metis Review
**Identified Gaps** (addressed):
- 缺少 store 级安全网：selectExample 切换时应�?removeAll �?加入 Wave 0
- terrain-load 未恢�?terrainProvider/enableLighting �?加入 Wave 0
- measurement points[] 未清�?�?加入 Wave 0
- CesiumPreview.vue provide('viewer', null) 死代�?�?加入 Wave 0
- coordinate-pick/mouse-events 实际已有视觉 entity 反馈，真正问题是实体无限累积 + 无面�?�?修正 P0 范围
- water.vue 应用 Material.WaterType 实现 �?明确 P1
- custom-shader.vue 应用渐变 CustomShader + 模型 �?明确 P1
- clipping-plane.vue 当前根本没实�?ClippingPlane �?明确�?实现缺失功能"而非"添加控制"
- viewshed.vue 当前是放射线而非真正可视�?�?保留放射线但加控�?- 应使�?Naive UI 组件（n-slider/n-select/n-radio-group/n-button）→ 全局约束

---

## Work Objectives

### Core Objective
�?24 �?Cesium 示例�?静态演�?升级�?可交互探�?，使用户能通过面板控件实时调节参数并观察效果变化�?
### Concrete Deliverables
- `src/stores/examples.ts` �?selectExample 增加 store 级安全网清理
- `src/components/map/CesiumPreview.vue` �?修复 provide 死代�?- `src/components/examples/ExamplePanel.vue` �?共享面板组件
- `src/styles/_example-vars.scss` �?统一 CSS 变量
- 3 �?P0 重写 + 8 �?entity 增强 + 2 个占位符功能�?+ 10 �?effects/terrain/viz 增强

### Definition of Done
- [ ] 所�?24 个示例均有交互面板或视觉反馈
- [ ] 示例切换时零残留（viewer.entities.values.length === 0, scene.primitives.length === 0�?- [ ] `npx vite build` �?TS 错误（排除已有预存错误）
- [ ] 每个有面板的示例均有 `@mousedown.stop @click.stop` 防冒�?- [ ] 所有面板使�?Naive UI 暗色组件

### Must Have
- 每个示例至少 1 个可操作控件或视觉反�?- 所�?onUnmounted 完整清理
- Store 级安全网兜底
- 面板使用 Naive UI 组件

### Must NOT Have (Guardrails)
- 不改 router / sidebar / CodePanel
- 不动 threejs / webgl 相关代码
- 不新增示例（仅优化现�?24 个）
- 不重�?CesiumPreview.vue �?viewer 创建逻辑
- 不新�?npm 依赖
- 不创�?composables �?示例保持自包�?- 不添加实体编�?拖拽/选中功能 �?面板仅参数控�?- 不实�?GPU 可视域分�?- 不添�?GLSL 实时编辑�?- 不修�?registry.ts 元数�?- 不实现真正的 GPU viewshed（保留放射线示意 + 加控制）

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (no test framework)
- **Framework**: N/A
- **Agent QA**: Primary verification method

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.omo/evidence/task-{N}-{scenario-slug}.{ext}`.

- **UI Panels**: Use Playwright �?find Naive UI components by role/label, interact, assert DOM state
- **Cesium Entities**: Use Bash (node REPL) �?check `viewer.entities.values.length` via debug endpoint
- **Build**: Use Bash �?`npx vite build` for zero-error check
- **Lifecycle**: Switch examples rapidly �?assert cleanup

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (Safety Net �?blocks everything):
├── Task 1: Store selectExample safety net [quick]
├── Task 2: Fix CesiumPreview.vue provide [quick]
├── Task 3: Fix terrain-load.vue onUnmounted [quick]
├── Task 4: Fix measurement.vue onUnmounted [quick]

Wave 1 (P0 �?first impressions, parallel):
├── Task 5: coordinate-pick.vue add result panel + entity cap [unspecified-high]
├── Task 6: mouse-events.vue add event log panel + entity cap [unspecified-high]
├── Task 7: load-basemap.vue rewrite with provider switching [unspecified-high]

Wave 2 (Shared Component �?blocks Waves 3-5):
├── Task 8: Create ExamplePanel.vue + _example-vars.scss [unspecified-high]
├── Task 9: Refactor camera-flyto.vue to use ExamplePanel [quick]
├── Task 10: Refactor video-fusion.vue to use ExamplePanel [quick]

Wave 3 (P1 Entity Panels �?MAX PARALLEL):
├── Task 11: polygon.vue add parameter panel [unspecified-high]
├── Task 12: polyline.vue add parameter panel [unspecified-high]
├── Task 13: billboard.vue add parameter panel [unspecified-high]
├── Task 14: label-tag.vue add parameter panel [unspecified-high]
├── Task 15: ellipsoid.vue add parameter panel [unspecified-high]
├── Task 16: model-3d.vue add parameter panel [unspecified-high]

Wave 4 (P1 Placeholders + P2 Effects Start):
├── Task 17: water.vue implement Water material + controls [deep]
├── Task 18: custom-shader.vue implement gradient shader + controls [deep]
├── Task 19: particle-system.vue add parameter panel [unspecified-high]
├── Task 20: post-process.vue add effect switching + controls [unspecified-high]

Wave 5 (P2 Terrain + Visualization A):
├── Task 21: clipping-plane.vue implement ClippingPlane + controls [deep]
├── Task 22: measurement.vue add results panel [unspecified-high]
├── Task 23: viewshed.vue add observer controls [unspecified-high]
├── Task 24: terrain-load.vue add provider selector + cleanup [unspecified-high]
├── Task 25: migration-lines.vue add animation controls [unspecified-high]

Wave 6 (P2 Visualization B + Inspector):
├── Task 26: dynamic-texture.vue add animation controls [unspecified-high]
├── Task 27: cylinder-chart.vue add data controls [unspecified-high]
├── Task 28: primitive-geometry.vue add geometry selector [unspecified-high]
├── Task 29: cesium-inspector.vue enhance panel [quick]

Wave FINAL (4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)

Critical Path: Wave 0 �?Wave 1 �?Wave 2 �?Wave 3 �?Wave 4 �?Wave 5 �?Wave 6 �?FINAL
Parallel Speedup: ~70% faster than sequential
Max Concurrent: 6 (Waves 3, 5)
```

### Dependency Matrix

- **1-4**: - - 5-29, 0
- **5-7**: - - 8, 1
- **8**: - - 9-10, 2
- **9-10**: 8 - 11-29, 2
- **11-16**: 9-10 - -, 3
- **17-20**: 9-10 - -, 4
- **21-25**: 9-10 - -, 5
- **26-29**: 9-10 - -, 6
- **F1-F4**: 1-29 - -, F

### Agent Dispatch Summary

- **Wave 0**: **4** �?all `quick`
- **Wave 1**: **3** �?all `unspecified-high`
- **Wave 2**: **3** �?T8 `unspecified-high`, T9-10 `quick`
- **Wave 3**: **6** �?all `unspecified-high`
- **Wave 4**: **4** �?T17-18 `deep`, T19-20 `unspecified-high`
- **Wave 5**: **5** �?T21 `deep`, T22-25 `unspecified-high`
- **Wave 6**: **4** �?T26-28 `unspecified-high`, T29 `quick`
- **FINAL**: **4** �?F1 `oracle`, F2-3 `unspecified-high`, F4 `deep`

---

## TODOs

- [x] 1. Store selectExample 安全网清�?
  **What to do**:
  - �?`src/stores/examples.ts` �?`selectExample()` 函数中，�?`activeComponent.value = null` 之后、加载新组件之前，增加安全网清理：`if (viewer) { viewer.entities.removeAll(); viewer.scene.primitives.removeAll(); }`
  - 同样�?`setTech()` 中加�?`if (viewer) { viewer.entities.removeAll(); viewer.scene.primitives.removeAll(); }`

  **Must NOT do**:
  - 不修�?selectExample 的加载逻辑或组件注册流�?  - 不添�?postProcessStages 清理（各示例自己清理�?
  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 0 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5-29
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/stores/examples.ts:105-138` �?`selectExample()` 函数完整逻辑，需�?L111 `activeComponent.value = null` 之后插入安全�?
  **API/Type References**:
  - `viewer.entities.removeAll()` �?清除所�?Entity
  - `viewer.scene.primitives.removeAll()` �?清除所�?Primitive

  **WHY**: 各示�?onUnmounted 清理不可靠（3 个文件缺�?不完整），store 级安全网是兜�?
  **Acceptance Criteria**:
  - [ ] `selectExample()` �?`activeComponent.value = null` 后调�?`viewer.entities.removeAll()` �?`viewer.scene.primitives.removeAll()`
  - [ ] `setTech()` 同样增加清理
  - [ ] 切换示例�?`viewer.entities.values.length === 0`

  **QA Scenarios**:
  ```
  Scenario: Rapid example switching leaves no residue
    Tool: Playwright
    Preconditions: App running, any example active
    Steps:
      1. Click sidebar "坐标拾取" example
      2. Click map 3 times (adds 3 pick entities)
      3. Click sidebar "加载底图" example
      4. Click sidebar "坐标拾取" example again
    Expected Result: viewer.entities.values only contains the new example's entities, not the 3 picks from step 2
    Evidence: .omo/evidence/task-1-rapid-switch.txt

  Scenario: SetTech clears all entities
    Tool: Playwright
    Preconditions: Any Cesium example active with entities
    Steps:
      1. Navigate to any example
      2. Call store.setTech('cesium') (or equivalent UI action)
    Expected Result: viewer.entities.values.length === 0, scene.primitives.length === 0
    Evidence: .omo/evidence/task-1-settech-cleanup.txt
  ```

  **Commit**: YES (groups with 2, 3, 4)
  - Message: `fix(examples): add store-level cleanup safety net and fix lifecycle bugs`
  - Files: `src/stores/examples.ts`

- [x] 2. 修复 CesiumPreview.vue provide 死代�?
  **What to do**:
  - �?`src/components/map/CesiumPreview.vue` L10 `provide('viewer', viewer)` 移入 `onMounted` 回调内（viewer 创建之后�?  - 或直接删除该行（子组件通过 props 接收 viewer，无任何子组�?inject viewer�?
  **Must NOT do**:
  - 不修�?viewer 创建参数
  - 不修�?template 中的 `<component :is>` 逻辑

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 0 (with Tasks 1, 3, 4)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `src/components/map/CesiumPreview.vue:10` �?`provide('viewer', viewer)` 此时 viewer �?null
  - `src/components/map/CesiumPreview.vue:12-33` �?onMounted 中创�?viewer

  **Acceptance Criteria**:
  - [ ] �?`provide('viewer', null)` 死代�?  - [ ] 子组件仍通过 `defineProps<{ viewer }>` 正常接收 viewer

  **QA Scenarios**:
  ```
  Scenario: Provide removed without breaking child components
    Tool: Bash
    Steps:
      1. grep -r "inject.*viewer" src/ �?assert 0 results
      2. grep "provide.*viewer" src/components/map/CesiumPreview.vue �?assert 0 results
      3. npx vite build �?assert success
    Expected Result: No inject usage found, no provide in CesiumPreview, build succeeds
    Evidence: .omo/evidence/task-2-provide-fix.txt
  ```

  **Commit**: YES (groups with 1, 3, 4)
  - Files: `src/components/map/CesiumPreview.vue`

- [x] 3. 修复 terrain-load.vue onUnmounted

  **What to do**:
  - �?`onMounted` 中保存原�?`viewer.terrainProvider` 引用�?`viewer.scene.globe.enableLighting` �?  - �?`onUnmounted` 中恢复这两个�?  - 替换当前的空注释 `// overlay removed automatically by Vue`

  **Must NOT do**:
  - 不修�?toggleTerrain 函数逻辑
  - 不增加新�?UI 控件（P2 再加�?
  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 0 (with Tasks 1, 2, 4)
  - **Blocks**: Task 24 (P2 terrain-load 增强)
  - **Blocked By**: None

  **References**:
  - `src/examples/terrain/terrain-load.vue:31-33` �?�?onUnmounted
  - `src/examples/terrain/terrain-load.vue:14-18` �?toggleTerrain 修改 terrainProvider �?enableLighting

  **Acceptance Criteria**:
  - [ ] onMounted 保存 `originalTerrainProvider` �?`originalEnableLighting`
  - [ ] onUnmounted 恢复这两个�?  - [ ] 切换离开 terrain-load 后，globe.enableLighting 回到进入前的状�?
  **QA Scenarios**:
  ```
  Scenario: Terrain state restored after leaving example
    Tool: Playwright
    Preconditions: App running, default state (no terrain, enableLighting=false)
    Steps:
      1. Navigate to "地形加载" example
      2. Click "Load Cesium World Terrain" button
      3. Wait for terrain to load
      4. Navigate to a different example
    Expected Result: viewer.scene.globe.enableLighting === false, viewer.terrainProvider is the default EllipsoidTerrainProvider
    Evidence: .omo/evidence/task-3-terrain-restore.txt
  ```

  **Commit**: YES (groups with 1, 2, 4)
  - Files: `src/examples/terrain/terrain-load.vue`

- [x] 4. 修复 measurement.vue onUnmounted

  **What to do**:
  - �?`onUnmounted` 中添�?`points.length = 0` 清空点数�?  - 添加 `if (!handler.isDestroyed()) handler.destroy()` 防止双重销�?
  **Must NOT do**:
  - 不修改测量逻辑
  - 不增加新�?UI 控件（P2 再加�?
  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 0 (with Tasks 1, 2, 3)
  - **Blocks**: Task 22 (P2 measurement 增强)
  - **Blocked By**: None

  **References**:
  - `src/examples/terrain/measurement.vue:102-105` �?当前 onUnmounted
  - `src/examples/terrain/measurement.vue:12` �?`const points: Cesium.Cartesian3[] = []` 模块级数�?
  **Acceptance Criteria**:
  - [ ] onUnmounted 包含 `points.length = 0`
  - [ ] handler.destroy() �?isDestroyed 守卫
  - [ ] 重新进入 measurement 后不会显示上次的测量�?
  **QA Scenarios**:
  ```
  Scenario: Points cleared on re-entry
    Tool: Playwright
    Steps:
      1. Navigate to "空间量测" example
      2. Click map 3 times to add measurement points
      3. Navigate to a different example
      4. Navigate back to "空间量测"
    Expected Result: No measurement points visible from the previous session
    Evidence: .omo/evidence/task-4-measurement-cleanup.txt
  ```

  **Commit**: YES (groups with 1, 2, 3)
  - Files: `src/examples/terrain/measurement.vue`

- [x] 5. coordinate-pick.vue 添加坐标结果面板 + 实体上限

  **What to do**:
  - 添加 ExamplePanel 面板，显示最近拾取的坐标信息：经度、纬度、高�?  - 添加实体上限（最多保�?5 个拾取点），超限�?FIFO 移除最旧的
  - 添加"清空标记"按钮
  - 添加拾取计数显示
  - 保持现有地图上的点标�?+ 标签功能不变

  **Must NOT do**:
  - 不删除现有的 entity 标签显示
  - 不添加坐标复制功能（超出范围�?
  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 面板 UI 设计需要一致�?
  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 6, 7)
  - **Blocks**: None
  - **Blocked By**: Task 1 (store safety net)

  **References**:
  - `src/examples/basic/coordinate-pick.vue` �?当前完整代码�?3 行），L25-53 �?handler 添加 entity 无上�?  - `src/components/examples/ExamplePanel.vue` �?共享面板组件（Wave 2 创建，但此任务在 Wave 2 之前，所以此任务先用内联面板样式，Wave 2 后再重构�?  - `src/examples/effects/video-fusion.vue:421-463` �?面板 CSS 样式参�?
  **Acceptance Criteria**:
  - [ ] 面板显示最近拾取坐标（lng, lat, height�?  - [ ] 最�?5 个拾取点，超出自动移除最早的
  - [ ] "清空标记"按钮清除所有拾取点
  - [ ] 显示拾取总数

  **QA Scenarios**:
  ```
  Scenario: Coordinate pick panel shows results
    Tool: Playwright
    Steps:
      1. Navigate to "坐标拾取" example
      2. Click on the globe at 5 different positions
      3. Assert panel shows the latest coordinate values
      4. Assert exactly 5 point entities exist
      5. Click a 6th position
      6. Assert still exactly 5 point entities (FIFO)
      7. Click "清空标记" button
      8. Assert 0 pick entities remain
    Expected Result: Panel updates with each click; entity cap enforced; clear works
    Evidence: .omo/evidence/task-5-coord-pick.png

  Scenario: Entity cap prevents accumulation
    Tool: Bash
    Steps:
      1. Navigate to "坐标拾取" example
      2. Simulate 10 rapid clicks on the globe
      3. Count viewer.entities.values.length
    Expected Result: entities.length �?5 (pick points) + 1 (hint label) = 6
    Evidence: .omo/evidence/task-5-entity-cap.txt
  ```

  **Commit**: YES (groups with 6, 7)
  - Message: `feat(basic): add interactive panels to coordinate-pick, mouse-events, load-basemap`
  - Files: `src/examples/basic/coordinate-pick.vue`

- [x] 6. mouse-events.vue 添加事件日志面板 + 实体上限

  **What to do**:
  - 添加 ExamplePanel 面板，显示滚动事件日志（最�?8 条）
  - 每条日志显示：时间戳、事件类型（LEFT_CLICK/RIGHT_CLICK/MOUSE_MOVE）、坐�?  - 不同事件类型用不同颜色标�?  - 实体上限：最�?10 个点击标记点，超�?FIFO
  - 添加"清空日志"按钮
  - 保持现有 MOUSE_MOVE 实时坐标更新（infoLabel�?
  **Must NOT do**:
  - 不删除现有的 showEvent 标签功能
  - 不修�?handler 事件类型

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 5, 7)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `src/examples/basic/mouse-events.vue` �?当前完整代码�?3 行），L39-63 三种事件处理
  - `src/examples/effects/video-fusion.vue:421-463` �?面板样式

  **Acceptance Criteria**:
  - [ ] 面板显示滚动事件日志（最�?8 条）
  - [ ] LEFT_CLICK 绿色、RIGHT_CLICK 橙色、MOUSE_MOVE 蓝色
  - [ ] 点击标记最�?10 个，FIFO
  - [ ] "清空日志"按钮清空面板日志 + 地图标记

  **QA Scenarios**:
  ```
  Scenario: Event log panel captures events
    Tool: Playwright
    Steps:
      1. Navigate to "鼠标事件" example
      2. Click on the globe (LEFT_CLICK)
      3. Right-click on the globe
      4. Move mouse over globe
      5. Assert event log panel shows at least 2 entries with different colors
    Expected Result: Log entries appear with correct event type labels and colors
    Evidence: .omo/evidence/task-6-mouse-events.png

  Scenario: Entity cap enforced
    Tool: Bash
    Steps:
      1. Navigate to "鼠标事件" example
      2. Simulate 12 LEFT_CLICK events
      3. Count point entities
    Expected Result: Point entities �?10
    Evidence: .omo/evidence/task-6-entity-cap.txt
  ```

  **Commit**: YES (groups with 5, 7)
  - Files: `src/examples/basic/mouse-events.vue`

- [x] 7. load-basemap.vue 重写为底图切换器

  **What to do**:
  - 完全重写，添�?ExamplePanel 面板
  - 提供 4 种底图选项（n-radio-group）：
    - Bing Maps Aerial（默认）
    - Bing Maps Road
    - OpenStreetMap
    - ArcGIS World Imagery
  - 添加图层透明度滑块（n-slider, 0-1, step 0.05�?  - 添加图层亮度滑块（n-slider, 0.5-2.0, step 0.1�?  - 底图切换�?`viewer.imageryLayers.removeAll()` + `addImageryProvider()`
  - 失败时面板显示错误提�?  - onUnmounted 恢复默认底图

  **Must NOT do**:
  - 不添加天地图（需 API Key�?  - 不修�?CesiumPreview �?viewer 创建参数

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 5, 6)
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `src/examples/basic/load-basemap.vue` �?当前代码�?9 行，仅一�?label entity�?  - Cesium API: `viewer.imageryLayers.removeAll()`, `viewer.imageryLayers.addImageryProvider()`
  - `Cesium.BingMapsImageryProvider`, `Cesium.OpenStreetMapImageryProvider`, `Cesium.ArcGisMapServerImageryProvider`
  - `Cesium.ImageryLayer.alpha` (透明�?, `Cesium.ImageryLayer.brightness` (亮度)

  **Acceptance Criteria**:
  - [ ] 4 种底图可切换，切换后地图更新
  - [ ] 透明度滑块实时生�?  - [ ] 亮度滑块实时生效
  - [ ] 底图加载失败时面板显示错误信�?  - [ ] onUnmounted 恢复默认底图

  **QA Scenarios**:
  ```
  Scenario: Basemap switching works
    Tool: Playwright
    Steps:
      1. Navigate to "加载底图" example
      2. Assert default is "Bing Maps Aerial" selected
      3. Click "OpenStreetMap" radio
      4. Wait 2s for imagery load
      5. Assert viewer.imageryLayers.length === 1
      6. Click "ArcGIS" radio
      7. Assert still 1 imagery layer
    Expected Result: Imagery layer changes with each selection
    Evidence: .omo/evidence/task-7-basemap-switch.png

  Scenario: Opacity slider affects layer
    Tool: Bash
    Steps:
      1. Navigate to "加载底图" example
      2. Set opacity slider to 0.5
      3. Read viewer.imageryLayers.get(0).alpha
    Expected Result: alpha === 0.5
    Evidence: .omo/evidence/task-7-opacity.txt

  Scenario: Error state on failed provider
    Tool: Playwright
    Steps:
      1. Block network to simulate failure
      2. Switch to a different provider
      3. Assert error message visible in panel
    Expected Result: Error message displayed instead of silent failure
    Evidence: .omo/evidence/task-7-error-state.png
  ```

  **Commit**: YES (groups with 5, 6)
  - Files: `src/examples/basic/load-basemap.vue`

- [x] 8. 创建 ExamplePanel.vue 共享组件 + _example-vars.scss

  **What to do**:
  - 创建 `src/styles/_example-vars.scss`，提�?video-fusion.vue 中的 CSS 变量：`$cyan: #4fc3f7; $bg-panel: rgba(13, 26, 45, 0.94); $text-primary: #b0bec5; $text-muted: #6b8cae; $text-dim: #4a6580;`
  - 创建 `src/components/examples/ExamplePanel.vue`�?    - Props: `title: string`, `width?: string` (default '280px')
    - Slot: `header-right`（状态标签等�? `default`（内容区�?    - 样式：与 video-fusion.vue �?`.vf-panel` 完全一致（position absolute, bottom 24px, left 16px, backdrop-filter blur, border-radius 8px 等）
    - 内置 `@mousedown.stop @click.stop` 防冒�?    - 内置 `max-height: 80vh; overflow-y: auto` 滚动
    - 使用 `_example-vars.scss` 变量
  - 确保 vite 自动导入配置包含新组件目�?
  **Must NOT do**:
  - 不添�?Naive UI 依赖（已安装�?  - 不创�?form 系统
  - 不修�?camera-flyto / video-fusion（Task 9-10 做）

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`frontend-ui-ux`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (blocks Tasks 9-10)
  - **Blocks**: Tasks 9, 10, and all subsequent example tasks
  - **Blocked By**: Tasks 5-7 (P0 should land first for clean diff)

  **References**:
  - `src/examples/effects/video-fusion.vue:421-463` �?`.vf-panel` CSS 完整样式，作�?ExamplePanel 的基�?  - `src/examples/basic/camera-flyto.vue:240-514` �?`.cam-panel` CSS 作为第二基准
  - `src/theme/naive-ui.ts` �?暗色主题配置，`primaryColor: '#4fc3f7'`

  **Acceptance Criteria**:
  - [ ] `src/styles/_example-vars.scss` 存在且导�?5 个变�?  - [ ] `src/components/examples/ExamplePanel.vue` 存在且可导入
  - [ ] ExamplePanel 渲染后视觉与 video-fusion 面板一�?  - [ ] 内置 @mousedown.stop @click.stop
  - [ ] max-height 80vh + overflow-y auto

  **QA Scenarios**:
  ```
  Scenario: ExamplePanel renders correctly
    Tool: Playwright
    Steps:
      1. Create a test page importing ExamplePanel with title="测试面板" and some content
      2. Assert panel is positioned at bottom-left
      3. Assert backdrop-filter is applied
      4. Assert clicking inside panel does not propagate to Cesium canvas
    Expected Result: Panel renders with correct position, blur, and event isolation
    Evidence: .omo/evidence/task-8-example-panel.png

  Scenario: CSS variables file importable
    Tool: Bash
    Steps:
      1. grep "\\$cyan" src/styles/_example-vars.scss
      2. grep "\\$bg-panel" src/styles/_example-vars.scss
    Expected Result: Both variables found
    Evidence: .omo/evidence/task-8-vars-exist.txt
  ```

  **Commit**: YES (groups with 9, 10)
  - Message: `refactor(examples): extract shared ExamplePanel component and CSS variables`
  - Files: `src/components/examples/ExamplePanel.vue`, `src/styles/_example-vars.scss`

- [x] 9. 重构 camera-flyto.vue 使用 ExamplePanel

  **What to do**:
  - �?`<ExamplePanel title="相机飞行">` 替换 camera-flyto.vue 中的 `.cam-panel` 外壳
  - 导入 `_example-vars.scss` 替换内联 CSS 变量
  - 保持所有现有功能和控件不变

  **Must NOT do**:
  - 不修改任何交互逻辑
  - 不改变控件布局

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 10)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Task 8

  **References**:
  - `src/examples/basic/camera-flyto.vue` �?完整文件�?14 行），需替换 `.cam-panel` 结构

  **Acceptance Criteria**:
  - [ ] 使用 `<ExamplePanel>` 组件
  - [ ] 视觉与重构前完全一致（像素级）
  - [ ] 所有控件功能正�?
  **QA Scenarios**:
  ```
  Scenario: No visual regression after refactor
    Tool: Playwright
    Steps:
      1. Navigate to "相机飞行" example
      2. Take screenshot of the panel
      3. Compare with baseline (pre-refactor screenshot)
    Expected Result: Pixel diff �?1%
    Evidence: .omo/evidence/task-9-camera-flyto-diff.png
  ```

  **Commit**: YES (groups with 8, 10)
  - Files: `src/examples/basic/camera-flyto.vue`

- [x] 10. 重构 video-fusion.vue 使用 ExamplePanel

  **What to do**:
  - �?`<ExamplePanel title="视频融合" width="320px">` 替换 `.vf-panel` 外壳
  - `header-right` slot 放播放状�?  - 导入 `_example-vars.scss` 替换内联 CSS 变量
  - 保持所有现有功能和控件不变

  **Must NOT do**:
  - 不修改视�?模型逻辑
  - 不改变控件布局

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 9)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Task 8

  **References**:
  - `src/examples/effects/video-fusion.vue:364-418` �?template 结构
  - `src/examples/effects/video-fusion.vue:421-463` �?`.vf-panel` CSS

  **Acceptance Criteria**:
  - [ ] 使用 `<ExamplePanel>` 组件
  - [ ] 视觉与重构前一�?  - [ ] 视频播放/暂停/模型贴附全部正常

  **QA Scenarios**:
  ```
  Scenario: No visual regression after refactor
    Tool: Playwright
    Steps:
      1. Navigate to "视频融合" example
      2. Take screenshot
      3. Compare with baseline
    Expected Result: Pixel diff �?1%
    Evidence: .omo/evidence/task-10-video-fusion-diff.png
  ```

  **Commit**: YES (groups with 8, 9)
  - Files: `src/examples/effects/video-fusion.vue`

- [x] 11. polygon.vue 添加参数面板

  **What to do**:
  - 使用 ExamplePanel 添加控制面板，参数：填充颜色（n-color-picker）、填充透明度（n-slider 0-1）、边框颜色（n-color-picker）、边框宽度（n-slider 0-5）、拉伸高度（n-slider 0-50000）、高度（n-slider 0-10000�?  - 参数变化实时更新 entity 属�?  - 保留现有两个 polygon 区域，面板影�?Area A

  **Must NOT do**:
  - 不添加顶点编�?拖拽
  - 不添加绘制新 polygon 功能

  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 3 (parallel with 12-16), Blocked By: Task 8

  **References**: `src/examples/entity/polygon.vue` �?当前 68 �?
  **Acceptance Criteria**:
  - [ ] 6 个参数控件实时生�?  - [ ] Area A polygon 随参数变化而更�?  - [ ] 使用 ExamplePanel + Naive UI 组件

  **QA Scenarios**:
  ```
  Scenario: Fill alpha slider updates polygon
    Tool: Playwright
    Steps:
      1. Navigate to "多边�? example
      2. Set fill alpha slider to 0.1
      3. Assert Area A polygon material alpha is near 0.1
    Expected Result: Polygon becomes more transparent
    Evidence: .omo/evidence/task-11-polygon-alpha.png

  Scenario: Extrusion height slider works
    Tool: Playwright
    Steps:
      1. Set extrusion height slider to 10000
      2. Assert polygon has extrudedHeight property set
    Expected Result: Polygon is extruded vertically
    Evidence: .omo/evidence/task-11-polygon-extrude.png
  ```

  **Commit**: YES (groups with 12-16)
  - Message: `feat(entity): add parameter panels to all entity examples`
  - Files: `src/examples/entity/polygon.vue`

- [x] 12. polyline.vue 添加参数面板

  **What to do**:
  - 使用 ExamplePanel，参数：线宽（n-slider 1-10）、颜色（n-color-picker）、是否贴地（n-switch）、线型（n-select: 实线/虚线�?  - 参数变化实时更新所�?polyline entity

  **Must NOT do**: 不添加绘制新线功�?  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 3, Blocked By: Task 8
  **References**: `src/examples/entity/polyline.vue` �?当前 44 �?
  **Acceptance Criteria**:
  - [ ] 4 个参数控件实时生�?  - [ ] 所�?polyline 随参数更�?
  **QA Scenarios**:
  ```
  Scenario: Width slider updates all polylines
    Tool: Playwright
    Steps:
      1. Set width slider to 8
      2. Assert polyline entities have width === 8
    Expected Result: All lines become wider
    Evidence: .omo/evidence/task-12-polyline-width.png
  ```

  **Commit**: YES (groups with 11, 13-16)
  - Files: `src/examples/entity/polyline.vue`

- [x] 13. billboard.vue 添加参数面板

  **What to do**:
  - 使用 ExamplePanel，参数：缩放（n-slider 0.5-3.0）、颜色（n-color-picker，用�?canvas 重绘）、垂直原点（n-select: CENTER/BOTTOM/TOP）、水平原点（n-select: CENTER/LEFT/RIGHT�?  - 颜色变化需重绘 Canvas 生成新图�?
  **Must NOT do**: 不添加自定义图片上传
  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 3, Blocked By: Task 8
  **References**: `src/examples/entity/billboard.vue` �?当前 59 行，L18-31 Canvas 绘制图标

  **Acceptance Criteria**:
  - [ ] 4 个参数控件实时生�?  - [ ] 颜色变化�?Canvas 重绘

  **QA Scenarios**:
  ```
  Scenario: Scale slider updates billboard
    Tool: Playwright
    Steps:
      1. Set scale slider to 2.0
      2. Assert billboard entity scale === 2.0
    Expected Result: Billboards appear larger
    Evidence: .omo/evidence/task-13-billboard-scale.png
  ```

  **Commit**: YES (groups with 11-12, 14-16)
  - Files: `src/examples/entity/billboard.vue`

- [x] 14. label-tag.vue 添加参数面板

  **What to do**:
  - 使用 ExamplePanel，参数：字体大小（n-slider 10-36）、填充颜色（n-color-picker）、缩放（n-slider 0.5-3.0）、是否显示背景（n-switch）、背景颜色（n-color-picker，仅当背景开关打开时可用）

  **Must NOT do**: 不添加自定义文本输入
  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 3, Blocked By: Task 8
  **References**: `src/examples/entity/label-tag.vue` �?当前 45 �?
  **Acceptance Criteria**:
  - [ ] 5 个参数控件实时生�?  - [ ] 背景颜色仅在背景开关打开时可�?
  **QA Scenarios**:
  ```
  Scenario: Font size slider updates labels
    Tool: Playwright
    Steps:
      1. Set font size slider to 28
      2. Assert label entities have font containing "28px"
    Expected Result: Labels appear larger
    Evidence: .omo/evidence/task-14-label-size.png
  ```

  **Commit**: YES (groups with 11-13, 15-16)
  - Files: `src/examples/entity/label-tag.vue`

- [x] 15. ellipsoid.vue 添加参数面板

  **What to do**:
  - 使用 ExamplePanel，两个分组：
    - Ellipsoid 组：X/Y/Z 半径（n-slider 100-2000）、颜色（n-color-picker）、是否显示边框（n-switch�?    - Cylinder 组：长度（n-slider 200-3000）、顶部半径（n-slider 50-500）、底部半径（n-slider 50-500）、颜色（n-color-picker�?  - 面板影响第一�?ellipsoid 和第一�?cylinder 作为演示

  **Must NOT do**: 不添加添�?删除几何体功�?  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 3, Blocked By: Task 8
  **References**: `src/examples/entity/ellipsoid.vue` �?当前 54 �?
  **Acceptance Criteria**:
  - [ ] 8 个参数控件分两组实时生效
  - [ ] 第一�?ellipsoid 和第一�?cylinder 随参数更�?
  **QA Scenarios**:
  ```
  Scenario: Radii sliders update ellipsoid
    Tool: Playwright
    Steps:
      1. Set X radius slider to 1500
      2. Assert first ellipsoid entity radii.x === 1500
    Expected Result: Ellipsoid stretches horizontally
    Evidence: .omo/evidence/task-15-ellipsoid-radii.png
  ```

  **Commit**: YES (groups with 11-14, 16)
  - Files: `src/examples/entity/ellipsoid.vue`

- [x] 16. model-3d.vue 添加参数面板

  **What to do**:
  - 使用 ExamplePanel，参数：模型缩放（n-slider 0.5-5.0）、最小像素尺寸（n-slider 16-256）、剪影颜色（n-color-picker）、剪影大小（n-slider 0-10�? 表示无剪影）、颜色混合（n-slider 0-1�?=原色 1=纯色�?  - 添加"重置朝向"按钮（重新设�?heading=0�?
  **Must NOT do**: 不添加模�?URL 选择�?  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 3, Blocked By: Task 8
  **References**: `src/examples/entity/model-3d.vue` �?当前 38 �?
  **Acceptance Criteria**:
  - [ ] 5 个参数控件实时生�?  - [ ] 剪影大小�?0 时不显示剪影
  - [ ] "重置朝向"按钮重置 heading

  **QA Scenarios**:
  ```
  Scenario: Scale slider updates model
    Tool: Playwright
    Steps:
      1. Set scale slider to 3.0
      2. Assert model entity model.scale === 3.0
    Expected Result: Model appears larger
    Evidence: .omo/evidence/task-16-model-scale.png
  ```

  **Commit**: YES (groups with 11-15)
  - Files: `src/examples/entity/model-3d.vue`

- [x] 17. water.vue 实现 Water 材质 + 控制面板

  **What to do**:
  - 完全重写，替换当前的纯文字占位符
  - 使用 `Cesium.Primitive` + `Cesium.MaterialAppearance` + `Cesium.Material.WaterType` 创建水面
  - 创建一�?Rectangle 区域作为水面
  - 使用 ExamplePanel，参数：波浪高度（n-slider 0-10，映射到 baseWaterColor alpha）、水面颜色（n-color-picker）、波纹频率（n-slider 1-100）、动画速度（n-slider 0-5�?  - onUnmounted 清理 primitive

  **Must NOT do**:
  - 不使�?Entity.rectangle（Water 材质需 Primitive�?  - 不添加水面反射自定义纹理

  **Recommended Agent Profile**: **Category**: `deep`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 4 (parallel with 18-20), Blocked By: Task 8
  **References**:
  - `src/examples/effects/water.vue` �?当前 47 行纯占位�?  - Cesium API: `Cesium.Material.WaterType`, `Cesium.Material.fromType()`, fabric uniforms

  **Acceptance Criteria**:
  - [ ] 显示动态水面效果（不是纯文字）
  - [ ] 4 个参数控件实时调节水面属�?  - [ ] onUnmounted 移除 primitive

  **QA Scenarios**:
  ```
  Scenario: Water material renders
    Tool: Playwright
    Steps:
      1. Navigate to "水面效果" example
      2. Assert no text-only overlay
      3. Assert water primitive exists in scene
      4. Adjust wave height slider
    Expected Result: Water surface visible with adjustable parameters
    Evidence: .omo/evidence/task-17-water.png
  ```

  **Commit**: YES (groups with 18-20)
  - Message: `feat(effects): implement water and custom-shader; add particle/post-process controls`
  - Files: `src/examples/effects/water.vue`

- [x] 18. custom-shader.vue 实现渐变着色器 + 控制面板

  **What to do**:
  - 完全重写，替换当前纯文字占位�?  - 加载一�?glTF 模型（复�?video-fusion �?Room.gltf �?CesiumAir.glb�?  - 应用 CustomShader 实现颜色渐变效果（基�?UV 坐标或世界坐标的渐变�?  - 使用 ExamplePanel，参数：渐变�?1 色相（n-slider 0-360）、渐变色 2 色相（n-slider 0-360）、混合强度（n-slider 0-1）、脉冲速度（n-slider 0-5，基于时间的动画�?  - onUnmounted 清理 entity + shader

  **Must NOT do**:
  - 不添�?GLSL 代码编辑�?  - 不使�?3D Tiles（用 Entity model 即可�?
  **Recommended Agent Profile**: **Category**: `deep`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 4, Blocked By: Task 8
  **References**:
  - `src/examples/effects/custom-shader.vue` �?当前 51 行纯占位�?  - `src/examples/effects/video-fusion.vue:96-143` �?CustomShader 用法参�?  - Cesium API: `Cesium.CustomShader`, `Cesium.CustomShaderMode.MODIFY_MATERIAL`

  **Acceptance Criteria**:
  - [ ] 模型表面显示渐变色着色器效果
  - [ ] 4 个参数控件实时调节着色器
  - [ ] 脉冲速度 > 0 时有动画效果
  - [ ] onUnmounted 清理

  **QA Scenarios**:
  ```
  Scenario: Gradient shader renders on model
    Tool: Playwright
    Steps:
      1. Navigate to "自定义着色器" example
      2. Assert model is visible with non-default coloring
      3. Adjust hue slider 1 to 180
      4. Assert visual change
    Expected Result: Model shows gradient shader with adjustable parameters
    Evidence: .omo/evidence/task-18-custom-shader.png
  ```

  **Commit**: YES (groups with 17, 19-20)
  - Files: `src/examples/effects/custom-shader.vue`

- [x] 19. particle-system.vue 添加参数面板

  **What to do**:
  - 使用 ExamplePanel，参数：发射速率（n-slider 1-100）、最小速度（n-slider 5-80）、最大速度（n-slider 10-100）、最小生命周期（n-slider 0.5-5）、最大生命周期（n-slider 1-8）、开始颜色（n-color-picker）、结束颜色（n-color-picker）、开始缩放（n-slider 0.5-5）、结束缩放（n-slider 1-10�?  - 参数变化直接修改 particleSystem 对应属�?
  **Must NOT do**: 不添加自定义粒子图片
  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 4, Blocked By: Task 8
  **References**: `src/examples/effects/particle-system.vue` �?当前 41 �?
  **Acceptance Criteria**:
  - [ ] 9 个参数控件实时调节粒子效�?  - [ ] 粒子外观随参数变化明显改�?
  **QA Scenarios**:
  ```
  Scenario: Emission rate slider works
    Tool: Playwright
    Steps:
      1. Set emission rate slider to 80
      2. Assert particleSystem.emissionRate === 80
    Expected Result: More particles visible
    Evidence: .omo/evidence/task-19-particle-rate.png
  ```

  **Commit**: YES (groups with 17-18, 20)
  - Files: `src/examples/effects/particle-system.vue`

- [x] 20. post-process.vue 添加效果切换 + 参数控制

  **What to do**:
  - 使用 ExamplePanel，功能：
    - 效果类型切换（n-radio-group）：泛光/夜视/黑白/�?    - 泛光模式下：亮度阈值（n-slider 0-1）、增强系数（n-slider 1.0-3.0�?  - 切换效果时移除旧 PostProcessStage，添加新 Stage
  - 夜视：使�?Cesium 伪色 fragment shader
  - 黑白：luminance-only shader

  **Must NOT do**: 不添加自定义 GLSL 编辑
  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 4, Blocked By: Task 8
  **References**:
  - `src/examples/effects/post-process.vue` �?当前 54 �?  - Cesium API: `Cesium.PostProcessStage`, `scene.postProcessStages`

  **Acceptance Criteria**:
  - [ ] 4 种效果可切换
  - [ ] 泛光模式�?2 个调节滑�?  - [ ] 切换时旧效果完全移除
  - [ ] "�?效果恢复正常渲染

  **QA Scenarios**:
  ```
  Scenario: Effect switching works
    Tool: Playwright
    Steps:
      1. Select "夜视" effect
      2. Wait for visual change
      3. Select "�? effect
      4. Assert original rendering restored
    Expected Result: Effects switch cleanly without residue
    Evidence: .omo/evidence/task-20-postprocess.png
  ```

  **Commit**: YES (groups with 17-19)
  - Files: `src/examples/effects/post-process.vue`

- [x] 21. clipping-plane.vue 实现 ClippingPlane + 控制面板

  **What to do**:
  - 实现真正�?ClippingPlane 功能（当前只有文字占位符 + �?3DTileset 加载�?  - 加载 3D Tileset 后应�?ClippingPlaneCollection
  - 使用 ExamplePanel，参数：开挖方向（n-select: �?�?�?�?�?北）、开挖深度（n-slider 10-200）、倾斜角度（n-slider 0-45）、边缘宽度（n-slider 0-5�?  - 添加"重置"按钮恢复初始状�?  - Ion Token 不可用时面板显示友好提示

  **Must NOT do**: 不添加自定义开挖形�?  **Recommended Agent Profile**: **Category**: `deep`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5, Blocked By: Task 8
  **References**:
  - `src/examples/terrain/clipping-plane.vue` �?当前 73 行（占位�?+ 空实现）
  - Cesium API: `Cesium.ClippingPlaneCollection`, `Cesium.ClippingPlane`

  **Acceptance Criteria**:
  - [ ] 实际�?ClippingPlane 开挖效果（不是文字�?  - [ ] 4 个参数控�?+ 重置按钮
  - [ ] Ion Token 缺失时显示提�?
  **QA Scenarios**:
  ```
  Scenario: Clipping plane visible
    Tool: Playwright
    Steps:
      1. Navigate to "地形开�? example
      2. If Ion Token available, assert clipping plane effect visible
      3. If not, assert error message in panel
    Expected Result: Real clipping effect or clear error message
    Evidence: .omo/evidence/task-21-clipping.png
  ```

  **Commit**: YES (groups with 22-29)
  - Message: `feat(terrain,viz): add controls to remaining examples`
  - Files: `src/examples/terrain/clipping-plane.vue`

- [x] 22. measurement.vue 添加结果面板

  **What to do**:
  - 使用 ExamplePanel，显示：
    - 测量点列表（序号 + 坐标�?    - 各段距离列表
    - 总距离（大字突出�?    - 单位切换按钮（m / km�?    - "清空测量"按钮（清�?points[] + 移除所�?meas- entity�?  - 保持现有点击添加�?+ 右键结束逻辑

  **Must NOT do**: 不修改测量算�?  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5, Blocked By: Task 8
  **References**: `src/examples/terrain/measurement.vue` �?当前 110 �?
  **Acceptance Criteria**:
  - [ ] 面板实时显示测量结果
  - [ ] 单位切换 m/km
  - [ ] "清空测量"按钮工作

  **QA Scenarios**:
  ```
  Scenario: Measurement results in panel
    Tool: Playwright
    Steps:
      1. Navigate to "空间量测" example
      2. Click 3 points on globe
      3. Assert panel shows 2 segment distances + total distance
      4. Click unit toggle
      5. Assert values change from km to m
    Expected Result: Panel shows accurate measurement data
    Evidence: .omo/evidence/task-22-measurement.png
  ```

  **Commit**: YES (groups with 21, 23-29)
  - Files: `src/examples/terrain/measurement.vue`

- [x] 23. viewshed.vue 添加观察者控制�?
  **What to do**:
  - 使用 ExamplePanel，参数：观察者高度（n-slider 0-500）、射线数量（n-slider 8-72）、射线半径（n-slider 0.005-0.05）、射线颜色（n-color-picker�?  - 参数变化时重建射线实�?  - 添加"重置观察�?按钮飞回中心

  **Must NOT do**: 不实�?GPU 可视域分�?  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5, Blocked By: Task 8
  **References**: `src/examples/terrain/viewshed.vue` �?当前 59 �?
  **Acceptance Criteria**:
  - [ ] 4 个参数控件实时调节射线显�?  - [ ] 射线数量变化时正确重�?
  **QA Scenarios**:
  ```
  Scenario: Ray count changes visibility
    Tool: Playwright
    Steps:
      1. Set ray count slider to 12
      2. Assert 12 polyline entities visible
    Expected Result: Ray count matches slider value
    Evidence: .omo/evidence/task-23-viewshed.png
  ```

  **Commit**: YES (groups with 21-22, 24-29)
  - Files: `src/examples/terrain/viewshed.vue`

- [x] 24. terrain-load.vue 添加底图选择�?+ 修复清理

  **What to do**:
  - 重写面板（当前有代码说明+按钮，改�?ExamplePanel�?  - 底图选择器（n-select）：Cesium World Terrain / Ellipsoid（默认）
  - 参数：是否启用光照（n-switch）、是否启用水面反射（n-switch�?  - 保留 Task 3 修复�?onUnmounted 清理逻辑

  **Must NOT do**: 不添加自定义地形 URL
  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 5, Blocked By: Task 8
  **References**: `src/examples/terrain/terrain-load.vue` �?当前 93 �?
  **Acceptance Criteria**:
  - [ ] 使用 ExamplePanel 替换当前覆盖�?  - [ ] 地形选择器工�?  - [ ] 2 个开关实时生�?  - [ ] onUnmounted 正确恢复状�?
  **QA Scenarios**:
  ```
  Scenario: Terrain toggle works
    Tool: Playwright
    Steps:
      1. Select "Cesium World Terrain"
      2. Assert terrainProvider is not EllipsoidTerrainProvider
      3. Select "Ellipsoid"
      4. Assert terrainProvider is EllipsoidTerrainProvider
    Expected Result: Terrain switches correctly
    Evidence: .omo/evidence/task-24-terrain-load.png
  ```

  **Commit**: YES (groups with 21-23, 25-29)
  - Files: `src/examples/terrain/terrain-load.vue`

- [x] 25. migration-lines.vue 添加动画控制

  **What to do**:
  - 使用 ExamplePanel，参数：动画速度（n-slider 0.1-5.0）、是否显示流动效果（n-switch）、流动尾迹长度（n-slider 0.1-1.0）、线条宽度（n-slider 1-8�?  - 添加流动动画（使�?Cesium.PolylineGlowMaterial 或自定义 MaterialProperty 实现脉冲效果�?
  **Must NOT do**: 不添加自定义迁徙数据
  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel with 26, 28-29), Blocked By: Task 8
  **References**: `src/examples/visualization/migration-lines.vue` �?当前 45 �?
  **Acceptance Criteria**:
  - [ ] 4 个参数控�?  - [ ] 开启动画后有脉�?流动视觉效果

  **QA Scenarios**:
  ```
  Scenario: Flow animation visible
    Tool: Playwright
    Steps:
      1. Toggle "流动效果" switch on
      2. Wait 2s
      3. Assert polyline material is not a simple Color
    Expected Result: Lines show animated flow effect
    Evidence: .omo/evidence/task-25-migration.png
  ```

  **Commit**: YES (groups with 21-24, 26-29)
  - Files: `src/examples/visualization/migration-lines.vue`

- [x] 26. dynamic-texture.vue 添加动画控制

  **What to do**:
  - 使用 ExamplePanel，参数：动画速度（n-slider 0.1-5.0）、HSL 色相范围（n-slider 0-360）、画布内容模式（n-select: 色相旋转/棋盘�?波浪�?  - 保留现有 Canvas + RAF 动画机制

  **Must NOT do**: 不添加自定义 Canvas 绘制
  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel with 27-29), Blocked By: Task 8
  **References**: `src/examples/visualization/dynamic-texture.vue` �?当前 48 �?
  **Acceptance Criteria**:
  - [ ] 3 个参数控�?  - [ ] 3 种画布模式可切换

  **QA Scenarios**:
  ```
  Scenario: Pattern mode switch works
    Tool: Playwright
    Steps:
      1. Select "棋盘�? mode
      2. Wait 1s
      3. Assert canvas draws checkerboard pattern
    Expected Result: Texture pattern changes
    Evidence: .omo/evidence/task-26-dynamic-texture.png
  ```

  **Commit**: YES (groups with 21-25, 27-29)
  - Files: `src/examples/visualization/dynamic-texture.vue`

- [x] 27. cylinder-chart.vue 添加数据控制

  **What to do**:
  - 使用 ExamplePanel，功能：
    - 数据值滑块组�? �?n-slider，对�?8 个柱体，范围 10-100�?    - 柱体顶部半径（n-slider 20-200�?    - 排序模式（n-select: 原始顺序/升序/降序�?  - 滑块变化时实时更新对�?cylinder �?length + label

  **Must NOT do**: 不添加柱体增删功�?  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel with 26, 28-29), Blocked By: Task 8
  **References**: `src/examples/visualization/cylinder-chart.vue` �?当前 53 �?
  **Acceptance Criteria**:
  - [ ] 8 个数据滑�?+ 1 个半径滑�?+ 排序选择�?  - [ ] 数据变化实时更新柱体高度和颜�?
  **QA Scenarios**:
  ```
  Scenario: Data slider updates cylinder
    Tool: Playwright
    Steps:
      1. Set first data slider to 20
      2. Assert first cylinder entity length matches new value
    Expected Result: Cylinder height changes
    Evidence: .omo/evidence/task-27-cylinder-chart.png
  ```

  **Commit**: YES (groups with 21-26, 28-29)
  - Files: `src/examples/visualization/cylinder-chart.vue`

- [x] 28. primitive-geometry.vue 添加几何体选择器�?
  **What to do**:
  - 使用 ExamplePanel，参数：
    - 几何体类型（n-select: RectangleGeometry/BoxGeometry/EllipseGeometry�?    - 高度范围（n-slider 50-500�?    - 颜色随机种子（n-slider 0-100，改变颜色分布）
    - 透明度（n-slider 0.1-1.0�?  - 参数变化时重�?Primitive

  **Must NOT do**: 不添加自定义 geometry 参数
  **Recommended Agent Profile**: **Category**: `unspecified-high`, **Skills**: [`frontend-ui-ux`]
  **Parallelization**: Wave 6 (parallel with 25-27, 29), Blocked By: Task 8
  **References**: `src/examples/visualization/primitive-geometry.vue` �?当前 48 �?
  **Acceptance Criteria**:
  - [ ] 4 个参数控�?  - [ ] 几何体类型切换时重建 primitive

  **QA Scenarios**:
  ```
  Scenario: Geometry type switch works
    Tool: Playwright
    Steps:
      1. Select "BoxGeometry" from dropdown
      2. Assert old primitive removed and new one added
    Expected Result: Geometry type changes
    Evidence: .omo/evidence/task-28-primitive-geometry.png
  ```

  **Commit**: YES (groups with 21-27, 29)
  - Files: `src/examples/visualization/primitive-geometry.vue`

- [x] 29. cesium-inspector.vue 增强面板

  **What to do**:
  - 使用 ExamplePanel 替换当前覆盖�?  - 添加功能：Inspector 开/关按钮、性能统计显示开关（framerate/DrawCommands）、当前帧率显示（通过 scene.postRender 监听�?
  **Must NOT do**: 不修�?Cesium Inspector 本身
  **Recommended Agent Profile**: **Category**: `quick`, **Skills**: []
  **Parallelization**: Wave 6 (parallel with 26-28), Blocked By: Task 8
  **References**: `src/examples/basic/cesium-inspector.vue` �?当前 62 �?
  **Acceptance Criteria**:
  - [ ] 使用 ExamplePanel
  - [ ] 3 个开�?显示
  - [ ] 帧率实时更新

  **QA Scenarios**:
  ```
  Scenario: Inspector toggle works
    Tool: Playwright
    Steps:
      1. Click inspector toggle button
      2. Assert Cesium Inspector widget appears
      3. Click again
      4. Assert Inspector disappears
    Expected Result: Inspector toggles cleanly
    Evidence: .omo/evidence/task-29-inspector.png
  ```

  **Commit**: YES (groups with 21-28)
  - Files: `src/examples/basic/cesium-inspector.vue`

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** �?`oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns �?reject with file:line if found. Check evidence files in .omo/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** �?`unspecified-high`
  Run `npx vite build`. Run ESLint on all modified files. Review for: type suppression, empty catches, debug logging, commented-out code, unused imports, AI slop (excessive comments, over-abstraction).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** �?`unspecified-high` (+ `playwright` skill)
  Switch between all 24 examples rapidly (5+ switches in <3s). Verify zero stale entities. For each modified example: interact with panel controls, verify visual response, capture screenshot evidence. Test error states (no Ion token, model load failure).
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [x] F4. **Scope Fidelity Check** �?`deep`
  For each task: read "What to do", read actual diff. Verify 1:1 �?everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | VERDICT`

---

## Commit Strategy

- **Wave 0**: `fix(examples): add store-level cleanup safety net and fix lifecycle bugs` - stores/examples.ts, CesiumPreview.vue, terrain-load.vue, measurement.vue
- **Wave 1**: `feat(basic): add interactive panels to coordinate-pick, mouse-events, load-basemap` - 3 files
- **Wave 2**: `refactor(examples): extract shared ExamplePanel component and CSS variables` - ExamplePanel.vue, _example-vars.scss, camera-flyto.vue, video-fusion.vue
- **Wave 3**: `feat(entity): add parameter panels to all entity examples` - 6 files
- **Wave 4**: `feat(effects): implement water and custom-shader; add particle/post-process controls` - 4 files
- **Wave 5**: `feat(terrain): add controls to terrain and viewshed examples` - 5 files
- **Wave 6**: `feat(viz): add controls to visualization and inspector examples` - 4 files

---

## Success Criteria

### Verification Commands
```bash
npx vite build  # Expected: success (existing pre-existing TS errors in other files are acceptable)
npx eslint src/examples/ src/components/examples/ src/styles/_example-vars.scss  # Expected: 0 errors
```

### Final Checklist
- [ ] All 24 examples have interactive panels or visual feedback
- [ ] Zero entity/primitive residue after example switching
- [ ] All onUnmounted hooks properly clean up
- [ ] All panels use Naive UI dark components
- [ ] All panels have @mousedown.stop @click.stop
- [ ] ExamplePanel shared component used by all enhanced examples
- [ ] _example-vars.scss provides consistent theming
