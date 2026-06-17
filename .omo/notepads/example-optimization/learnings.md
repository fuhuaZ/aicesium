# learnings.md

## Key Learnings

### Subagent Write vs Edit Issue
- Subagents MUST use Edit (not Write) when the target file already exists
- Write tool fails with error on existing files that have been read
- This caused T12-T14 failures in Wave 3; T15 had to be manually re-dispatched
- Always specify "Use Edit, NOT Write" in task prompts for existing files

### Cesium API Notes
- Water material MUST use `Cesium.Primitive` + `Cesium.MaterialAppearance`, NOT Entity.rectangle
- `Cesium.Material.WaterType` fabric uniforms: baseWaterColor, blendColor, specularMap, normalMap, frequency, animationSpeed, amplitude
- CustomShader on models: use `Cesium.CustomShaderMode.MODIFY_MATERIAL` with `fragmentShaderText`
- Model at `public/models/Room.gltf` is available for shader demos
- `CustomShader.setUniform()` is available in Cesium ^1.142.0
- PostProcessStage: use `scene.postProcessStages.add()` / `.remove()`

### Build System
- `npx vite build` is the verification command
- terrain-load.vue has pre-existing TS error (variable redeclaration) - NOT our issue
- `.omo/evidence/` dir needed for QA evidence files
- `components.d.ts` gets auto-updated by subagents (Naive UI component type declarations)

### Style Pattern
- All panels use `ExamplePanel.vue` with title/width props and slots
- CSS variables from `_example-vars.scss`: `$exo-cyan`, `$exo-bg-panel`, `$exo-text-primary`, `$exo-text-muted`, `$exo-text-dim`
- Standard row pattern: `.wp-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }`
- Label: `.wp-label { font-size: 12px; color: vars.$exo-text-muted; min-width: 60px; flex-shrink: 0; }`
- Value: `.wp-val { font-size: 11px; color: vars.$exo-text-dim; min-width: 36px; text-align: right; flex-shrink: 0; }`

### Viewer Pattern
- Viewer is global singleton, passed via `defineProps<{ viewer: Cesium.Viewer }>()`
- Entity cleanup: `viewer.entities.removeAll()` in onUnmounted
- Primitive cleanup: `scene.primitives.remove(primitive)` in onUnmounted
- Store safety net: `selectExample()` / `setTech()` in examples.ts calls removeAll before loading new example

### Progress Tracking
- Plan file `.omo/plans/example-optimization.md` has checkboxes for each task
- Must update checkboxes after completion
- Build verification required after each wave


