# ABOUT SECTION ANIMATION AUDIT REPORT

**Date**: 2026-03-11  
**Status**: CRITICAL ISSUES FOUND  
**User Report**: "No animation of any kind" observed

---

## CRITICAL ISSUES (Blocks Animation)

### 1. **ScrollTrigger NOT Synced with Lenis Smooth Scroll** — `wrapper/index.tsx:122`
**Severity**: 🔴 CRITICAL  
**Impact**: ScrollTrigger may not receive scroll position updates from Lenis

```tsx
// Line 122 in wrapper/index.tsx
{lenis && <Lenis root options={typeof lenis === 'object' ? lenis : {}} />}
```

**Problem**:
- `syncScrollTrigger` prop is NOT passed to `<Lenis>` component
- Defaults to `syncScrollTrigger={false}` (line 28 in `lenis/index.tsx`)
- This means `LenisScrollTriggerSync` component is NEVER rendered
- Without it, `GSAPScrollTrigger.update()` is never called on Lenis scroll events
- **Result**: ScrollTrigger animations may fire at wrong scroll positions or not at all

**Evidence**:
```tsx
// lenis/index.tsx line 64
{syncScrollTrigger && root && <LenisScrollTriggerSync />}
```

The condition `syncScrollTrigger && root` is FALSE because `syncScrollTrigger=false` by default.

**Fix Required**: Pass `syncScrollTrigger={true}` to Lenis in wrapper:
```tsx
{lenis && <Lenis root options={typeof lenis === 'object' ? lenis : {}} syncScrollTrigger={true} />}
```

---

### 2. **Ref Timing Race Condition** — `about/index.tsx:38` + `split-text/index.tsx:71-73`
**Severity**: 🔴 CRITICAL  
**Impact**: Parent's useEffect may access `headingRef.current?.getSplitText()` BEFORE SplitText has completed splitting

```tsx
// about/index.tsx line 38
const splitInstance = headingRef.current?.getSplitText()
```

**Problem**:
- SplitText component's useEffect (line 45-80 in `split-text/index.tsx`) creates the split asynchronously
- The `onSplit` callback (line 71) updates `splittedRef.current` and calls `setSplittedText(splitted)`
- Parent's useEffect (line 28-74 in `about/index.tsx`) runs with empty dependency array `[]`
- **React useEffect order**: Child effects run BEFORE parent effects
- BUT: The parent's effect runs IMMEDIATELY on mount, while the child's split creation is async
- If the parent's useEffect runs before `onSplit` callback fires, `splitInstance` will be `null`

**Evidence**:
```tsx
// split-text/index.tsx lines 71-73
onSplit: (splitted) => {
  splittedRef.current = splitted
  setSplittedText(splitted)
}
```

The `onSplit` callback is async — it fires AFTER `GSAPSplitText.create()` completes.

**Why This Matters**:
```tsx
// about/index.tsx lines 41-54
if (chars && chars.length > 0) {
  gsap.from(chars, { ... })
}
```

If `chars` is undefined/null, the animation NEVER runs.

**Fix Required**: Add dependency on `splittedText` state or use a callback ref pattern:
```tsx
useEffect(() => {
  // ... setup code ...
  
  const splitInstance = headingRef.current?.getSplitText()
  const chars = splitInstance?.chars
  
  if (chars && chars.length > 0) {
    // Animation code
  }
}, [headingRef.current?.splittedText]) // Add dependency on split completion
```

Or better: Use a state callback to trigger animation only after split completes.

---

### 3. **gsap.from() with ScrollTrigger Creates Visual Flash** — `about/index.tsx:42-53`
**Severity**: 🟠 HIGH  
**Impact**: Characters visible at full opacity before animation starts, then jump to `opacity: 0`

```tsx
gsap.from(chars, {
  duration: 0.6,
  ease: 'power2.out',
  opacity: 0,        // ← Animates FROM 0
  scrollTrigger: { ... },
  stagger: 0.02,
  y: 20,
})
```

**Problem**:
- `gsap.from()` animates FROM the specified values TO the current DOM state
- Characters are rendered with `opacity: 1` (default) in the DOM
- When GSAP initializes, it sets `opacity: 0` on all chars immediately
- Then ScrollTrigger waits for the trigger point
- **Result**: Flash of visible text → invisible → animated in

**Why This Happens**:
- SplitText creates char elements with no explicit opacity
- GSAP's `from()` sets the "from" state immediately on initialization
- If ScrollTrigger hasn't fired yet, user sees the flash

**Fix Required**: Use `gsap.fromTo()` instead, or set initial opacity in CSS:
```tsx
// Option 1: Use fromTo with explicit initial state
gsap.fromTo(chars, 
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.6, ... }
)

// Option 2: Set initial opacity in split-text.module.css
.splitText :global(.char) {
  opacity: 0;
}
```

---

## WARNINGS (May Cause Issues)

### 4. **Word Break Issue: "exper-iences"** — `about.module.css:42`
**Severity**: 🟡 MEDIUM  
**Impact**: Text breaks awkwardly mid-word, reducing readability

