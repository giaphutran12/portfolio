# Learnings

## Initial Context
- Stack: Next.js 16, React 19, TypeScript (strict), Tailwind v4 + CSS Modules, Bun, Biome
- React Compiler ON — no useMemo/useCallback/React.memo
- GSAP for animations, Lenis for smooth scroll
- WebGL via R3F + GlobalCanvas portal system (WebGLTunnel)
- Z-index contract: canvas(0), noiseWaves(5), content(20), header(50)

## Task 1: Hero Katakana Scramble Animation

### Changes Made
1. **Hardcoded Japanese katakana in hero span** (line 110)
   - Changed `{name}` to `"エドワード・トラン"` in the `aria-hidden` span
   - This is the initial state before GSAP ScrambleTextPlugin decodes it to "Edward Tran"
   - The `sr-only` span (line 108) remains `{name}` for screen readers

2. **Fixed reduced-motion accessibility** (lines 35-40)
   - Added `nameRef.current.textContent = name` in the `prefersReducedMotion` early return
   - Ensures users with reduced-motion preferences see English text, not Japanese forever
   - Prevents animation from running while still showing correct content

### Key Pattern
- GSAP ScrambleTextPlugin uses `text: name` as the destination (line 59)
- The `chars` scramble set includes katakana: `'アイウエオカキクケコサシスセソタチツテト!@#$%&'`
- Animation flow: Japanese → (scramble animation) → English
- Reduced-motion users skip animation but still get correct final state

### Verification
- ✅ `bun run check` passes (biome format, typecheck, tests)
- ✅ No changes to animation timing constants (ANIM_DELAY, ANIM_DURATION, ANIM_END)
- ✅ No changes to subtitle or scroll indicator animations
- ✅ No new dependencies added

## Task 4: Add videoSrc to Project Data Model

### Changes Made
1. **Extended ProjectCard interface** (line 16)
   - Added `videoSrc?: string` after `hoverImageSrc?: string`
   - Optional field to support fallback projects with video paths

2. **Added videoSrc to 2 fallback projects**
   - `x-recommendation-algo` (line 39): `videoSrc: '/project-videos/x-recommendation-algo.mp4'`
   - `stocktwits-clone-2` (line 71): `videoSrc: '/project-videos/stocktwits-clone-2.mp4'`
   - These are the projects with real images (not gradient placeholders), suggesting more mature/polished projects

3. **Updated mapProjects function** (lines 147-149)
   - Added conditional to carry `videoSrc` from fallback to result:
   ```tsx
   if (fallback.videoSrc) {
     result.videoSrc = fallback.videoSrc
   }
   ```
   - Mirrors the pattern used for `hoverImageSrc` (lines 143-145)

4. **Created public/project-videos directory**
   - `mkdir -p public/project-videos/`
   - Directory exists and ready for video files

### Key Decisions
- Did NOT modify Sanity `Project` interface in `lib/integrations/sanity/fetch.ts` (as required)
- Did NOT add videoSrc to all fallback projects — only the 2 specified
- Did NOT create actual video files — just the directory structure
- Followed existing pattern for optional fields (hoverImageSrc precedent)

### Verification
- ✅ ProjectCard interface has `videoSrc?: string`
- ✅ 2 fallback projects have videoSrc paths
- ✅ mapProjects carries videoSrc through
- ✅ public/project-videos/ directory created
- ✅ Sanity Project interface unchanged
- ⚠️ Pre-existing test file linting errors (unrelated to this task)

### Notes
- Fixed unrelated import ordering issue in `components/effects/video-autoplay/use-video-autoplay.ts` (React imports before custom imports)
- Test file has pre-existing Biome warnings (empty block statements, unused parameters) — not introduced by this task

## Task 5: VideoAutoplay Component + CSS Module

### Changes Made
1. **Created `components/effects/video-autoplay/index.tsx`**
   - `'use client'` directive (needs hooks + browser APIs)
   - Props: `{ src: string; poster?: string; className?: string }`
   - Uses `useRef<HTMLVideoElement>(null)` + `useVideoAutoplay(videoRef)`
   - Video attributes: `muted`, `playsInline`, `loop`, `preload="none"`, `poster`
   - Error handling: `useState(false)` for `hasError`, returns `null` on error (silent hide)
   - JSX attributes alphabetically sorted (Biome convention)
   - Named export `VideoAutoplay`

2. **Created `components/effects/video-autoplay/video-autoplay.module.css`**
   - `.video` class: `display: block; height: 100%; object-fit: cover; width: 100%;`
   - CSS properties alphabetically sorted

### Key Patterns
- Same-directory import `./use-video-autoplay` is allowed (Biome only forbids `../`)
- Error handling pattern: boolean state + early `return null` is simpler than ProjectCardMedia's render-state machine — appropriate for a leaf component with no recovery path
- `preload="none"` prevents bandwidth waste — video only loads when IntersectionObserver triggers play
- `cn(s.video, className)` allows parent to add positioning/sizing classes

### Verification
- ✅ `bun run check` passes (biome check + tsgo --noEmit + 435 tests)
- ✅ No LSP diagnostics
- ✅ No inline styles
- ✅ No manual memoization
- ✅ No `any` types

## Task 6: Integrate VideoAutoplay into Project Cards

### Changes Made
1. **Modified `components/sections/projects/index.tsx`** (lines 3, 171-177)
   - Added import: `import { VideoAutoplay } from '@/components/effects/video-autoplay'`
   - Conditional rendering in `.imageArea`: if `project.videoSrc` exists, render `<VideoAutoplay>` instead of `<ProjectCardMedia>`
   - VideoAutoplay gets `className={s.imageEffect}` (same as ProjectCardMedia) for absolute positioning + fill
   - `poster={project.imageSrc}` ensures poster image shows when video unavailable
   - `src={project.videoSrc}` passes the video path
   - Gradient overlay (`.gradientLayer`) renders for BOTH video and image projects (unchanged)

2. **Updated `components/effects/video-autoplay/index.tsx`** (prop types)
   - Changed `poster?: string` to `poster?: string | undefined`
   - Changed `className?: string` to `className?: string | undefined`
   - Required by `exactOptionalPropertyTypes: true` in tsconfig — CSS module class lookups return `string | undefined`, and without explicit `| undefined` in the prop type, TypeScript rejects passing them

### Key Gotcha: exactOptionalPropertyTypes
- With `exactOptionalPropertyTypes: true`, `prop?: string` means "omittable, but if provided must be exactly `string`"
- CSS module class references (e.g. `s.imageEffect`) are typed as `string | undefined`
- Fix: declare props as `prop?: string | undefined` to accept both forms
- This is a common pattern needed throughout this codebase when passing CSS module classes to component props

### Verification
- ✅ `bun run check` passes (biome check + tsgo --noEmit + 435 tests)
- ✅ `bun run build` passes (production build, all 14 pages generated)
- ✅ No LSP diagnostics on either changed file
- ✅ Projects with `videoSrc` render `<VideoAutoplay>` instead of `<ProjectCardMedia>`
- ✅ Projects without `videoSrc` render `<ProjectCardMedia>` unchanged
- ✅ Gradient overlay present for all projects
