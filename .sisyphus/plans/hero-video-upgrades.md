# Hero Katakana Animation + Project Video Autoplay

## TL;DR

> **Quick Summary**: Three visual upgrades — (1) Hero name starts as Japanese katakana "エドワード・トラン" and decodes to "Edward Tran" via GSAP ScrambleTextPlugin. (2) Fix hero glow (AnimatedGradient WebGL) not showing due to z-index stacking issue — GlobalCanvas at z-0 is behind `<main>` at z-20. (3) Project cards support auto-playing muted video demos that play/pause via IntersectionObserver as user scrolls.
>
> **Deliverables**:
> - Modified hero component with Japanese initial text
> - Fixed hero glow visibility (z-index / gradient color fix)
> - `useVideoAutoplay` hook with IntersectionObserver play/pause + tab visibility
> - `VideoAutoplay` component with CSS Module
> - Updated project card data model with optional `videoSrc`
> - Integrated video rendering in projects section
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 3 (hook) → Task 5 (component) → Task 6 (integration)

---

## Context

### Original Request
User wants two changes: (1) Remove the static "Edward Tran" that flashes at page load — show Japanese katakana first, then let it decode to English. (2) Replace project card images with auto-playing video demos (1-4 min) when scrolling through projects.

### Interview Summary
**Key Discussions**:
- Video hosting: `public/project-videos/` directory, simple static serving
- Video vs image: Video replaces image entirely when `videoSrc` is present
- Mobile behavior: Autoplay everywhere, same behavior on all devices
- Initial hero text: エドワード・トラン (katakana) → scrambles to "Edward Tran"

**Research Findings**:
- Award-winning portfolios universally use IntersectionObserver + `muted` + `playsInline` + `loop` pattern
- Standard threshold: 0.25-0.5 visibility before triggering play
- Performance: `preload="none"` until in viewport, pause out-of-view videos
- GitHub examples (civitai/civitai, heroui, stashapp) all use identical IntersectionObserver + play/pause pattern
- Existing `useDocumentVisibility` hook in codebase handles tab visibility pausing

### Metis Review
**Identified Gaps** (addressed):
- SSR/hydration: Initial Japanese text must be hardcoded, not derived from `{name}` prop, to avoid hydration mismatch
- ScrambleText length mismatch: "エドワード・トラン" (9 chars) vs "Edward Tran" (11 chars) — ScrambleTextPlugin replaces innerHTML entirely so this is safe, but must be validated
- Gradient overlay: Keep `.gradientLayer` over videos for visual consistency (same as images)
- Video error handling: Fall back to gradient silently on load error
- Poster image: Use existing `imageSrc` as `poster` attribute while video loads
- Max concurrent videos: At 2-column grid layout, naturally max 2 visible; rely on IntersectionObserver pause-on-leave rather than a global counter
- No Playwright infra: Use `dev-browser` skill for visual QA instead

---

## Work Objectives

### Core Objective
Make the portfolio hero feel intentional with a katakana → English name decode, and showcase project work through auto-playing video demos instead of static images.

### Concrete Deliverables
- `components/sections/hero/index.tsx` — modified initial span text
- `components/effects/video-autoplay/index.tsx` — new VideoAutoplay component
- `components/effects/video-autoplay/video-autoplay.module.css` — styles
- `components/sections/projects/index.tsx` — updated data model + conditional rendering
- `public/project-videos/` — directory for video assets

### Definition of Done
- [ ] Hero glow (AnimatedGradient) is visually visible — not flat dark background
- [ ] Hero shows "エドワード・トラン" on initial render, animates to "Edward Tran"
- [ ] Project cards with `videoSrc` render `<video>` that autoplays on scroll-in, pauses on scroll-out
- [ ] Videos pause when browser tab is hidden
- [ ] `bun run check` passes (biome + types + tests)
- [ ] All projects without `videoSrc` retain current WebGL image behavior

### Must Have
- Hero glow (AnimatedGradient) visually visible in hero section — not hidden behind content
- Japanese katakana as initial hero text, decoded via ScrambleTextPlugin
- IntersectionObserver-based video autoplay/pause
- `useDocumentVisibility` integration for tab-hidden pausing
- `muted`, `playsInline`, `loop` attributes on all videos
- `preload="none"` for lazy loading until near viewport
- Error handling: silent fallback to gradient on video load failure
- `poster` attribute using existing `imageSrc` for loading state
- `aspect-ratio: 16/9` maintained via `object-fit: cover`
- Accessibility: `sr-only` span stays as English "Edward Tran"
- `prefers-reduced-motion` respected — shows "Edward Tran" immediately, no Japanese

### Must NOT Have (Guardrails)
- NO video player controls (play/pause buttons, scrubber, volume)
- NO video quality selectors or adaptive bitrate
- NO loading spinners, skeletons, or shimmer effects for video
- NO modifications to `ProjectCardMedia` or WebGL pipeline components
- NO Sanity CMS schema changes
- NO `useMemo`, `useCallback`, or `React.memo` (React Compiler is ON)
- NO `any` types (Biome `noExplicitAny: error`)
- NO inline styles for video sizing (CSS Modules only)
- NO relative parent imports (`../`) — path aliases only
- NO global video manager or video context provider
- NO click-to-fullscreen or hover-to-pause interactions
- NO FFmpeg/video processing build steps
- NO analytics or video engagement tracking

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (`bun test` configured)
- **Automated tests**: YES (tests-after for hook logic)
- **Framework**: bun test
- **Approach**: Unit tests for `useVideoAutoplay` hook; `dev-browser` skill for visual QA

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use `dev-browser` skill — Navigate, interact, assert DOM, screenshot
- **Hook/Module**: Use Bash (bun test) — Run unit tests, verify pass/fail

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — independent tasks):
├── Task 1: Hero katakana scramble animation [quick]
├── Task 2: Fix hero glow z-index / visibility [deep]
├── Task 3: useVideoAutoplay hook + unit tests [quick]
└── Task 4: VideoSrc data model + placeholder video [quick]

