# WebGL ImageTransition on Project Cards

## TL;DR

> **Quick Summary**: Wire up the existing `ImageTransition` WebGL displacement shader component onto project cards, replacing the current CSS `background-image` workaround. Fix the opaque section background that blocks the WebGL canvas.
> 
> **Deliverables**:
> - Project cards display images via WebGL displacement shader
> - Liquid distortion hover effect on project card images
> - Second images (x-rec2, stolk2) wired for hover transition where available
> - CSS fallback for non-WebGL devices
> 
> **Estimated Effort**: Short (1-2 hours implementation)
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Task 1 + Task 2 (parallel) → Task 3 → Task 4 (QA)

---

## Context

### Original Request
User wants the liquid distortion hover effect on project cards — images morph/ripple when hovered using a WebGL displacement shader. The `ImageTransition` component already exists in the codebase but isn't wired up properly.

### Interview Summary
**Key Discussions**:
- **Renderer fix**: User chose `forceWebGL={true}` (quick fix) over TSL NodeMaterial rewrite. Metis confirmed `forceWebGL` is **already set** in `lib/features/index.tsx:58`.
- **Visibility**: Projects section has opaque `background-color: var(--color-primary)` that blocks the WebGL canvas beneath. Fix: make it transparent — body bg is already the same dark color.
- **GIF/video support**: Nice-to-have, explicitly OUT OF SCOPE for this plan.

**Research Findings**:
- GlobalCanvas renders at `position: fixed; inset: 0; z-index: 0` with `alpha: true`
- Main content wrapper at `z-index: 20` creates stacking context above canvas
- Hero section works because it's transparent — WebGL gradient shows through
- `ImageTransition` already handles hover state internally (`onPointerEnter`/`onPointerLeave`)
- `useWebGLRect` maps DOM bounding rects to WebGL world-space coordinates on every scroll frame
- `TextureLoader` supports SVG data URLs (2 of 4 projects use synthetic gradient images)
- Projects section is a **server component** — `ImageTransition` is a client component that can be imported directly (Next.js client component boundary pattern)

### Metis Review
**Identified Gaps** (addressed):
- `forceWebGL` already set — removed redundant task
- Server/client boundary: `ImageTransition` is already `'use client'`, can be used directly in server component JSX
- Second images exist (`X-REC2.png`, `stolk2.png`) — wired up in data model
- Card CSS `translateY(-6px)` on hover may slightly desync from WebGL mesh position — accepted as minor cosmetic trade-off on dark backgrounds
- `.content` area has its own opaque background — preserves text readability when section bg removed
- SVG data URL textures for gradient-only projects — needs runtime verification

---

## Work Objectives

### Core Objective
Replace the CSS `background-image` workaround with the `ImageTransition` WebGL component on project cards, enabling the liquid distortion hover effect.

### Concrete Deliverables
- `projects.module.css`: Section background transparent
- `projects/index.tsx`: `ImageTransition` component on each card image area
- Project data includes `hoverImageSrc` for projects with second images

### Definition of Done
- [ ] `bun run build` exits 0
- [ ] `bun run check` exits 0 (biome + types + tests)
- [ ] Project cards show images via WebGL displacement mesh
- [ ] Hovering a card triggers liquid distortion transition
- [ ] Cards with second images (x-rec, stolk) transition between two images on hover
- [ ] Cards without second images (viet-bike-scout, autoresearch) show distortion without image swap
- [ ] Non-WebGL devices see CSS background-image fallback

### Must Have
- WebGL displacement shader renders on all 4 project cards
- Hover triggers GSAP-animated progress tween (1.2s, power2.inOut)
- CSS fallback via `style` prop when `isWebGL` is false
- Proper texture cleanup on unmount (already handled in `webgl.tsx`)