```css
.body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 680px;
}
```

**Problem**:
- No `word-break`, `overflow-wrap`, or `hyphens` CSS properties set
- Browser's default word-breaking algorithm breaks "experiences" as "exper-iences"
- This suggests the container width is too narrow for the text

**Fix Required**: Add to `.body`:
```css
.body {
  /* ... existing ... */
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}
```

Or increase `max-width` from 680px to 720px+.

---

### 5. **bodyRef.current.children May Not Target Correct Elements** — `about/index.tsx:57`
**Severity**: 🟡 MEDIUM  
**Impact**: Stagger animation may animate wrong elements or skip some

```tsx
gsap.from(bodyRef.current.children, {
  delay: 0.2,
  duration: 0.8,
  ease: 'power2.out',
  opacity: 0,
  scrollTrigger: { ... },
  stagger: 0.15,
  y: 16,
})
```

**Problem**:
- `bodyRef.current.children` returns ALL direct children of `.body` div
- Looking at the JSX (lines 94-109), the structure is:
  ```tsx
  <div ref={bodyRef} className={cn(s.body)}>
    {paragraphs.map((paragraph) => (
      <p key={paragraph} className={cn(s.paragraph, 'body-lg')}>
        {/* text with spans */}
      </p>
    ))}
  </div>
  ```
- This should work correctly — each `<p>` is a direct child
- **BUT**: If the structure changes or if there are other elements, this breaks

**Verification**: The code looks correct for the current structure, but it's fragile.

---

### 6. **ScrollTrigger toggleActions May Be Too Restrictive** — `about/index.tsx:48, 64`
**Severity**: 🟡 LOW  
**Impact**: Animation only plays once, never repeats

```tsx
scrollTrigger: {
  start: 'top 80%',
  toggleActions: 'play none none none',  // ← Only plays, never reverses
  trigger: sectionRef.current,
}
```

**Problem**:
- `toggleActions: 'play none none none'` means:
  - `play` when entering trigger zone
  - `none` when leaving (no reverse)
  - `none` when re-entering (no replay)
  - `none` when re-leaving (no reverse)
- This is correct for one-shot animations
- **BUT**: If user scrolls back up and down, animation doesn't replay

**Assessment**: This is intentional for scroll-triggered animations. Not a bug, but worth noting.

---

## VERIFIED WORKING

### ✅ 1. GSAP Context Scoping — `about/index.tsx:37-71`
```tsx
const ctx = gsap.context(() => {
  // Animation code
}, sectionRef)

return () => ctx.revert()
```

**Status**: ✅ CORRECT
- `gsap.context()` properly scopes animations to `sectionRef`
- Cleanup function `ctx.revert()` properly kills animations on unmount
- This prevents memory leaks and animation conflicts

---

### ✅ 2. SplitText Component Integration — `split-text/index.tsx`
```tsx
useImperativeHandle(
  ref,
  () => ({
    getSplitText: () => splittedRef.current,
    getNode: () => splitRef.current,
    splittedText,
  }),
  [splittedText]
)
```

**Status**: ✅ CORRECT
- Ref interface properly exposes `getSplitText()` method
- Dependency array `[splittedText]` ensures ref updates when split completes
- This allows parent to access the split instance

---

### ✅ 3. Reduced Motion Handling — `about/index.tsx:31-35`
```tsx
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

if (prefersReducedMotion) return
```

**Status**: ✅ CORRECT
- Respects user's motion preferences
- Animations are skipped for users with reduced motion enabled

---

### ✅ 4. SplitText Masking — `split-text/index.tsx:66`
```tsx
...(mask && { mask: type })
```

**Status**: ✅ CORRECT
- When `mask={true}` (passed from About), SplitText applies CSS masking
- This prevents text overflow during animations

---

## SUMMARY

| Issue | Severity | Root Cause | Fix |
|-------|----------|-----------|-----|
| ScrollTrigger not synced with Lenis | 🔴 CRITICAL | `syncScrollTrigger={false}` default | Pass `syncScrollTrigger={true}` to Lenis |
| Ref timing race condition | 🔴 CRITICAL | Parent useEffect runs before child split completes | Add dependency on `splittedText` state |
| Visual flash on animation start | 🟠 HIGH | `gsap.from()` sets initial state immediately | Use `gsap.fromTo()` or set initial CSS opacity |
| Word break issue | 🟡 MEDIUM | No CSS word-break rules | Add `overflow-wrap: break-word` |
| Fragile children selector | 🟡 MEDIUM | Direct `.children` access | Consider using data attributes |

---

## NEXT STEPS

1. **IMMEDIATE**: Enable ScrollTrigger sync in wrapper
2. **IMMEDIATE**: Fix ref timing race condition with state dependency
3. **HIGH**: Replace `gsap.from()` with `gsap.fromTo()` to eliminate flash
4. **MEDIUM**: Add CSS word-break rules
5. **OPTIONAL**: Refactor children selector for robustness

