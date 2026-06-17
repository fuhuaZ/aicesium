# GlobalWatermark Manual QA — Playwright Verification

**Date**: 2026-06-17  
**App URL**: http://127.0.0.1:5173  
**Tool**: Playwright MCP (Chromium)  
**Viewport**: 929×869, DPR=1  

---

## Scenario 1: Canvas Attributes ✅ PASS

**Query**: `document.querySelector('canvas[data-watermark]')`

| Attribute | Expected | Actual | Match |
|-----------|----------|--------|-------|
| canvas exists | true | true | ✅ |
| pointer-events | none | none | ✅ |
| aria-hidden | "true" | "true" | ✅ |
| position | fixed | fixed | ✅ |
| top | 0px | 0px | ✅ |
| left | 0px | 0px | ✅ |
| z-index | 9999 | 9999 | ✅ |
| clientWidth = window.innerWidth | 929 = 929 | 929 = 929 | ✅ |
| clientHeight = window.innerHeight | 869 = 869 | 869 = 869 | ✅ |
| parent element | body | BODY | ✅ (Teleported) |

---

## Scenario 2: Time Update Between Captures ✅ PASS

Captured `canvas.toDataURL()` at T=0 and T=1.5s:

| Capture | Data URL Length | Content |
|---------|----------------|---------|
| T=0 | 113,110 bytes | data:image/png;base64,iVBOR... |
| T=1.5s | 114,854 bytes | data:image/png;base64,iVBOR... |

**Result**: `contentChanged = true` — the time string updated between captures. ✅

---

## Scenario 3: Buffer Dimensions = CSS × DPR ✅ PASS

| Dimension | Buffer (canvas.width/height) | CSS (getBoundingClientRect) | DPR | Expected | Match |
|-----------|------|-----|-----|----------|-------|
| Width | 929 | 929 | 1 | 929 | ✅ |
| Height | 869 | 869 | 1 | 869 | ✅ |

**Formula**: `bufW = Math.round(cssW × dpr)` → `929 = 929 × 1` ✅

---

## Scenario 4: Canvas Persists Across Routes ✅ PASS

Navigated through 4 distinct routes. Canvas `[data-watermark]` verified present on each.

| # | Route | Canvas Exists |
|---|-------|--------------|
| 1 | `/` (home) | ✅ |
| 2 | `/example/cesium/basic/load-basemap` | ✅ |
| 3 | `/example/cesium/basic/camera-flyto` | ✅ |
| 4 | `/example/cesium/basic/coordinate-pick` | ✅ |
| 5 | `/example/cesium/basic/cesium-inspector` | ✅ |

---

## Scenario 5: Cesium Drag Through Watermark ✅ PASS

Two drag operations performed:

1. **Drag on Cesium canvas center** (401.5, 458.5) → (501.5, 408.5) — completed without errors
2. **Drag through watermark overlay at viewport center** (464, 434) → (564, 384) — completed without errors

Watermark canvas has `pointer-events: none` — clicks pass through to Cesium canvas underneath. ✅

---

## Scenario 6: Zero Console Errors ✅ PASS

Console messages after all interactions:

| Level | Count | Content |
|-------|-------|---------|
| error | 0 | — |
| warning | 0 | — |
| debug | 2 | `[vite] connecting...`, `[vite] connected.` (Vite HMR, expected) |

**Errors**: 0 ✅  
**Warnings**: 0 ✅

---

## Verdict

```
Scenarios [6/6 pass] | VERDICT: PASS
```

All 6 scenarios passed. No console errors. No visual or functional regressions detected.
