# Hero Section Animation Issues — Detailed Breakdown

## Issue #1: GSAPRuntime Not Mounted (CRITICAL)

**File**: `app/layout.tsx`  
**Severity**: 🔴 BLOCKS ALL ANIMATIONS  
**Status**: NOT FIXED

### Problem
The `GSAPRuntime` component is defined in `components/effects/gsap.tsx` but is never imported or rendered in the root layout. This means GSAP's ticker is not synced with Tempus RAF.

### Evidence
- `components/effects/gsap.tsx` lines 34-40 define `GSAPRuntime`
- `app/layout.tsx` imports `ReactTempus` (line 7, 132) but NOT `GSAPRuntime`
- `GSAPRuntime` is never rendered in the layout body

### Impact
- GSAP animations may fire at wrong times or not at all
- Timing is out of sync with Lenis smooth scroll
- Animations may stutter or skip frames

### Solution
Add to `app/layout.tsx`:
```tsx
import { GSAPRuntime } from '@/components/effects/gsap'

// In body:
<body>
  <GSAPRuntime />
  {/* rest of content */}
</body>
```

---

## Issue #2: ScrambleTextPlugin Registered Inside useEffect (CRITICAL)

**File**: `components/sections/hero/index.tsx:29`  
**Severity**: 🔴 BLOCKS SCRAMBLE ANIMATION  
**Status**: NOT FIXED

### Problem
`gsap.registerPlugin(ScrambleTextPlugin)` is called inside `useEffect`, not at module level. This violates GSAP best practices and may cause timing issues with React Compiler.

### Evidence
- Line 29: `gsap.registerPlugin(ScrambleTextPlugin)` inside useEffect
- GSAP docs recommend module-level registration
- React Compiler may batch effects, causing plugin to register after animation starts

### Impact
- Plugin may not be registered when animation runs
- Scramble text animation fails silently
- Fast re-renders may skip plugin registration

### Solution
Move to module level:
```tsx
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

// Module level (before component)
gsap.registerPlugin(ScrambleTextPlugin)

export function Hero() { ... }
```

---

## Issue #3: gsap.context() Missing Scope (CRITICAL)

**File**: `components/sections/hero/index.tsx:37`  
**Severity**: 🔴 ANIMATIONS MAY TARGET WRONG ELEMENTS  
**Status**: NOT FIXED

### Problem
`gsap.context(() => {...})` is called without passing the scope element. GSAP context should be bound to the section container.

### Evidence
- Line 37: `const ctx = gsap.context(() => {...})`
- Should be: `const ctx = gsap.context(() => {...}, sectionRef.current)`
- GSAP docs: `gsap.context(callback, scope)` - scope is required for proper isolation

### Impact
- Animations may not be properly scoped to the section
- Context cleanup may not work correctly
- Animations could affect other elements on the page

### Solution
```tsx
const ctx = gsap.context(() => {
  // animation code
}, sectionRef.current)
```

---

## Issue #4: Refs May Be Null During Animation (CRITICAL)

**File**: `components/sections/hero/index.tsx:38-65`  
**Severity**: 🔴 ANIMATIONS FAIL SILENTLY  
**Status**: NOT FIXED

### Problem
Refs are used in animations without null checks. If refs are not populated by the time useEffect runs, animations target `null` and fail silently.

### Evidence
- Line 38: `gsap.set(subtitleRef.current, { opacity: 0 })`
- Line 39: `gsap.set(scrollIndicatorRef.current, { opacity: 0 })`
- Line 41: `gsap.to(nameRef.current, {...})`
- No null checks before using refs

### Impact
- Animations fail silently if refs are not attached
- No error messages in console
- User sees no animation at all

### Solution
Add null checks:
```tsx
gsap.to(nameRef.current, {
  // only animate if ref exists
  ...(nameRef.current && {
    delay: ANIM_DELAY,
    duration: ANIM_DURATION,
    // rest of animation
  })
})
```

Or use selector:
```tsx
gsap.to('[data-testid="hero-name"]', {
  // animation code
})
```

---

## Issue #5: ScrambleTextPlugin Not Available in Free GSAP (CRITICAL)

**File**: `components/sections/hero/index.tsx:5`  
**Severity**: 🔴 PLUGIN REGISTRATION FAILS  
**Status**: NEEDS VERIFICATION

### Problem
ScrambleTextPlugin is a premium plugin (requires Club GreenSock membership). GSAP 3.14.2 free version does NOT include it.

### Evidence
- GSAP 3.14.2 installed (free version)
- Free version includes: Draggable, EaselPlugin, PixiPlugin, TextPlugin
- ScrambleTextPlugin is NOT in free version
- Import may succeed but plugin registration fails

### Impact
- Plugin registration fails silently
- Scramble text animation doesn't work
- No error message (GSAP silently ignores missing plugins)

### Solution
Option 1: Use TextPlugin (free alternative)
```tsx
import { TextPlugin } from 'gsap/TextPlugin'
gsap.registerPlugin(TextPlugin)

gsap.to(nameRef.current, {
  text: name,
  duration: ANIM_DURATION,
})
```

Option 2: Verify ScrambleTextPlugin license and upgrade if needed

