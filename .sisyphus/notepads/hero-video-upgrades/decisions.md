# Decisions

## Task 2: Fix Hero Glow (AnimatedGradient) Not Rendering Visibly

### Root Cause
Two issues combined to make the hero glow invisible:

1. **Z-index stacking**: GlobalCanvas was at `z-index: 0` while `<main>` was at `z-index: 20`. The canvas (rendering ALL WebGL content via R3F) was painted BEHIND all main content. The AnimatedGradient portals via WebGLTunnel to the canvas, so it was hidden.

2. **Gradient colors too subtle**: Original colors `['#0a0a08', '#0f0d0a', '#171410', '#0a0a08']` were nearly identical to the html background `#0a0a08`. Even with z-index fixed, these colors produced no visible contrast.

3. **Inline pointer-events override**: The GlobalCanvas component had `pointerEvents: isActive ? 'auto' : 'none'` as an inline style, overriding the CSS module's `pointer-events: none`. With the canvas raised above content (z-30), this blocked ALL clicks on main content. The R3F Canvas also had `pointerEvents: isActive ? 'all' : 'none'` but uses `eventSource: document.documentElement` so doesn't need pointer-events on the canvas.

### Fix Applied
1. **Z-index raised to 30**: Updated consistently across all three files:
   - `global-canvas.module.css`: `z-index: 30`
   - `root.css`: `--z-canvas: 30`
   - `z-index.ts`: `canvas: 30`
   - Canvas is now above content (20) but below header (50). Safe because canvas has `alpha: true` (transparent overlay) and `pointer-events: none`.

2. **Pointer-events fix**: Removed inline `pointerEvents` override from GlobalCanvas container (CSS module's `pointer-events: none` now takes effect). Changed R3F Canvas style to always `pointer-events: none` since it uses `eventSource: document.documentElement`.

3. **Gradient colors brightened**: Changed to `['#0a0a08', '#241a10', '#3d2e1a', '#0a0a08']` — warmer amber tones that produce a subtle but visible glow against the dark background.

### Z-Index Contract (Updated)
```
--z-canvas: 30      (GlobalCanvas — WebGL overlay, pointer-events: none)
--z-noiseWaves: 5   (NoiseWaves overlay)
--z-content: 20     (Main content)
--z-header: 50      (Header navigation)
--z-overlay: 100    (Modal overlays)
--z-tooltip: 200    (Tooltips)
--z-preview: 300    (Preview panels)
```

### Verification
- ✅ Gradient renders visibly on canvas (confirmed via element screenshot)
- ✅ Content remains clickable (`elementFromPoint` returns text, not canvas)
- ✅ Project card WebGL images render correctly
- ✅ Project card hover transitions work (gold border highlight)
- ✅ NoiseWaves overlay renders at z-index 5
- ✅ Header at z-index 50 (above canvas)
- ✅ `bun run check` passes (biome, typecheck, 435 tests)
- ✅ LSP diagnostics clean on all changed files

### Key Learning
- Playwright full-page screenshots don't properly composite WebGL canvas content with the rest of the page. Element-level screenshots of the canvas DO capture WebGL content. Use element screenshots for WebGL verification.
- When raising canvas z-index above content, pointer-events MUST be `none` on the container. The original code had an inline override to `auto` that would block all content interactions.
- R3F with `eventSource: document.documentElement` doesn't need pointer-events on the canvas element itself.