### Must NOT Have (Guardrails)
- DO NOT modify `ImageTransition`, `WebGLImageTransition`, or `ImageTransitionMaterial` — they work as designed for WebGL
- DO NOT modify `GlobalCanvas`, `create-renderer.ts`, or the WebGL pipeline — `forceWebGL` is already set
- DO NOT make other sections transparent — ONLY the projects section
- DO NOT touch the `.content` background — text readability depends on it
- DO NOT add rounded corner clipping to the shader — rectangular mesh vs 12px border-radius is cosmetically minor on dark backgrounds
- DO NOT synchronize CSS hover `translateY(-6px)` with WebGL mesh position — they operate on different layers
- DO NOT add performance optimizations (LOD, culling, atlasing) — 4 textured quads is trivial
- DO NOT modify the tunnel or WebGL store architecture
- DO NOT add GIF/video texture support (explicit out-of-scope)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (bun test)
- **Automated tests**: None for this feature (visual WebGL output not unit-testable)
- **Framework**: bun test (existing, not used for this feature)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **Build verification**: Use Bash — `bun run build`, `bun run check`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — independent changes):
├── Task 1: Make projects section background transparent [quick]
├── Task 2: Add hoverImageSrc to project card data model [quick]

Wave 2 (After Wave 1 — integration):
├── Task 3: Wire ImageTransition into project cards [unspecified-high]

Wave 3 (After Wave 2 — verification):
├── Task 4: Visual QA via Playwright [unspecified-high]

Wave FINAL (After ALL — review):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality + build check [unspecified-high]
├── Task F3: Visual QA of all scenarios [unspecified-high]
├── Task F4: Scope fidelity check [deep]

Critical Path: Task 1 + 2 (parallel) → Task 3 → Task 4 → F1-F4
Parallel Speedup: Wave 1 runs 2 tasks in parallel
Max Concurrent: 2 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1    | —         | 3      |
| 2    | —         | 3      |
| 3    | 1, 2      | 4      |
| 4    | 3         | F1-F4  |
| F1-F4| 4         | —      |

### Agent Dispatch Summary

