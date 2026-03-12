# Visual QA Report — Portfolio Site

**Date**: 2026-03-12  
**URL**: http://localhost:3000  
**Tool**: Playwright 1.58.2 (headless Chromium + SwiftShader WebGL)  
**Viewport**: 1920×1080

---

## Scenario A: Page Loads Without Crash — PASS ✅

- **Title**: "Edward Tran — Creative Developer"
- **Body content**: 65,663 characters — renders fully
- **Hero**: Name, subtitle "FULL-STACK DEVELOPER", nav links (ET, ABOUT, PROJECTS, EXPERIENCE, CONTACT), scroll indicator all visible
- **Background**: Gold-toned topographic lines visible
- **Dev overlay**: "7 Issues" red pill in bottom-left (React style warnings, non-critical)

**Evidence**: `A-page-load-viewport.png`, `A-page-load-full.png`

---

## Scenario B: Project Cards Show Images — PARTIAL PASS ⚠️

All 4 cards found in 2×2 grid with correct data-project-id attributes:

| Card | Image Status | Notes |
|------|-------------|-------|
| x-recommendation-algo | ✅ Shows project screenshot | Dashboard/feed UI visible |
| viet-bike-scout | ⚠️ Dark green background only | No project image rendered, just topo pattern |
| autoresearch-macos | ⚠️ Dark blue block only | Placeholder background, no screenshot |
| stocktwits-clone-2 | ✅ Shows project screenshot | Feed/trending UI clearly visible |

**Technical findings**:
- WebGL canvas exists (1920×1080), `hasWebGL: true` via SwiftShader
- Canvas positioned `static` with `z-index: auto` (expected: `fixed` at `z-index: 0`)
- **No CSS background-image fallback** on any card — images rendered exclusively through WebGL canvas
- Cards that show images (x-rec, stolk) appear to render via the WebGL mesh; cards without (vbs, autoresearch) show only their colored div backgrounds
- Card opacity all at `1` — GSAP ScrollTrigger animations completed

**Verdict**: 2/4 cards show project images. 2/4 show only colored backgrounds. This may be a WebGL texture loading issue in headless, or actual missing textures. **Needs real browser verification.**

**Evidence**: `B-projects-section.png`, `B-projects-scrolled.png`

---

## Scenario C: Hover Effect on Project Cards — PARTIAL PASS ⚠️

| Card | Hover Effect | Notes |
|------|-------------|-------|
| x-recommendation-algo | ❌ No visible change | No distortion, no glow, no scale, no image transition |
| stocktwits-clone-2 | ⚠️ Subtle white glow only | Soft white border glow visible; no liquid distortion or image swap |

**Technical findings**:
- `cardTransform`: `matrix(1,0,0,1,0,0)` (identity — no transform during hover)
- `cardBoxShadow`: `rgba(0,0,0,0.5) 0px 24px 48px 0px, rgba(200,169,126,0.14) 0px 0px 0px 1px` — shadow present
- `childTransforms`: 0 — no child elements being transformed during hover
- No GSAP-driven displacement animation observed

**Explanation**: The WebGL displacement effect requires full GPU pipeline (uniform updates, ShaderMaterial distortion). SwiftShader in headless Chromium provides basic WebGL context but can't fully drive the GSAP→uniform→shader pipeline. The subtle glow on StockTwits suggests CSS hover states work, but the WebGL displacement is not active.

**Verdict**: CSS hover effects (glow/shadow) work partially. WebGL displacement effect NOT verifiable in headless. **Needs real browser verification.**

**Evidence**: `C-before-hover.png`, `C-during-hover.png`, `C-after-hover.png`, `C-hover-stocktwits.png`

---

## Scenario D: Company Logo Marquee — PASS ✅

- **Marquee found**: `experience-module___feyBW__logoMarquee marquee-module__hTg7eW__marquee`
- **Position**: y=4906, full width (1920px), height 117px
- **5 company logos confirmed**: Headstarter, Tinyfish, BLI (infinity symbol), Douglas College, Smart Math BC
- **Logos visible**: All 5 logos rendered, visible, with `naturalWidth > 0`
- **Tripled for scroll**: 15 total images (5 logos × 3 repetitions) — correct for infinite scroll illusion
- **Opacity**: 1 (visible)

**Marquee animation**:
- CSS `animation: none` on inner tracks — animation likely driven by GSAP or JS, not CSS keyframes
- In headless screenshot, logos appear static (expected — CSS animation snapshot captures one frame)
- The 3× repetition pattern confirms infinite scroll is set up correctly

**Verdict**: Logos render correctly. Scrolling animation structure is in place (3× duplication). Animation itself is JS-driven and can't be verified as "actively scrolling" in a static screenshot. **Visual rendering: PASS.**

**Evidence**: `D-experience-top.png`, `D-experience-bottom.png`, `D-marquee-area.png`

---

## Scenario E: Console Errors — PASS ✅ (no critical errors)

| Category | Count | Severity | Details |
|----------|-------|----------|---------|
| WebGL/THREE/Texture/Material/Shader | 0* | N/A | No WebGL errors with `--use-angle=swiftshader` flag |
| React style warnings | 12 | Low (warning) | `background` shorthand conflicts with `backgroundImage/Position/Size` |
| Critical (uncaught/fatal/crash) | 0 | N/A | None |
| Page errors | 0 | N/A | None |

*Note: Without `--use-angle=swiftshader`, the first run showed 4 WebGL errors:
- `THREE.WebGLRenderer: A WebGL context could not be created` (×2)
- `THREE.WebGLRenderer: Error creating WebGL context` (×1)
- `PAGE_ERROR: Error creating WebGL context` (×1)

These are SwiftShader limitations in headless Chromium, NOT production errors. In a real browser with GPU acceleration, these would not occur.

**React style warnings (12×)**: All identical — mixing CSS shorthand `background` with specific `backgroundImage`, `backgroundPosition`, `backgroundSize`. Non-critical but should be cleaned up to avoid React dev-mode noise.

**Verdict**: Zero critical errors. Zero WebGL errors with proper GL backend. React warnings are cosmetic.

---

## Summary

| Scenario | Result | Confidence |
|----------|--------|------------|
| A: Page load | ✅ PASS | High |
| B: Project card images | ⚠️ PARTIAL (2/4 show images) | Medium — headless WebGL limits |
| C: Hover displacement | ⚠️ PARTIAL (glow only, no distortion) | Low — headless can't drive WebGL shaders |
| D: Logo marquee | ✅ PASS | High |
| E: Console errors | ✅ PASS (0 critical) | High |

### Headless Limitations Disclaimer
WebGL displacement effects (Scenarios B & C) are inherently limited in headless Chromium with SwiftShader. The SwiftShader driver provides basic WebGL context but has known limitations with:
- Complex shader programs (ShaderMaterial with custom uniforms)
- Dynamic texture rendering
- GPU-accelerated animations driven by requestAnimationFrame + GSAP

**Recommendation**: For full WebGL visual QA, test in a real browser (Chrome with hardware GPU) or use `headless: false` Playwright mode with a display server.
