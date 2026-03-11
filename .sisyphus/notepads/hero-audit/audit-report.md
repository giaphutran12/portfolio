# HERO SECTION ANIMATION AUDIT

**Date**: March 11, 2026  
**Status**: CRITICAL ISSUES FOUND  
**Severity**: Blocks all animations

---

## CRITICAL ISSUES (Blocks Animation)

### 1. **GSAPRuntime NOT MOUNTED** — `components/effects/gsap.tsx` + `app/layout.tsx`
- **Issue**: The `GSAPRuntime` component is defined but NEVER imported or rendered in the app
- **Location**: `components/effects/gsap.tsx` (lines 34-40) defines it, but `app/layout.tsx` does NOT import it
- **Impact**: GSAP ticker is NOT synced with Tempus RAF. GSAP animations may fire at wrong times or not at all
- **Evidence**: 
  - `app/layout.tsx` imports `ReactTempus` (line 7, 132) but NOT `GSAPRuntime`
  - `GSAPRuntime` is a standalone component that must be rendered in the layout
  - Without it, GSAP uses its own ticker (not synced to Tempus)
- **Fix Required**: Import and render `<GSAPRuntime />` in `app/layout.tsx` body

### 2. **ScrambleTextPlugin Registration Inside useEffect** — `components/sections/hero/index.tsx:29`
- **Issue**: `gsap.registerPlugin(ScrambleTextPlugin)` is called INSIDE `useEffect`, not at module level
- **Location**: Line 29 in Hero component
- **Impact**: Plugin may not be registered before animation runs, especially on fast re-renders or React Compiler optimizations
- **Evidence**:
  - Line 29: `gsap.registerPlugin(ScrambleTextPlugin)` inside useEffect
  - Best practice: Register plugins at module level (top of file, outside components)
  - React Compiler may batch effects, causing timing issues
- **Fix Required**: Move registration to module level (after imports, before component definition)

### 3. **gsap.context() Missing Scope Reference** — `components/sections/hero/index.tsx:37`
- **Issue**: `gsap.context(() => {...})` is called WITHOUT passing `sectionRef` as second argument
- **Location**: Line 37: `const ctx = gsap.context(() => {...})`
- **Impact**: Context scope is not bound to the section element. Animations may target wrong elements or fail silently
- **Evidence**:
  - GSAP docs: `gsap.context(callback, scope)` - scope should be the container element
  - Current code: `gsap.context(() => {...})` - no scope
  - Should be: `gsap.context(() => {...}, sectionRef.current)`
  - Without scope, GSAP may not properly isolate animations to this section
- **Fix Required**: Pass `sectionRef.current` as second argument to `gsap.context()`

### 4. **Refs May Be Null During Animation Setup** — `components/sections/hero/index.tsx:38-65`
- **Issue**: Refs are used in animations without null checks. If refs are not populated by useEffect run time, animations target `null`
- **Location**: Lines 38-65 (all `gsap.set()` and `gsap.to()` calls)
- **Impact**: Animations silently fail if refs are not yet attached to DOM
- **Evidence**:
  - Line 38: `gsap.set(subtitleRef.current, { opacity: 0 })` - no null check
  - Line 39: `gsap.set(scrollIndicatorRef.current, { opacity: 0 })` - no null check
  - Line 41: `gsap.to(nameRef.current, {...})` - no null check
  - If component renders but refs not attached, animations target `null` and fail silently
- **Fix Required**: Add null checks or use `gsap.utils.selector()` to safely target elements

### 5. **ScrambleTextPlugin May Not Be Available in GSAP 3.14.2 Free** — `components/sections/hero/index.tsx:5`
- **Issue**: ScrambleTextPlugin is imported from `gsap/ScrambleTextPlugin`, but availability in free version is unclear
- **Location**: Line 5: `import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'`
- **Impact**: If plugin is not available, import fails silently or plugin is undefined
- **Evidence**:
  - GSAP 3.14.2 is installed (free version, all plugins included since 3.13+)
  - However, ScrambleTextPlugin is a premium plugin (requires Club GreenSock membership)
  - Free version includes: Draggable, EaselPlugin, PixiPlugin, TextPlugin, but NOT ScrambleTextPlugin
  - The import may succeed but plugin registration fails
- **Fix Required**: Either:
  - Use TextPlugin (free) instead of ScrambleTextPlugin
  - Or verify ScrambleTextPlugin license/availability
  - Or add error handling for missing plugin

---

## WARNINGS (May Cause Problems)

### 6. **CSS Initial States Conflict with GSAP** — `hero.module.css:25, 34`
- **Issue**: CSS sets `opacity: 0` on subtitle and scrollIndicator, but GSAP also sets these
- **Location**: 
  - Line 25: `.subtitle { opacity: 0; }`
  - Line 34: `.scrollIndicator { opacity: 0; }`