- **Wave 1**: **2** — T1 → `quick`, T2 → `quick`
- **Wave 2**: **1** — T3 → `unspecified-high`
- **Wave 3**: **1** — T4 → `unspecified-high` + `dev-browser` skill
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` + `dev-browser`, F4 → `deep`

---

## TODOs

- [x] 1. Make projects section background transparent

  **What to do**:
  - In `components/sections/projects/projects.module.css`, change `.section` `background-color: var(--color-primary)` to `background-color: transparent`
  - That's it. One line change.

  **Must NOT do**:
  - DO NOT touch `.content` background (`color-mix(in srgb, var(--color-primary), white 6%)`) — text readability depends on it
  - DO NOT change any other section's background
  - DO NOT modify `.card`, `.imageArea`, or `.imageEffect` classes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single CSS property change in one file
  - **Skills**: []
    - No special skills needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/sections/projects/projects.module.css:1-4` — The `.section` rule with `background-color: var(--color-primary)` to change
  - `components/sections/hero/hero.module.css` — Hero section has NO background-color, which is why WebGL shows through it. Projects section should follow the same pattern.

  **Why Each Reference Matters**:
  - The CSS file is the only file to edit. The hero section is the proof that removing background makes WebGL visible.
  - `lib/styles/css/global.css` — Body already has `background-color: var(--color-primary)`, so removing the section bg causes zero visual change (dark body shows through).

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Section background is transparent
    Tool: Bash
    Preconditions: File saved
    Steps:
      1. Run: grep 'background-color' components/sections/projects/projects.module.css
      2. Assert: output contains 'transparent', does NOT contain 'var(--color-primary)' for .section
    Expected Result: Only `.content` has a non-transparent background-color
    Failure Indicators: .section still has var(--color-primary)
    Evidence: .sisyphus/evidence/task-1-css-grep.txt

  Scenario: Build succeeds after CSS change
    Tool: Bash
    Preconditions: CSS change applied
    Steps:
      1. Run: bun run build
      2. Assert: exit code 0
    Expected Result: Clean build with no errors
    Failure Indicators: Build failure or CSS parsing error
    Evidence: .sisyphus/evidence/task-1-build.txt
  ```

  **Commit**: YES (groups with Task 2)
  - Message: `feat(projects): prepare transparent bg and hover image data for WebGL`
  - Files: `components/sections/projects/projects.module.css`
  - Pre-commit: `bun run check`

- [x] 2. Add hoverImageSrc to project card data model

  **What to do**:
  - Add `hoverImageSrc?: string` to the `ProjectCard` interface
  - Add `hoverImageSrc` values to the `fallbackProjects` array:
    - `x-recommendation-algo`: `'/project-pic/x-rec/X-REC2.png'`
    - `stocktwits-clone-2`: `'/project-pic/stolk/stolk2.png'`
    - `viet-bike-scout`: no hoverImageSrc (undefined — will trigger `sameImage` mode)
    - `autoresearch-macos`: no hoverImageSrc (undefined — will trigger `sameImage` mode)
  - Wire `hoverImageSrc` through `mapProjects` function (from Sanity data or fallback)

  **Must NOT do**:
  - DO NOT change the existing `imageSrc` values
  - DO NOT add new imports or components yet (that's Task 3)
  - DO NOT modify the JSX/render output

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Data model additions to a single file, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Task 3
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `components/sections/projects/index.tsx:7-14` — `ProjectCard` interface to extend with `hoverImageSrc?: string`
  - `components/sections/projects/index.tsx:25-66` — `fallbackProjects` array to add hoverImageSrc to entries with second images
  - `components/sections/projects/index.tsx:78-96` — `mapProjects` function to wire hoverImageSrc through

  **API/Type References**:
  - `components/effects/image-transition/webgl.tsx:24-30` — `WebGLImageTransitionProps` expects `hoverImageSrc?: string`. This is the contract the data model must satisfy.

  **External References**:
  - `public/project-pic/x-rec/X-REC2.png` — Second image for X Recommendation (note: capital X-REC2)
  - `public/project-pic/stolk/stolk2.png` — Second image for StockTwits

  **Why Each Reference Matters**:
  - The `ProjectCard` interface defines what data flows to each card. Adding `hoverImageSrc` here makes it available for Task 3.
  - The `mapProjects` function maps Sanity data → ProjectCard. It needs to pass through `hoverImageSrc` from either Sanity or fallback.
  - The file paths in `/public/` are the actual hover images to reference. Case sensitivity matters (`X-REC2.png` not `x-rec2.png`).

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: TypeScript compiles with new field
    Tool: Bash
    Preconditions: Interface and data updated
    Steps:
      1. Run: bun run typecheck
      2. Assert: exit code 0
    Expected Result: No type errors
    Failure Indicators: Type error on ProjectCard or mapProjects
    Evidence: .sisyphus/evidence/task-2-typecheck.txt

  Scenario: Hover image files exist
    Tool: Bash
    Preconditions: None
    Steps:
      1. Run: ls -la public/project-pic/x-rec/X-REC2.png public/project-pic/stolk/stolk2.png
      2. Assert: both files exist and have non-zero size
    Expected Result: Both files present
    Failure Indicators: No such file or directory
    Evidence: .sisyphus/evidence/task-2-files-exist.txt

  Scenario: Data model includes hoverImageSrc
    Tool: Bash (grep)
    Preconditions: Code updated
    Steps:
      1. Run: grep -n 'hoverImageSrc' components/sections/projects/index.tsx
      2. Assert: appears in interface, at least 2 fallback entries, and mapProjects
    Expected Result: hoverImageSrc wired through data pipeline
    Failure Indicators: Missing from interface, data, or mapping function
    Evidence: .sisyphus/evidence/task-2-data-model.txt
  ```

  **Commit**: YES (groups with Task 1)
  - Message: `feat(projects): prepare transparent bg and hover image data for WebGL`
  - Files: `components/sections/projects/index.tsx`
  - Pre-commit: `bun run check`

