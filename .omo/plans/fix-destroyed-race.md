# 修复示例切换时 "destroyed" 渲染崩溃

## TL;DR

> **Quick Summary**: 3 个示例在 rAF 回调中访问 Cesium 对象，但 `cancelAnimationFrame` 只能阻止未来帧——若回调已在执行，仍会访问 `removeAll()` 销毁后的残留引用，触发 `DeveloperError: destroyed`。引入 `disposed` 守卫旗标消除竞态。

> **Deliverables**:
> - `src/examples/effects/custom-shader.vue` — rAF + 所有 watcher 加 `disposed` 检查
> - `src/examples/visualization/migration-lines.vue` — rAF + watcher 加 `disposed` 检查
> - `src/examples/visualization/dynamic-texture.vue` — rAF 加 `disposed` 检查
>
> **Estimated Effort**: Quick
> **Parallel Execution**: YES - 3 tasks in 1 wave
> **Critical Path**: All 3 parallel → build verify

---

## Context

### Original Request
用户反馈："在切换示例会报错 `DeveloperError: This object was destroyed, i.e., destroy() was called.`"

### Diagnosis
`cancelAnimationFrame()` 的行为是取消**排队中**的回调。但如果回调**正在执行**，它无法被中断。典型时序：

```
Frame N:     rAF callback 开始执行 → customShader.setUniform() ← 此时 shader 还活着，OK
Frame N+1:   onUnmounted 触发 → cancelAnimationFrame(animFrame) → viewer.entities.removeAll()
             → 但 Frame N 的 rAF callback **还没返回** → 它继续执行 setUniform()
             → shader 所属的 model entity 已被 removeAll 销毁
             → 💥 "destroyed"
```

更微妙的路径：`custom-shader.vue` 有 4 个 `watch()` 通过 `setUniform` 修改 shader uniform。当 Vue 响应式系统在 unmount 过程中触发 watcher 时（例如某个 n-slider 的 v-model 被重置），同样会命中已销毁的 shader。

### Scope Boundaries
- **IN**: custom-shader.vue, migration-lines.vue, dynamic-texture.vue 添加 disposed 守卫
- **OUT**: 不改 terrain-load/measurement/viewshed（它们不使用 rAF）；不改 video-fusion（已有独立守卫逻辑）

---

## Work Objectives

### Core Objective
消除示例切换时的渲染崩溃，确保任意顺序切换 24 个示例不会触发 "destroyed" 错误。

### Definition of Done
- [ ] `npx vite build` 零错误
- [ ] 快速连续切换所有 24 个示例不报错

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - all 3 parallel):
├── Task 1: custom-shader.vue 加 disposed 旗标 [quick]
├── Task 2: migration-lines.vue 加 disposed 旗标 [quick]
└── Task 3: dynamic-texture.vue 加 disposed 旗标 [quick]
```

---

## TODOs

- [x] 1. custom-shader.vue 添加 disposed 守卫旗标

  **What to do**:
  - 文件: `src/examples/effects/custom-shader.vue`
  - 在 `let animFrame` 旁添加 `let disposed = false`
  - `animateTime()` 函数第一行加 `if (disposed) return`
  - 所有 4 个 watch 回调第一行加 `if (disposed) return`
  - `onUnmounted` 最开头加 `disposed = true`（在任何清理操作之前）
  - 运行 `npx vite build` 验证

  **Must NOT do**: 不改 shader 逻辑，不添加新依赖

  **Recommended Agent Profile**: `quick`

  **Parallelization**: Wave 1, parallel with Task 2-3

  **Acceptance Criteria**:
  - [ ] disposed 旗标在 animateTime 和 4 个 watch 的**第一行**检查
  - [ ] `disposed = true` 在 `onUnmounted` 的**第一行**
  - [ ] `npx vite build` 通过

  **Commit**: YES
  - Message: `fix(effects): prevent custom-shader rAF/watcher race on unmount`
  - Files: `src/examples/effects/custom-shader.vue`

- [x] 2. migration-lines.vue 添加 disposed 守卫旗标

  **What to do**:
  - 文件: `src/examples/visualization/migration-lines.vue`
  - 在 `let animId` 旁添加 `let disposed = false`
  - `animate()` 函数第一行加 `if (disposed) return`
  - `applyMaterial()` 函数第一行加 `if (disposed) return`
  - `onUnmounted` 最开头加 `disposed = true`
  - 运行 `npx vite build` 验证

  **Must NOT do**: 不改动画逻辑，不添加新依赖

  **Recommended Agent Profile**: `quick`

  **Parallelization**: Wave 1, parallel with Task 1, 3

  **Acceptance Criteria**:
  - [ ] disposed 旗标在 animate 和 applyMaterial 的**第一行**检查
  - [ ] `disposed = true` 在 `onUnmounted` 的**第一行**
  - [ ] `npx vite build` 通过

  **Commit**: YES
  - Message: `fix(visualization): prevent migration-lines rAF race on unmount`
  - Files: `src/examples/visualization/migration-lines.vue`

- [x] 3. dynamic-texture.vue 添加 disposed 守卫旗标

  **What to do**:
  - 文件: `src/examples/visualization/dynamic-texture.vue`
  - 在 `let animId` 旁添加 `let disposed = false`
  - `draw()` 函数第一行加 `if (disposed) return`
  - `onUnmounted` 最开头加 `disposed = true`
  - 运行 `npx vite build` 验证

  **Must NOT do**: 不改渲染逻辑，不添加新依赖

  **Recommended Agent Profile**: `quick`

  **Parallelization**: Wave 1, parallel with Task 1-2

  **Acceptance Criteria**:
  - [ ] disposed 旗标在 draw() 的**第一行**检查
  - [ ] `disposed = true` 在 `onUnmounted` 的**第一行**
  - [ ] `npx vite build` 通过

  **Commit**: YES
  - Message: `fix(visualization): prevent dynamic-texture rAF race on unmount`
  - Files: `src/examples/visualization/dynamic-texture.vue`

---

## Commit Strategy

- **1**: `fix(effects): prevent custom-shader rAF/watcher race on unmount` — custom-shader.vue
- **2**: `fix(visualization): prevent migration-lines rAF race on unmount` — migration-lines.vue
- **3**: `fix(visualization): prevent dynamic-texture rAF race on unmount` — dynamic-texture.vue

---

## Success Criteria

### Verification Commands
```bash
npx vite build  # Expected: built in <5s, zero errors
```

### Final Checklist
- [x] 三个文件均有 `disposed` 守卫
- [x] `disposed = true` 都在 onUnmounted 最开头
- [x] 构建零错误