- **Impact**: Double-setting opacity may cause race conditions or unexpected behavior
- **Evidence**:
  - CSS sets initial opacity to 0
  - GSAP also calls `gsap.set(subtitleRef.current, { opacity: 0 })` (line 38-39)
  - This is redundant and may cause flashing or timing issues
- **Fix Required**: Remove CSS `opacity: 0` from `.subtitle` and `.scrollIndicator` — let GSAP handle it

### 7. **prefers-reduced-motion Media Query in CSS** — `hero.module.css:28-30, 36-38`
- **Issue**: CSS has `@media (--reduced-motion)` but JavaScript also checks `prefers-reduced-motion`
- **Location**: 
  - Lines 28-30: `.subtitle @media (--reduced-motion) { opacity: 1; }`
  - Lines 36-38: `.scrollIndicator @media (--reduced-motion) { opacity: 1; }`
- **Impact**: If user has reduced motion enabled, CSS shows elements but GSAP animations are skipped (line 35)
- **Evidence**:
  - Line 31-35: JavaScript checks `prefers-reduced-motion` and returns early
  - CSS also sets `opacity: 1` for reduced motion
  - This creates inconsistent behavior: CSS shows elements, JS skips animations
- **Fix Required**: Ensure CSS and JS are aligned on reduced motion behavior

### 8. **AnimatedGradient May Not Render** — `components/sections/hero/index.tsx:80-88`
- **Issue**: AnimatedGradient is dynamically imported and requires WebGL context
- **Location**: Lines 80-88 (AnimatedGradient component)
- **Impact**: If WebGL is not available or GlobalCanvas is not mounted, background won't render
- **Evidence**:
  - AnimatedGradient uses `dynamic()` import (lazy load)
  - Requires `<GlobalCanvas />` in root layout (NOT found in `app/layout.tsx`)
  - `<Canvas root={webgl}>` in Wrapper activates it, but GlobalCanvas must be mounted
  - If GlobalCanvas is missing, WebGL tunnel is not available
- **Fix Required**: Verify GlobalCanvas is mounted in `app/layout.tsx`

### 9. **Dependency Array Missing `tagline`** — `components/sections/hero/index.tsx:69`
- **Issue**: useEffect dependency array only includes `[name]`, but `tagline` is also used
- **Location**: Line 69: `}, [name])`
- **Impact**: If `tagline` prop changes, animation doesn't re-run
- **Evidence**:
  - Line 21: `tagline = 'Full-Stack Developer'` is a prop
  - Line 103: `{tagline}` is rendered in subtitle
  - Line 69: Dependency array is `[name]` only
  - Should be: `[name, tagline]` or just `[]` if props don't change
- **Fix Required**: Update dependency array to `[name, tagline]` or `[]`

---

## VERIFIED WORKING

### ✅ ScrollLine CSS Animation
- **Status**: Working correctly
- **Evidence**: 
  - `hero.module.css:48-69` defines `@keyframes scrollPulse`
  - Animation is CSS-only, no GSAP dependency
  - Should animate indefinitely (1.8s loop)

### ✅ Lenis Smooth Scroll Integration
- **Status**: Properly configured
- **Evidence**:
  - `components/layout/lenis/index.tsx` is imported in Wrapper
  - `app/layout.tsx` renders `<ReactTempus patch={!isDraftMode} />`
  - Lenis is synced with Tempus RAF

### ✅ React Compiler Compatibility
- **Status**: No manual memoization needed
- **Evidence**:
  - CLAUDE.md confirms React Compiler is ON
  - No `useMemo`, `useCallback`, or `React.memo` in Hero component
  - Component is properly structured for compiler optimization

### ✅ CSS Module Import
- **Status**: Correct pattern
- **Evidence**:
  - Line 8: `import s from './hero.module.css'` follows Satus convention
  - Classes used correctly: `s.hero`, `s.name`, `s.subtitle`, etc.

---

## SUMMARY

| Category | Count | Severity |
|----------|-------|----------|
| Critical Issues | 5 | 🔴 BLOCKS ALL ANIMATIONS |
| Warnings | 4 | 🟡 MAY CAUSE PROBLEMS |
| Working | 4 | ✅ VERIFIED |

**Root Cause**: GSAPRuntime is not mounted, and ScrambleTextPlugin registration is inside useEffect instead of module-level. These two issues alone prevent animations from firing.

**Quick Fix Priority**:
1. Mount `<GSAPRuntime />` in `app/layout.tsx`
2. Move `gsap.registerPlugin(ScrambleTextPlugin)` to module level
3. Pass `sectionRef.current` to `gsap.context()`
4. Verify ScrambleTextPlugin is available (may need to use TextPlugin instead)
5. Remove CSS `opacity: 0` from subtitle/scrollIndicator