Wave 2 (After Wave 1 — component build):
└── Task 5: VideoAutoplay component + CSS module (depends: 3) [unspecified-high]

Wave 3 (After Wave 2 — integration):
└── Task 6: Integrate video autoplay into project cards (depends: 4, 5) [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── F1: Plan compliance audit (oracle)
├── F2: Code quality review (unspecified-high)
├── F3: Real manual QA (unspecified-high + dev-browser)
└── F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| 1    | —         | —      | 1    |
| 2    | —         | —      | 1    |
| 3    | —         | 5      | 1    |
| 4    | —         | 6      | 1    |
| 5    | 3         | 6      | 2    |
| 6    | 4, 5      | F1-F4  | 3    |

### Agent Dispatch Summary

- **Wave 1**: **4 parallel** — T1 → `quick`, T2 → `deep`, T3 → `quick`, T4 → `quick`
- **Wave 2**: **1** — T5 → `unspecified-high`
- **Wave 3**: **1** — T5 → `unspecified-high`
- **FINAL**: **4 parallel** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` + `dev-browser`, F4 → `deep`

---

## TODOs

- [x] 1. Hero Katakana Scramble Animation

  **What to do**:
  - In `components/sections/hero/index.tsx`, change the initial content of the `nameRef` span (line 104-106) from `{name}` to a hardcoded Japanese string `"エドワード・トラン"`
  - Keep the `sr-only` span as `{name}` ("Edward Tran") for accessibility — do NOT touch it
  - The GSAP ScrambleTextPlugin config (line 46-56) already targets `text: name` ("Edward Tran") as the destination — this stays the same
  - The `chars` scramble noise already uses katakana — this stays the same
  - **CRITICAL**: The initial text is now hardcoded, NOT derived from the `{name}` prop. This avoids SSR/hydration mismatches. The prop still controls the ScrambleText destination and sr-only text.
  - **CRITICAL**: Validate that ScrambleTextPlugin handles the source/destination length mismatch gracefully ("エドワード・トラン" = 9 chars, "Edward Tran" = 11 chars). The plugin replaces innerHTML entirely so this should be fine, but verify.
  - In `hero.module.css`, update the `@media (--reduced-motion)` handling: when reduced motion is preferred, the span should show `{name}` (English), not the Japanese text. Add a CSS class or JS check to handle this — the current `prefersReducedMotion` early return (line 35) means GSAP never runs, so the span stays as whatever the initial content is. With the Japanese initial text, this means reduced-motion users see Japanese forever. **FIX**: Set `nameRef.current.textContent = name` inside the `if (prefersReducedMotion) return` block before returning.

  **Must NOT do**:
  - Do NOT change `ANIM_DELAY`, `ANIM_DURATION`, or `ANIM_END` timing constants
  - Do NOT modify the `chars` scramble character set
  - Do NOT modify the subtitle or scroll indicator animation sequence
  - Do NOT change the `AnimatedGradient` background component
  - Do NOT add new dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file change, ~10 lines modified, clear specification
  - **Skills**: []
    - No specialized skills needed — straightforward React/GSAP modification
  - **Skills Evaluated but Omitted**:
    - `vercel-react-best-practices`: Not relevant — this is animation logic, not data fetching or rendering optimization

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Nothing
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `components/sections/hero/index.tsx:28-80` — The entire GSAP animation useEffect. Lines 31-35 handle `prefers-reduced-motion`. Lines 46-56 are the ScrambleText config. Line 104-106 is the span to modify.
  - `components/sections/hero/hero.module.css:22-25` — Reduced motion media query for subtitle. Follow this pattern for any CSS-level reduced-motion handling.

  **API/Type References**:
  - `components/sections/hero/index.tsx:14-17` — `HeroProps` interface. The `name` prop defaults to `"Edward Tran"`.

  **External References**:
  - GSAP ScrambleTextPlugin docs: The `text` property is the destination text, `chars` is the noise character set. The plugin replaces the element's innerHTML character by character. Source text is whatever is in the DOM when the tween starts.

  **WHY Each Reference Matters**:
  - `hero/index.tsx:31-35`: Must add `nameRef.current.textContent = name` here for reduced-motion users, otherwise they see Japanese forever
  - `hero/index.tsx:104-106`: This is THE line to change — swap `{name}` for `"エドワード・トラン"`
  - `hero/index.tsx:103`: The sr-only span stays as `{name}` — do NOT touch this

  **Acceptance Criteria**:

  - [ ] `nameRef` span initial content is `"エドワード・トラン"` (hardcoded, not from prop)
  - [ ] `sr-only` span content is `{name}` (English, from prop)
  - [ ] `prefers-reduced-motion` users see English "Edward Tran" (not Japanese)
  - [ ] ScrambleText animation decodes Japanese → English correctly
  - [ ] `bun run check` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Hero name starts as Japanese katakana and decodes to English
    Tool: dev-browser
    Preconditions: Dev server running (`bun dev`)
    Steps:
      1. Navigate to http://localhost:3000
      2. Immediately capture screenshot of hero section (within 100ms of load)
      3. Assert: element [data-testid="hero-name"] span[aria-hidden="true"] contains text "エドワード・トラン" or scrambled katakana characters
      4. Wait 2500ms (ANIM_DELAY 300ms + ANIM_DURATION 1500ms + buffer)
      5. Assert: element [data-testid="hero-name"] span[aria-hidden="true"] contains text "Edward Tran"
      6. Capture screenshot showing final "Edward Tran" text
    Expected Result: Initial text is Japanese, final text is English after animation
    Failure Indicators: "Edward Tran" visible at t=0, or Japanese text visible at t=2500ms
    Evidence: .sisyphus/evidence/task-1-hero-katakana-initial.png, .sisyphus/evidence/task-1-hero-english-final.png

  Scenario: Accessible name is always English
    Tool: Bash (grep)
    Preconditions: None
    Steps:
      1. Read `components/sections/hero/index.tsx`
      2. Find the `sr-only` span (should be line ~103)
      3. Assert: its content is `{name}` (not hardcoded Japanese)
    Expected Result: sr-only span renders the English name prop
    Failure Indicators: sr-only span contains Japanese text or is hardcoded
    Evidence: .sisyphus/evidence/task-1-sr-only-check.txt
  ```

  **Commit**: YES
  - Message: `feat(hero): render katakana as initial name text with scramble decode`
  - Files: `components/sections/hero/index.tsx`
  - Pre-commit: `bun run check`

- [x] 2. Fix Hero Glow (AnimatedGradient) Not Rendering Visibly

  **What to do**:
  - **PRIMARY ISSUE — Z-index stacking**: The `GlobalCanvas` renders all WebGL content at `position: fixed; z-index: 0` (`global-canvas.module.css:7`). The `<main>` element is at `relative z-20` (`wrapper/index.tsx:114`). Since the canvas is at z-0 and main is at z-20, the canvas is painted BEHIND all main content. The animated gradient (portalled via WebGLTunnel to the canvas) is invisible behind the content.
  - **SECONDARY ISSUE — Colors too subtle**: The gradient colors `['#0a0a08', '#0f0d0a', '#171410', '#0a0a08']` are nearly identical to the html background `#0a0a08`. Even if the z-index is fixed, the glow might still be too subtle.
  - **Debugging approach** (MUST follow this order):
    1. Launch dev server + `dev-browser`, navigate to `/`, take screenshot of hero to confirm glow is invisible
    2. Open DevTools, inspect the GlobalCanvas element (`.globalCanvas`). Verify: (a) it exists, (b) it's not `display: none` or `visibility: hidden` when `isActive` should be true, (c) the inner `<canvas>` has non-zero dimensions
    3. **Test z-index hypothesis**: Temporarily set `.globalCanvas` z-index to 15 (above content z-20 would be wrong since it'd cover text; between noiseWaves z-5 and content z-20 keeps it behind text but tests if it renders). Take screenshot. If glow appears → z-index confirmed as the issue.
    4. **If z-index IS the issue**: The fix is to change the architecture so the canvas acts as an overlay ABOVE content with `pointer-events: none` + alpha transparency (transparent canvas, only WebGL meshes visible). Change `global-canvas.module.css` z-index to be ABOVE main content (e.g., `z-index: var(--z-content)` or higher). The canvas already has `pointer-events: none` and the R3F canvas has `alpha: true`. OR alternatively, remove the `z-20` from `<main>` and use per-section z-indexing to keep text above canvas.
    5. **If z-index is NOT the issue**: Check opacity: 0 (per AGENTS.md debug rule), check if `useWebGLElement` reports `isVisible: false`, check if the `WebGLAnimatedGradient` mesh is actually rendering via R3F devtools. Check the shader output with brighter test colors.
    6. **If colors are too subtle**: After fixing z-index, test with brighter colors like `['#0a0a08', '#1a1510', '#2d261e', '#0a0a08']` or add a warm amber glow `['#0a0a08', '#1f1a10', '#3d2e18', '#0a0a08']`. Get user approval on the glow intensity.
  - **IMPORTANT**: This fix affects the ENTIRE WebGL pipeline, not just the hero. The project card WebGL image transitions (ProjectCardMedia) go through the same canvas. If you change the canvas z-index, verify that project card hover effects still work correctly.
  - **Z-index contract** (in `root.css:48-54`): `--z-canvas: 0`, `--z-noiseWaves: 5`, `--z-content: 20`, `--z-header: 50`. Any fix must respect this contract or update it consistently.

  **Must NOT do**:
  - Do NOT remove the AnimatedGradient component or replace it with a CSS gradient
  - Do NOT modify the WebGL shader or material logic
  - Do NOT change `pointer-events` on the canvas (it needs to stay `none`)
  - Do NOT change z-index values without updating the contract in `root.css` AND `z-index.ts`
  - Do NOT modify the R3F canvas alpha or renderer settings
  - Do NOT break the project card WebGL image transitions while fixing the hero

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Z-index stacking debugging requires inspecting DOM stacking contexts, testing hypotheses in dev-browser, understanding the WebGL tunnel architecture, and making a fix that doesn't break other WebGL elements. This is a diagnostic + fix task.
  - **Skills**: [`dev-browser`]
    - `dev-browser`: Essential for visual inspection — need to see the canvas, test z-index changes live, take screenshots as evidence
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Not a design task — this is a rendering/stacking bug

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Nothing (final verification will test this)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (the stacking chain to debug):
  - `lib/webgl/components/global-canvas/global-canvas.module.css:7` — `z-index: 0` on canvas. This is the element rendering WebGL content.
  - `components/layout/wrapper/index.tsx:114` — `<main className="relative z-20">`. This creates the stacking context that pushes content ABOVE the canvas.
  - `lib/styles/css/root.css:48-54` — Z-index CSS custom property contract: `--z-canvas: 0`, `--z-noiseWaves: 5`, `--z-content: 20`
  - `lib/styles/z-index.ts` — TypeScript z-index contract (must stay in sync with CSS)
  - `lib/styles/css/global.css:6` — `<html>` has `background-color: var(--color-primary)` = `#0a0a08`
  - `lib/styles/css/global.css:25` — `<body>` has `background: transparent`

  **API/Type References**:
  - `components/sections/hero/index.tsx:91-99` — AnimatedGradient props including `colors` array
  - `lib/webgl/hooks/use-webgl-element.ts:55-60` — Hook that tracks element visibility + rect for WebGL

  **External References**:
  - CSS stacking context spec: `position: relative` + any z-index creates a new stacking context. All children are painted within this context relative to the body.
  - AGENTS.md debugging rule: "When portalled elements are invisible despite correct opacity/display, check z-index stacking contexts"

  **WHY Each Reference Matters**:
  - `global-canvas.module.css:7`: This is THE z-index to potentially change — it controls where all WebGL renders in the page stack
  - `wrapper/index.tsx:114`: This is the competing z-index — `<main>` at z-20 pushes content above canvas at z-0
  - `root.css:48-54` + `z-index.ts`: Both must be updated together if the z-index contract changes
  - `hero/index.tsx:91-99`: The gradient colors might need brightening after the z-index fix

  **Acceptance Criteria**:

  - [ ] AnimatedGradient "glow" is visually visible in the hero section (screenshot evidence)
  - [ ] Project card WebGL image transitions still work after the fix
  - [ ] NoiseWaves overlay still renders correctly
  - [ ] Header still renders above everything
  - [ ] Z-index contract (`root.css` + `z-index.ts`) is consistent
  - [ ] `bun run check` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Hero glow is visible
    Tool: dev-browser
    Preconditions: Dev server running (`bun dev`)
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait 3 seconds for WebGL to initialize
      3. Take screenshot of hero section
      4. Assert: hero section shows a visible gradient glow effect — NOT just a flat dark background
      5. The glow should be a warm, animated gradient (distinct from the flat #0a0a08 background)
    Expected Result: Animated gradient glow visible in hero section
    Failure Indicators: Hero section appears as flat dark background with no glow/gradient
    Evidence: .sisyphus/evidence/task-2-hero-glow-visible.png

  Scenario: Project card images still render correctly
    Tool: dev-browser
    Preconditions: Dev server running, after z-index fix applied
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to projects section
      3. Find project card with actual image (e.g., "X Recommendation Algorithm")
      4. Assert: project card image is visible (not blank/transparent)
      5. Hover over the card — if it has hoverImageSrc, the WebGL transition should still work
      6. Take screenshot
    Expected Result: Project card images render correctly, hover transitions work
    Failure Indicators: Blank/transparent image areas, broken hover transitions
    Evidence: .sisyphus/evidence/task-2-project-cards-intact.png

  Scenario: Header and NoiseWaves render above the glow
    Tool: dev-browser
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert: header navigation is visible and clickable above the glow
      3. Assert: noise wave SVG lines are visible over the hero glow
    Expected Result: Proper z-ordering — header > noiseWaves > glow > body background
    Failure Indicators: Header hidden behind glow, or noise waves missing
    Evidence: .sisyphus/evidence/task-2-stacking-order.png
  ```

  **Commit**: YES
  - Message: `fix(hero): resolve glow z-index stacking so AnimatedGradient is visible`
  - Files: `lib/webgl/components/global-canvas/global-canvas.module.css`, `lib/styles/css/root.css`, `lib/styles/z-index.ts` (whichever needs changing)
  - Pre-commit: `bun run check`

- [x] 3. Create useVideoAutoplay Hook with IntersectionObserver + Tests

  **What to do**:
  - Create `components/effects/video-autoplay/use-video-autoplay.ts`
  - Implement a custom hook `useVideoAutoplay` that:
    - Takes a `videoRef: RefObject<HTMLVideoElement>` parameter
    - Uses `IntersectionObserver` with `threshold: 0.3` and `rootMargin: '200px'` to detect when video enters/leaves viewport
    - Calls `videoRef.current.play()` when intersecting (with `.catch(() => {})` for browser rejections)
    - Calls `videoRef.current.pause()` when not intersecting
    - Integrates `useDocumentVisibility` from `@/hooks/use-sync-external` — pauses video when tab hidden, resumes when tab visible AND video is in viewport
    - Tracks intersection state in a ref so tab-visibility changes know whether to resume
    - Cleans up observer on unmount
    - Uses `useRef` for the observer instance (React Compiler compatible)
  - Create `components/effects/video-autoplay/use-video-autoplay.test.ts`
    - Test: observer calls play when intersecting
    - Test: observer calls pause when not intersecting
    - Test: pause called when visibility becomes 'hidden'
    - Test: play called when visibility becomes 'visible' AND is intersecting
    - Test: cleanup disconnects observer
    - Mock IntersectionObserver and video element play/pause

  **Must NOT do**:
  - Do NOT use `useMemo` or `useCallback` (React Compiler)
  - Do NOT create a global video manager or context
  - Do NOT use `any` type — use proper typing for IntersectionObserverEntry
  - Do NOT add external dependencies — use native IntersectionObserver API
  - Do NOT use relative imports — use `@/hooks/use-sync-external` path alias

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single hook file + test file, well-defined behavior, follows existing patterns
  - **Skills**: []
    - No specialized skills needed
  - **Skills Evaluated but Omitted**:
    - `vercel-react-best-practices`: Hook pattern is straightforward, no React optimization concerns

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 5 (VideoAutoplay component depends on this hook)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `lib/hooks/use-sync-external.ts:212-218` — `useDocumentVisibility` hook. Import this to pause videos on tab hidden. Uses `useSyncExternalStore` — concurrent-rendering safe.
  - `components/effects/project-card-media/index.tsx:67` — `useWebGLElement` hook call. This hook already uses IntersectionObserver with the Lenis smooth scroll setup — follow its observer configuration pattern.

  **API/Type References**:
  - `lib/hooks/use-sync-external.ts:212` — `useDocumentVisibility(): DocumentVisibilityState` returns `'visible' | 'hidden'`

  **Test References** (testing patterns to follow):
  - `components/effects/project-card-media/project-card-media.test.ts` — Existing test file in the same `effects/` directory. Follow its test structure, import patterns, and mock strategies.

  **External References**:
  - IntersectionObserver API: `new IntersectionObserver(callback, { threshold: 0.3, rootMargin: '200px' })`. Entries have `isIntersecting` boolean.
  - `HTMLVideoElement.play()` returns a Promise — must `.catch(() => {})` for browser autoplay rejections.

  **WHY Each Reference Matters**:
  - `use-sync-external.ts:212-218`: This is the hook to import for tab visibility. Don't re-implement visibility detection.
  - `project-card-media/index.tsx:67`: Shows how `useWebGLElement` wires up IntersectionObserver in this codebase — follow the ref pattern and cleanup approach.
  - `project-card-media.test.ts`: Shows how tests are structured in this project — follow naming, mocking, assertion style.

  **Acceptance Criteria**:

  - [ ] Hook file exists at `components/effects/video-autoplay/use-video-autoplay.ts`
  - [ ] Hook uses IntersectionObserver with threshold 0.3
  - [ ] Hook calls play() on intersect, pause() on leave
  - [ ] Hook integrates useDocumentVisibility for tab pausing
  - [ ] Test file exists with 5+ test cases covering play/pause/visibility/cleanup
  - [ ] `bun test` passes for this file
  - [ ] `bun run check` passes
  - [ ] No `any` types, no `useMemo`/`useCallback`

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Hook unit tests pass
    Tool: Bash
    Preconditions: Hook and test file created
    Steps:
      1. Run: bun test components/effects/video-autoplay/use-video-autoplay.test.ts
      2. Assert: all tests pass (0 failures)
      3. Assert: test count >= 5
    Expected Result: All unit tests pass
    Failure Indicators: Any test failure or fewer than 5 tests
    Evidence: .sisyphus/evidence/task-2-hook-tests.txt

  Scenario: Hook has no type errors
    Tool: Bash
    Preconditions: Hook file created
    Steps:
      1. Run: bunx tsgo --noEmit
      2. Assert: no errors related to video-autoplay files
    Expected Result: Zero type errors
    Failure Indicators: Type errors in use-video-autoplay.ts
    Evidence: .sisyphus/evidence/task-2-typecheck.txt
  ```

  **Commit**: YES
  - Message: `feat(effects): add useVideoAutoplay hook with IntersectionObserver`
  - Files: `components/effects/video-autoplay/use-video-autoplay.ts`, `components/effects/video-autoplay/use-video-autoplay.test.ts`
  - Pre-commit: `bun run check`

- [x] 4. Add videoSrc to Project Data Model + Create Placeholder Video

  **What to do**:
  - In `components/sections/projects/index.tsx`, add `videoSrc?: string` to the `ProjectCard` interface (line 8-16)
  - Add `videoSrc` entries to `fallbackProjects` array for projects that have video demos. Use paths like `/project-videos/{project-id}.mp4`. Add to at least 2 projects initially (e.g., `x-recommendation-algo` and `stocktwits-clone-2` since these already have real images, suggesting more mature projects)
  - In the `mapProjects` function (line 122-146), pass through `videoSrc` from fallback data to mapped results. The Sanity `Project` interface does NOT need changes — `videoSrc` is fallback-only for now
  - Create `public/project-videos/` directory
  - Create a minimal placeholder test video (or add a comment/README explaining the user needs to add their actual video files here)

  **Must NOT do**:
  - Do NOT modify the Sanity `Project` interface in `lib/integrations/sanity/fetch.ts`
  - Do NOT add video fields to Sanity queries
  - Do NOT rename or restructure existing fields
  - Do NOT add videoSrc to ALL projects — only ones that will actually have videos

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Data model addition + directory creation, ~15 lines changed
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - None relevant

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 6 (integration needs videoSrc in data)
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `components/sections/projects/index.tsx:8-16` — `ProjectCard` interface. Add `videoSrc?: string` here.
  - `components/sections/projects/index.tsx:27-110` — `fallbackProjects` array. Add `videoSrc` field to 2-3 entries.
  - `components/sections/projects/index.tsx:122-146` — `mapProjects` function. Pass `videoSrc` through.

  **API/Type References**:
  - `lib/integrations/sanity/fetch.ts:17-27` — Sanity `Project` interface. Do NOT modify this.

  **WHY Each Reference Matters**:
  - `projects/index.tsx:8-16`: This is where the new field goes — keep it optional with `?`
  - `projects/index.tsx:27-110`: Need to add actual `videoSrc` paths to projects that have demos
  - `projects/index.tsx:122-146`: `mapProjects` needs to carry `videoSrc` from fallback to result

  **Acceptance Criteria**:

  - [ ] `ProjectCard` interface has `videoSrc?: string`
  - [ ] At least 2 fallback projects have `videoSrc` paths
  - [ ] `mapProjects` passes `videoSrc` through to results
  - [ ] `public/project-videos/` directory exists
  - [ ] Sanity `Project` interface is NOT modified
  - [ ] `bun run check` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Data model includes videoSrc
    Tool: Bash (grep)
    Preconditions: Changes applied
    Steps:
      1. Search `components/sections/projects/index.tsx` for `videoSrc`
      2. Assert: `videoSrc` appears in ProjectCard interface as optional string
      3. Assert: `videoSrc` appears in at least 2 entries in fallbackProjects
      4. Assert: `videoSrc` appears in mapProjects function
    Expected Result: videoSrc field present in interface, data, and mapping
    Failure Indicators: Missing from any of the three locations
    Evidence: .sisyphus/evidence/task-3-data-model.txt

  Scenario: Sanity interface unchanged
    Tool: Bash (grep)
    Preconditions: Changes applied
    Steps:
      1. Search `lib/integrations/sanity/fetch.ts` for `videoSrc`
      2. Assert: no matches found — Sanity Project interface was NOT modified
    Expected Result: Zero matches for videoSrc in Sanity fetch file
    Failure Indicators: videoSrc found in Sanity types
    Evidence: .sisyphus/evidence/task-3-sanity-unchanged.txt
  ```

  **Commit**: YES (groups with Task 5)
  - Message: `feat(projects): add videoSrc to project data model`
  - Files: `components/sections/projects/index.tsx`
  - Pre-commit: `bun run check`

- [x] 5. Create VideoAutoplay Component + CSS Module

  **What to do**:
  - Create `components/effects/video-autoplay/index.tsx`
  - Create `components/effects/video-autoplay/video-autoplay.module.css`
  - Component takes props: `{ src: string; poster?: string; className?: string }`
  - Renders a `<video>` element with attributes: `muted`, `playsInline`, `loop`, `preload="none"`
  - Uses the `useVideoAutoplay` hook from Task 2 for play/pause logic
  - Uses `useDocumentVisibility` for tab-hidden pausing
  - On video error event, hide the video element (set display none or opacity 0) — fail silently
  - CSS Module: `.video` class with `width: 100%`, `height: 100%`, `object-fit: cover`, `display: block`
  - Follow component conventions: named function declaration, `import s from './video-autoplay.module.css'`, `cn()` for className composition

  **Must NOT do**:
  - Do NOT add video controls or UI chrome
  - Do NOT use inline styles for sizing — CSS Modules only
  - Do NOT use `any` type
  - Do NOT use `useMemo`/`useCallback`/`React.memo`
  - Do NOT make this a generic `<Video>` component in `ui/` — it's an effect component in `effects/`
  - Do NOT add loading states, spinners, or shimmer effects

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Component with hook integration, error handling, CSS module — moderate complexity
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `vercel-react-best-practices`: Component is simple, no complex rendering patterns
    - `frontend-ui-ux`: No design decisions needed — it's a video element with object-fit cover

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 3)
  - **Parallel Group**: Wave 2 (solo)
  - **Blocks**: Task 6 (integration uses this component)
  - **Blocked By**: Task 3 (needs useVideoAutoplay hook)

  **References**:

  **Pattern References**:
  - `components/effects/project-card-media/index.tsx` — Follow the same component structure: 'use client' directive, dynamic imports if needed, CSS Module imported as `s`, props interface, named function export. This is the sibling component pattern.
  - `components/effects/project-card-media/index.tsx:62-112` — How `ProjectCardMedia` handles error states via `renderState`. Follow a simpler version: just hide on error.

  **API/Type References**:
  - `components/effects/video-autoplay/use-video-autoplay.ts` (from Task 2) — The hook to import and use.
  - `lib/hooks/use-sync-external.ts:212` — `useDocumentVisibility` for tab visibility.

  **External References**:
  - HTML `<video>` attributes: `muted`, `playsInline` (React camelCase), `loop`, `preload="none"`, `poster`
  - `<video>` `onError` event for error handling

  **WHY Each Reference Matters**:
  - `project-card-media/index.tsx`: This is the component being REPLACED (conditionally) — follow its file structure and export pattern exactly
  - `use-video-autoplay.ts`: The core logic hook — component just renders `<video>` and wires up the hook

  **Acceptance Criteria**:

  - [ ] Component file at `components/effects/video-autoplay/index.tsx`
  - [ ] CSS Module at `components/effects/video-autoplay/video-autoplay.module.css`
  - [ ] `<video>` has `muted`, `playsInline`, `loop`, `preload="none"` attributes
  - [ ] `poster` prop passed to `<video poster={poster}>`
  - [ ] Error handling: video hides on error event
  - [ ] No inline styles for sizing
  - [ ] `bun run check` passes

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: VideoAutoplay component renders correct video element
    Tool: dev-browser
    Preconditions: Dev server running, component integrated into a test page or storybook
    Steps:
      1. Navigate to page containing VideoAutoplay component
      2. Inspect the video element in DOM
      3. Assert: video element has attribute `muted`
      4. Assert: video element has attribute `playsinline` (lowercase in DOM)
      5. Assert: video element has attribute `loop`
      6. Assert: video element has `preload="none"`
    Expected Result: All required attributes present on video element
    Failure Indicators: Missing any of the 4 required attributes
    Evidence: .sisyphus/evidence/task-4-video-attributes.png

  Scenario: Video handles load error gracefully
    Tool: dev-browser
    Preconditions: Dev server running, component given a non-existent src like "/nonexistent.mp4"
    Steps:
      1. Navigate to page with VideoAutoplay src="/nonexistent.mp4"
      2. Wait 3 seconds for error to fire
      3. Assert: no error modal, no console errors visible to user, video element is hidden or invisible
    Expected Result: Silent failure, no visible error to user
    Failure Indicators: Error modal, visible broken element, or crash
    Evidence: .sisyphus/evidence/task-4-error-handling.png
  ```

  **Commit**: YES
  - Message: `feat(effects): add VideoAutoplay component with CSS module`
  - Files: `components/effects/video-autoplay/index.tsx`, `components/effects/video-autoplay/video-autoplay.module.css`
  - Pre-commit: `bun run check`

- [x] 6. Integrate Video Autoplay into Project Cards

  **What to do**:
  - In `components/sections/projects/index.tsx`, modify the project card rendering (lines 156-196) to conditionally render:
    - If `project.videoSrc` exists: render `<VideoAutoplay>` component in place of `<ProjectCardMedia>`
    - If no `videoSrc`: keep the existing `<ProjectCardMedia>` + background-image setup unchanged
  - Import `VideoAutoplay` from `@/components/effects/video-autoplay`
  - Pass `poster={project.imageSrc}` to VideoAutoplay so there's a thumbnail while video loads
  - Keep the `.gradientLayer` div rendered for BOTH video and image projects (visual consistency)
  - The VideoAutoplay component should fill the `.imageArea` div (same positioning as `.imageEffect`)
  - Ensure the `.imageArea` aspect-ratio 16:9 container still works with video (VideoAutoplay CSS handles `object-fit: cover`)

  **Must NOT do**:
  - Do NOT modify `ProjectCardMedia` component
  - Do NOT modify the `.content` div (title, description, tags)
  - Do NOT change the grid layout or card styling
  - Do NOT add new CSS classes to `projects.module.css` unless absolutely necessary for video positioning
  - Do NOT remove the gradient overlay for video cards
  - Do NOT modify the `ProjectsGrid` or `ProjectsHeading` components

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Integration task requiring conditional rendering, multiple component composition, and visual verification
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `vercel-react-best-practices`: No performance patterns — straightforward conditional rendering
    - `frontend-ui-ux`: No design decisions — video fills existing image area

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 4 and 5)
  - **Parallel Group**: Wave 3 (solo)
  - **Blocks**: Final verification (F1-F4)
  - **Blocked By**: Task 4 (data model with videoSrc), Task 5 (VideoAutoplay component)

  **References**:

  **Pattern References**:
  - `components/sections/projects/index.tsx:156-196` — Current project card rendering loop. The conditional goes inside the `.imageArea` div (line 162-179).
  - `components/sections/projects/index.tsx:162-179` — The `.imageArea` div containing `ProjectCardMedia` + `.gradientLayer`. VideoAutoplay replaces `ProjectCardMedia` here, `.gradientLayer` stays.
  - `components/sections/projects/projects.module.css:56-68` — `.imageArea` CSS: `aspect-ratio: 16/9`, `isolation: isolate`, `position: relative`. VideoAutoplay must be `position: absolute; inset: 0` to fill this (same as `.imageEffect`).

  **API/Type References**:
  - `components/effects/video-autoplay/index.tsx` (from Task 4) — Import `VideoAutoplay`, pass `src`, `poster`, `className`.
  - `components/sections/projects/index.tsx:8-16` — `ProjectCard` interface with `videoSrc?: string` (from Task 3).

  **WHY Each Reference Matters**:
  - `projects/index.tsx:162-179`: This is the exact JSX block to modify — add conditional: if videoSrc, render VideoAutoplay; else render ProjectCardMedia
  - `projects.module.css:56-68`: VideoAutoplay needs to fill this container identically to how `.imageEffect` fills it
  - `projects.module.css:63-68`: `.imageEffect` uses `position: absolute; inset: 0; width: 100%; height: 100%` — VideoAutoplay needs the same positioning

  **Acceptance Criteria**:

  - [ ] Projects with `videoSrc` render `<VideoAutoplay>` instead of `<ProjectCardMedia>`
  - [ ] Projects without `videoSrc` render `<ProjectCardMedia>` (unchanged behavior)
  - [ ] Gradient overlay (`.gradientLayer`) renders for both video and image projects
  - [ ] Video fills the `.imageArea` container with correct aspect ratio
  - [ ] `poster={project.imageSrc}` passed to VideoAutoplay
  - [ ] `bun run check` passes
  - [ ] `bun run build` passes (production build)

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Video project card renders video element with correct attributes
    Tool: dev-browser
    Preconditions: Dev server running, at least 1 project has videoSrc in fallback data
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to projects section ([data-testid="projects-section"])
      3. Find a project card with [data-project-id] matching a project with videoSrc
      4. Assert: card contains a <video> element
      5. Assert: video element has attributes: muted, playsinline, loop
      6. Assert: video element has poster attribute with a valid image path
      7. Assert: gradient overlay div exists over the video (`.gradientLayer` sibling)
      8. Capture screenshot
    Expected Result: Video element visible in project card with all required attributes
    Failure Indicators: No video element, missing attributes, or missing gradient overlay
    Evidence: .sisyphus/evidence/task-5-video-card-rendered.png

  Scenario: Image-only project card unchanged
    Tool: dev-browser
    Preconditions: Dev server running, at least 1 project has NO videoSrc
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to projects section
      3. Find a project card WITHOUT videoSrc (e.g., "Viet Bike Scout")
      4. Assert: card does NOT contain a <video> element
      5. Assert: card contains the WebGL canvas or background-image (existing behavior)
      6. Capture screenshot
    Expected Result: Image-only projects render as before with WebGL effect
    Failure Indicators: Video element present in image-only project, or WebGL effect missing
    Evidence: .sisyphus/evidence/task-5-image-card-unchanged.png

  Scenario: Video plays on scroll-in, pauses on scroll-out
    Tool: dev-browser
    Preconditions: Dev server running, project with videoSrc and an actual video file in public/project-videos/
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll PAST the projects section so video cards are fully out of viewport
      3. Slowly scroll back UP until a video card enters viewport (~30% visible)
      4. Wait 1 second
      5. Assert: video element's `paused` property is `false` (playing)
      6. Scroll down past the card so it leaves viewport
      7. Wait 500ms
      8. Assert: video element's `paused` property is `true` (paused)
    Expected Result: Video autoplays when scrolled into view, pauses when scrolled out
    Failure Indicators: Video never plays, or continues playing when out of view
    Evidence: .sisyphus/evidence/task-5-scroll-play-pause.png
  ```

  **Commit**: YES
  - Message: `feat(projects): integrate video autoplay into project cards`
  - Files: `components/sections/projects/index.tsx`
  - Pre-commit: `bun run check`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, check DOM attributes). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in `.sisyphus/evidence/`. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `bun run check` (biome + tsgo + bun test). Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify CSS Modules used (no inline styles). Verify `import type` for type-only imports.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` + `dev-browser` skill
  Start dev server. Navigate to `/`. Verify hero shows Japanese text initially, transitions to "Edward Tran". Scroll to projects section. Verify video elements exist with correct attributes. Verify video plays on scroll-in, pauses on scroll-out. Test with DevTools mobile emulation. Screenshot evidence for each. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read spec, read actual diff. Verify 1:1 compliance. Check "Must NOT do" items. Verify no modifications to `ProjectCardMedia`, `webgl.tsx`, or any WebGL components. Verify no Sanity schema changes. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| # | Message | Files | Pre-commit |
|---|---------|-------|------------|
| 1 | `feat(hero): render katakana as initial name text with scramble decode` | `components/sections/hero/index.tsx` | `bun run check` |
| 2 | `fix(hero): resolve glow z-index stacking so AnimatedGradient is visible` | `global-canvas.module.css`, `root.css`, `z-index.ts` | `bun run check` |
| 3 | `feat(effects): add useVideoAutoplay hook with IntersectionObserver` | `components/effects/video-autoplay/use-video-autoplay.ts`, test file | `bun run check` |
| 4 | `feat(effects): add VideoAutoplay component with CSS module` | `components/effects/video-autoplay/index.tsx`, `.module.css` | `bun run check` |
| 5 | `feat(projects): integrate video autoplay into project cards` | `components/sections/projects/index.tsx`, data model changes | `bun run check` |

---

## Success Criteria

### Verification Commands
```bash
bun run check      # Expected: biome ✅, types ✅, tests ✅
bun run build      # Expected: production build succeeds
```

### Final Checklist
- [ ] Hero glow (AnimatedGradient) is visually visible in hero section
- [ ] Hero shows "エドワード・トラン" on initial render
- [ ] Hero animates to "Edward Tran" via ScrambleTextPlugin
- [ ] sr-only span always says "Edward Tran" (accessibility)
- [ ] prefers-reduced-motion shows "Edward Tran" immediately
- [ ] Projects with videoSrc show auto-playing muted looping video
- [ ] Projects without videoSrc retain WebGL image behavior
- [ ] Videos pause on scroll-out and tab-hidden
- [ ] Videos resume on scroll-in and tab-visible
- [ ] No video controls, spinners, or loading UI visible
- [ ] No modifications to ProjectCardMedia or WebGL components
- [ ] bun run check passes
- [ ] bun run build succeeds
