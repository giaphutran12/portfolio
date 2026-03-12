# Visual QA Report: Logo Marquee Fix (Task 2)

## Test Environment
- **URL**: http://localhost:3000
- **Viewport**: 1920×1080 (headless Chromium via Playwright)
- **Date**: 2026-03-12

---

## Checklist Results

### ✅ Marquee spans full viewport width
- **Marquee container** (`logoMarquee`): **1920px wide** — matches viewport exactly
- Container has `display: flex; overflow-x: clip` — correct
- Confirmed via DOM measurement and visual screenshot

### ❌ Logos are overlapping — NOT properly spaced
- **Root cause**: `.inner` wrapper (in `marquee.module.css`) lacks `flex-shrink: 0`
- `.marquee` is `display: flex` with 4 `.inner` children (repeat=4)
- Each `.logoTrack` is **811px** wide with `flex-shrink: 0` (won't shrink)
- But `.inner` has default `flex-shrink: 1`, so flexbox shrinks each to **480px** (1920/4)
- Result: `.logoTrack` (811px) overflows `.inner` (480px) by **331px**, causing adjacent copies to visually overlap

**Overlap measurements** (from bounding rects):
| Logo Pair | Overlap |
|-----------|---------|
| bli.svg → headstarter.png | 8px |
| headstarter.png → douglas-college.png | 48px |
| douglas-college.png → tinyfish.png | 8px |
| tinyfish.png → smart-math-bc.png | 48px |
| smart-math-bc.png → bli.svg | 8px |

This pattern repeats across all 4 `.inner` copies. Visually confirmed in `task-2-marquee-clipped.png`.

**Animation also broken**: The animation shifts by `.inner.borderBoxSize` (480px), but content repeats every 811px. This means the scroll loop doesn't tile seamlessly.

**Fix**: Add `flex-shrink: 0` to `.inner` in `components/ui/marquee/marquee.module.css`:
```css
.inner {
  display: flex;
  flex-shrink: 0;       /* ← ADD THIS */
  white-space: nowrap;
  transform: translate3d(0, 0, 0);
}
```

### ✅ No background/backgroundImage console warnings
- Searched all console messages — **0 matches** for "background" or "backgroundImage"
- The shorthand → longhand fix is working correctly

### ⚠️ Project cards render correctly (images blank due to headless)
- **Layout**: ✅ 2×2 grid of project cards visible
- **Titles**: ✅ "X Recommendation Algorithm", "Viet Bike Scout" readable
- **Tags**: ✅ "PYTHON", "TENSORFLOW", "FASTAPI", "REACT NATIVE", "EXPO", "TYPESCRIPT"
- **Descriptions**: ✅ Visible and readable
- **Images**: ⚠️ Appear as black rectangles — likely due to:
  - WebGL/canvas effects that don't render in headless Chromium
  - THREE.WebGLRenderer errors confirm no WebGL context available
  - **Not a code bug** — expected headless limitation
  
---

## Console Messages Summary

| Type | Count | Details |
|------|-------|---------|
| Errors | 3 | THREE.WebGLRenderer — no WebGL in headless (expected) |
| Warnings | 5 | Next.js Image width/height, CSS preload timing |
| Background warnings | **0** | ✅ No background/backgroundImage conflicts |

### Next.js Image Warnings (low priority)
All 5 company logo images trigger:
> "Image has either width or height modified, but not the other. Include `width: 'auto'` or `height: 'auto'`"

These are cosmetic warnings from Next.js Image component — not blocking.

---

## Evidence Files
- `task-2-marquee-qa.png` — Experience section with marquee visible
- `task-2-marquee-clipped.png` — Marquee strip close-up (shows overlap)
- `task-2-projects-qa.png` — Projects section with card grid
- `task-2-fullpage.png` — Full page reference

---

## Verdict

| Criterion | Status |
|-----------|--------|
| Marquee full-width | ✅ PASS |
| Logos properly spaced | ❌ FAIL — overlapping due to missing `flex-shrink: 0` on `.inner` |
| No background warnings | ✅ PASS |
| Project cards render | ✅ PASS (images blank = headless limitation) |
| Animation seamless | ❌ FAIL — shift distance (480px) ≠ content width (811px) |