- [x] 3. Wire ImageTransition into project cards

  **What to do**:
  - Import `ImageTransition` from `@/components/effects/image-transition`
  - Replace the `.imageEffect` div (lines 113-121) with an `<ImageTransition>` component:
    ```tsx
    <ImageTransition
      className={s.imageEffect}
      style={{
        background: project.gradient,
        backgroundImage: `url(${project.imageSrc})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
      imageSrc={project.imageSrc}
      hoverImageSrc={project.hoverImageSrc}
    />
    ```
  - The `style` prop serves as the CSS fallback when `isWebGL` is false (the `ImageTransition` component replaces it with `{ background: 'transparent' }` when WebGL is active)
  - The `className={s.imageEffect}` ensures the component fills the `.imageArea` container (position absolute, inset 0)

  **Must NOT do**:
  - DO NOT modify `ImageTransition`, `WebGLImageTransition`, or `ImageTransitionMaterial` components
  - DO NOT add `'use client'` to `projects/index.tsx` — `ImageTransition` is already a client component and can be used directly in server component JSX (Next.js client component boundary)
  - DO NOT remove the `.imageArea` wrapper div — it provides the aspect-ratio container
  - DO NOT remove the `aria-hidden="true"` from `.imageArea`
  - DO NOT modify `projects-grid.tsx` or the GSAP stagger animation

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires understanding of WebGL tunnel architecture + server/client component boundary. One file change but needs careful integration.
  - **Skills**: []
    - No special skills needed — the WebGL components are already built

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Task 4
  - **Blocked By**: Task 1 (transparent bg), Task 2 (hoverImageSrc data)

  **References**:

  **Pattern References**:
  - `components/effects/image-transition/index.tsx:57-85` — The `ImageTransition` component API. Takes `className`, `style`, `imageSrc`, `hoverImageSrc`. Handles hover state internally. Sets `background: 'transparent'` when WebGL active.
  - `components/effects/image-transition/webgl.tsx:70-76` — `WebGLImageTransition` props contract. `imageSrc` and `hoverImageSrc` are passed through from the DOM wrapper.

  **API/Type References**:
  - `components/effects/image-transition/index.tsx:49-55` — `ImageTransitionProps` type: `{ className?, style?, imageSrc, hoverImageSrc? }` plus everything from `WebGLImageTransition` minus `hovered`, `rect`, `visible`

  **Integration References**:
  - `components/sections/projects/index.tsx:112-121` — Current `.imageEffect` div to REPLACE (not the `.imageArea` wrapper — keep that)
  - `components/sections/projects/projects.module.css:67-72` — `.imageEffect` class: `position: absolute; inset: 0; width: 100%; height: 100%`. This class is passed as `className` to `ImageTransition`.

  **Architecture References**:
  - `lib/webgl/hooks/use-webgl-element.ts` — Tracks the `ImageTransition` div's bounding rect + intersection. The `.imageArea` parent provides the aspect-ratio constraint.
  - `lib/webgl/hooks/use-webgl-rect.ts` — Maps DOM rect to WebGL world-space coordinates. The WebGL mesh renders on the GlobalCanvas at the exact screen position of the DOM element.
  - `lib/features/index.tsx:58` — `<LazyGlobalCanvas forceWebGL />` — confirms WebGL renderer is active (not WebGPU). ShaderMaterial will work.

  **Why Each Reference Matters**:
  - The `ImageTransition` API shows exactly what props to pass — match the component contract
  - The current `.imageEffect` div shows what to replace — the new component must occupy the same DOM position and CSS space
  - The architecture refs explain WHY this works: `useWebGLElement` tracks the div → `useWebGLRect` positions the mesh → mesh renders on GlobalCanvas at same screen position → transparent div lets canvas show through

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Build succeeds with ImageTransition wired up
    Tool: Bash
    Preconditions: Tasks 1 and 2 complete
    Steps:
      1. Run: bun run check
      2. Assert: exit code 0
    Expected Result: Biome lint + typecheck + tests all pass
    Failure Indicators: Import errors, type mismatches, unsorted classes
    Evidence: .sisyphus/evidence/task-3-check.txt

  Scenario: ImageTransition is imported and used
    Tool: Bash (grep)
    Preconditions: Code updated
    Steps:
      1. Run: grep -n 'ImageTransition' components/sections/projects/index.tsx
      2. Assert: import line present + at least one JSX usage
      3. Run: grep -n 'imageEffect' components/sections/projects/index.tsx
      4. Assert: no plain div with backgroundImage inline style remains
    Expected Result: ImageTransition replaces old div
    Failure Indicators: Old div still present, or ImageTransition not imported
    Evidence: .sisyphus/evidence/task-3-grep.txt

  Scenario: Dev server renders project cards with WebGL
    Tool: Playwright (dev-browser skill)
    Preconditions: bun dev running
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to #projects section
      3. Wait for images to load (wait 3s for texture loading)
      4. Screenshot all 4 project cards: `.card[data-project-id]`
      5. Assert: card image areas are NOT blank/transparent (WebGL mesh rendered)
    Expected Result: All 4 cards show image content via WebGL displacement mesh
    Failure Indicators: Blank image areas, console errors about textures/materials
    Evidence: .sisyphus/evidence/task-3-cards-rendered.png

  Scenario: Hover triggers liquid distortion effect
    Tool: Playwright (dev-browser skill)
    Preconditions: Dev server running, project cards visible
    Steps:
      1. Navigate to http://localhost:3000/#projects
      2. Hover over first card's `.imageArea` element
      3. Wait 1.5s (GSAP tween duration is 1.2s)
      4. Screenshot during distortion
      5. Move mouse away, wait 1.5s
      6. Screenshot after return to normal
    Expected Result: Visible liquid distortion during hover, clean image at rest
    Failure Indicators: No visual change on hover, or image disappears
    Evidence: .sisyphus/evidence/task-3-hover-effect.png

  Scenario: Cards without hoverImageSrc show distortion-only (no swap)
    Tool: Playwright (dev-browser skill)
    Preconditions: Dev server running
    Steps:
      1. Hover over card[data-project-id="viet-bike-scout"] .imageArea
      2. Wait 1.5s
      3. Screenshot — should show same image with distortion, NOT a different image
    Expected Result: Distortion visible but image content same (sameImage mode)
    Failure Indicators: Image swaps to a different texture, or goes blank
    Evidence: .sisyphus/evidence/task-3-same-image-mode.png

  Scenario: CSS fallback works (non-WebGL verification)
    Tool: Bash (grep)
    Preconditions: Code updated
    Steps:
      1. Verify style prop includes backgroundImage, backgroundSize, backgroundPosition
      2. Run: grep -A5 'style=' components/sections/projects/index.tsx | grep -c 'backgroundImage'
      3. Assert: count >= 1
    Expected Result: Fallback CSS background-image exists in style prop
    Failure Indicators: No backgroundImage in style prop
    Evidence: .sisyphus/evidence/task-3-css-fallback.txt
  ```

  **Commit**: YES
  - Message: `feat(projects): wire ImageTransition WebGL displacement effect on cards`
  - Files: `components/sections/projects/index.tsx`
  - Pre-commit: `bun run check`