---

## Issue #6: CSS Opacity Conflicts with GSAP (WARNING)

**File**: `hero.module.css:25, 34`  
**Severity**: 🟡 MAY CAUSE TIMING ISSUES  
**Status**: NOT FIXED

### Problem
CSS sets `opacity: 0` on subtitle and scrollIndicator, but GSAP also sets these properties. Double-setting may cause race conditions.

### Evidence
- Line 25: `.subtitle { opacity: 0; }`
- Line 34: `.scrollIndicator { opacity: 0; }`
- Line 38-39: GSAP also calls `gsap.set()` on same properties

### Impact
- Potential flashing or timing issues
- Redundant CSS rules
- Harder to debug animation behavior

### Solution
Remove CSS opacity rules and let GSAP handle all animated properties:
```css
.subtitle {
  color: var(--color-contrast);
  letter-spacing: 0.15em;
  /* Remove: opacity: 0; */
  text-transform: uppercase;
}
```

---

## Issue #7: Reduced Motion Inconsistency (WARNING)

**File**: `hero.module.css:28-30, 36-38` + `index.tsx:31-35`  
**Severity**: 🟡 INCONSISTENT BEHAVIOR  
**Status**: NOT FIXED

### Problem
CSS and JavaScript handle reduced motion differently. CSS shows elements, but JS skips animations.

### Evidence
- CSS (lines 28-30): `@media (--reduced-motion) { opacity: 1; }`
- JS (lines 31-35): `if (prefersReducedMotion) return` (skips all animations)
- Inconsistent: CSS shows elements, JS doesn't animate them

### Impact
- Users with reduced motion see inconsistent behavior
- CSS shows elements but they don't animate
- Confusing UX

### Solution
Align CSS and JS behavior:
```tsx
// Option 1: Skip animations in JS, let CSS handle visibility
if (prefersReducedMotion) return

// Option 2: Remove CSS reduced-motion rules and handle in JS only
```

---

## Issue #8: AnimatedGradient WebGL Not Verified (WARNING)

**File**: `components/sections/hero/index.tsx:80-88`  
**Severity**: 🟡 BACKGROUND MAY NOT RENDER  
**Status**: NEEDS VERIFICATION

### Problem
AnimatedGradient requires WebGL context via GlobalCanvas, which must be mounted in root layout. Not verified if GlobalCanvas is present.

### Evidence
- AnimatedGradient uses `dynamic()` import (lazy load)
- Requires `<GlobalCanvas />` in `app/layout.tsx`
- `app/layout.tsx` does NOT show GlobalCanvas import
- `<Canvas root={webgl}>` in Wrapper activates it, but GlobalCanvas must exist

### Impact
- WebGL background may not render
- AnimatedGradient component fails silently
- User sees plain background instead of animated gradient

### Solution
Verify GlobalCanvas is mounted in `app/layout.tsx`:
```tsx
import { LazyGlobalCanvas } from '@/lib/webgl/components/global-canvas'

// In body:
<body>
  {/* content */}
  <LazyGlobalCanvas />
</body>
```

---

## Issue #9: Missing Dependency in useEffect (WARNING)

**File**: `components/sections/hero/index.tsx:69`  
**Severity**: 🟡 ANIMATION MAY NOT RE-RUN  
**Status**: NOT FIXED

### Problem
useEffect dependency array only includes `[name]`, but `tagline` is also used in the component.

### Evidence
- Line 21: `tagline = 'Full-Stack Developer'` is a prop
- Line 103: `{tagline}` is rendered
- Line 69: Dependency array is `[name]` only
- Should include `tagline` or be empty if props don't change

### Impact
- If tagline prop changes, animation doesn't re-run
- Stale closure over tagline value
- Inconsistent animation behavior

### Solution
Update dependency array:
```tsx
useEffect(() => {
  // animation code
}, [name, tagline])
```

Or if props never change:
```tsx
useEffect(() => {
  // animation code
}, [])
```

---

## Summary Table

| Issue | File | Line | Severity | Status |
|-------|------|------|----------|--------|
| GSAPRuntime not mounted | app/layout.tsx | — | 🔴 CRITICAL | NOT FIXED |
| Plugin registered in useEffect | hero/index.tsx | 29 | 🔴 CRITICAL | NOT FIXED |
| gsap.context() missing scope | hero/index.tsx | 37 | 🔴 CRITICAL | NOT FIXED |
| Refs may be null | hero/index.tsx | 38-65 | 🔴 CRITICAL | NOT FIXED |
| ScrambleTextPlugin unavailable | hero/index.tsx | 5 | 🔴 CRITICAL | NEEDS VERIFICATION |
| CSS opacity conflicts | hero.module.css | 25, 34 | 🟡 WARNING | NOT FIXED |
| Reduced motion inconsistent | hero.module.css + index.tsx | 28-30, 31-35 | 🟡 WARNING | NOT FIXED |
| AnimatedGradient WebGL | hero/index.tsx | 80-88 | 🟡 WARNING | NEEDS VERIFICATION |
| Missing dependency | hero/index.tsx | 69 | 🟡 WARNING | NOT FIXED |