- [ ] 4. Full visual QA of WebGL image transitions

  **What to do**:
  - Start dev server and run comprehensive Playwright-based visual verification
  - Test all 4 project cards: images render, hover works, scroll tracking accurate
  - Test edge cases: SVG data URL textures, resize behavior, rapid hover
  - Capture evidence screenshots for all scenarios

  **Must NOT do**:
  - DO NOT modify any source files — this is verification only
  - DO NOT skip any scenario

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Comprehensive visual QA requiring browser automation
  - **Skills**: [`dev-browser`]
    - `dev-browser`: Playwright browser automation for navigating, interacting, and screenshotting

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential)
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Task 3

  **References**:

  **Pattern References**:
  - `components/sections/projects/projects.module.css:35-58` — Card hover styles (`.card:hover` `translateY(-6px)`) — context for what CSS hover looks like alongside WebGL hover

  **Test Data**:
  - Card IDs: `x-recommendation-algo`, `viet-bike-scout`, `autoresearch-macos`, `stocktwits-clone-2`
  - Cards WITH hover images: `x-recommendation-algo` (x-rec1 → X-REC2), `stocktwits-clone-2` (stolk1 → stolk2)
  - Cards WITHOUT hover images: `viet-bike-scout`, `autoresearch-macos` (SVG data URL gradients, sameImage mode)

  **Why Each Reference Matters**:
  - Card IDs are the `data-project-id` attributes used to select specific cards in Playwright
  - Knowing which cards have hover images vs sameImage mode tells you what to expect visually

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All 4 cards render images at rest
    Tool: Playwright (dev-browser skill)
    Preconditions: bun dev running on localhost:3000
    Steps:
      1. Navigate to http://localhost:3000
      2. Scroll to #projects section
      3. Wait 3s for textures to load
      4. Screenshot each card: [data-project-id="x-recommendation-algo"], [data-project-id="viet-bike-scout"], [data-project-id="autoresearch-macos"], [data-project-id="stocktwits-clone-2"]
      5. Assert: all .imageArea elements have non-blank rendered content
    Expected Result: 4 screenshots showing project images via WebGL
    Failure Indicators: Blank/transparent image areas, fallback gradient visible instead of WebGL
    Evidence: .sisyphus/evidence/task-4-all-cards-rest.png

  Scenario: Hover transitions on cards WITH second images
    Tool: Playwright (dev-browser skill)
    Preconditions: Cards visible
    Steps:
      1. Hover over [data-project-id="x-recommendation-algo"] .imageArea
      2. Wait 1.5s
      3. Screenshot — should show X-REC2 image with distortion
      4. Move away, wait 1.5s
      5. Screenshot — should return to x-rec1
      6. Repeat for [data-project-id="stocktwits-clone-2"]
    Expected Result: Liquid distortion transition between two different images
    Failure Indicators: No image change, stuck on one image, blank area
    Evidence: .sisyphus/evidence/task-4-hover-swap.png

  Scenario: Hover distortion on cards WITHOUT second images
    Tool: Playwright (dev-browser skill)
    Preconditions: Cards visible
    Steps:
      1. Hover over [data-project-id="viet-bike-scout"] .imageArea
      2. Wait 1.5s
      3. Screenshot — should show distortion effect on same image
      4. Move away, wait 1.5s
    Expected Result: Ripple/distortion visible but same image content (no swap)
    Failure Indicators: Image swaps, goes blank, or no distortion at all
    Evidence: .sisyphus/evidence/task-4-hover-distortion-only.png

  Scenario: No console errors
    Tool: Playwright (dev-browser skill)
    Preconditions: Dev server running
    Steps:
      1. Open browser console listener
      2. Navigate to localhost:3000/#projects
      3. Scroll through projects section
      4. Hover all 4 cards
      5. Collect console errors
      6. Assert: zero errors containing 'WebGL', 'texture', 'material', 'ShaderMaterial', 'THREE'
    Expected Result: Clean console — no WebGL-related errors
    Failure Indicators: Any Three.js or WebGL error messages
    Evidence: .sisyphus/evidence/task-4-console-clean.txt

  Scenario: Section background visually unchanged
    Tool: Playwright (dev-browser skill)
    Preconditions: Dev server running
    Steps:
      1. Navigate to localhost:3000/#projects
      2. Screenshot the full projects section
      3. Assert: dark background visible (from body), text readable in .content areas
      4. Assert: no visual gap or color difference between projects section and adjacent sections
    Expected Result: Visually identical to before — dark background from body
    Failure Indicators: Visible seam between sections, content area transparent, text unreadable
    Evidence: .sisyphus/evidence/task-4-section-bg.png

  Scenario: Scroll tracking accuracy
    Tool: Playwright (dev-browser skill)
    Preconditions: Dev server running
    Steps:
      1. Scroll slowly from hero to projects section
      2. Screenshot at 3 different scroll positions as cards enter viewport
      3. Assert: WebGL mesh images are aligned with their DOM card containers (no offset or lag)
    Expected Result: Meshes track card positions accurately during scroll
    Failure Indicators: Images offset from cards, lag during scroll, jumping positions
    Evidence: .sisyphus/evidence/task-4-scroll-tracking.png
  ```

  **Commit**: NO (verification only — no code changes)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality + Build Check** — `unspecified-high`
  Run `bun run check` (biome + typecheck + tests). Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify `import type` used for type-only imports. Verify CSS classes are sorted (Biome).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Visual QA** — `unspecified-high` + `dev-browser` skill
  Start dev server (`bun dev`). Navigate to `http://localhost:3000/#projects`. Screenshot all 4 cards at rest. Hover each card image area, wait 1.5s, screenshot during distortion. Verify scroll tracking by scrolling to projects section. Test window resize. Save all screenshots to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git diff). Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Verify `ImageTransition`, `WebGLImageTransition`, `ImageTransitionMaterial` were NOT modified. Verify no other sections made transparent. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After Task | Message | Files |
|-----------|---------|-------|
| 1 + 2     | `feat(projects): prepare transparent bg and hover image data for WebGL` | `projects.module.css`, `projects/index.tsx` |
| 3         | `feat(projects): wire ImageTransition WebGL displacement effect on cards` | `projects/index.tsx` |

---

## Success Criteria

### Verification Commands
```bash
bun run build     # Expected: exit 0
bun run check     # Expected: exit 0 (biome + types + tests)
```

### Final Checklist
- [ ] All 4 project cards show images via WebGL mesh
- [ ] Hover triggers liquid distortion effect (1.2s transition)
- [ ] Projects with second images show image-swap on hover
- [ ] Projects without second images show distortion-only on hover
- [ ] Section visually identical (dark background from body)
- [ ] `.content` area text remains readable
- [ ] No console errors related to WebGL/textures
- [ ] CSS fallback works when WebGL unavailable
