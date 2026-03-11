# ABOUT SECTION ANIMATION AUDIT — FINDINGS SUMMARY

**Audit Date**: 2026-03-11  
**Status**: ✅ COMPLETE  
**Files Reviewed**: 8  
**Issues Found**: 4 Critical/High, 2 Medium

---

## EXECUTIVE SUMMARY

The About section animations are **completely broken** due to **3 critical issues**:

1. **ScrollTrigger is not synced with Lenis** — animations don't fire at correct scroll positions
2. **Ref timing race condition** — parent accesses split instance before it's ready, gets null
3. **Visual flash from gsap.from()** — text disappears immediately on mount

These issues compound to create the user's observation: **"no animation of any kind"**.

---

## CRITICAL ISSUES

### 🔴 Issue #1: ScrollTrigger Not Synced with Lenis
**File**: `components/layout/wrapper/index.tsx:122`  
**Severity**: CRITICAL — Blocks all scroll-triggered animations

```tsx
// CURRENT (BROKEN)
{lenis && <Lenis root options={typeof lenis === 'object' ? lenis : {}} />}

// REQUIRED FIX
{lenis && <Lenis root options={typeof lenis === 'object' ? lenis : {}} syncScrollTrigger={true} />}
```

**Why This Breaks**:
- Lenis uses `autoRaf: false` + Tempus RAF (custom scroll loop)
- ScrollTrigger expects native scroll events to update its position cache
- Without `syncScrollTrigger={true}`, ScrollTrigger never calls `update()` on scroll
- Result: ScrollTrigger's position cache is stale, animations fire at wrong times or not at all

**Evidence**:
- `lenis/index.tsx:28` — `syncScrollTrigger = false` (default)
- `lenis/index.tsx:64` — `{syncScrollTrigger && root && <LenisScrollTriggerSync />}` (never renders)
- `scroll-trigger.tsx:24-26` — `GSAPScrollTrigger.update()` never called

---

### 🔴 Issue #2: Ref Timing Race Condition
**File**: `components/sections/about/index.tsx:38` + `components/effects/split-text/index.tsx:71-73`  
**Severity**: CRITICAL — Animation never runs

```tsx
// about/index.tsx line 38
const splitInstance = headingRef.current?.getSplitText()  // ← Returns null
const chars = splitInstance?.chars                         // ← undefined

if (chars && chars.length > 0) {
  gsap.from(chars, { ... })  // ← Never executes
}
```

**Why This Happens**:
1. SplitText's useEffect runs first (child component)
2. About's useEffect runs second (parent component)
3. **BUT**: SplitText's `onSplit` callback is async
4. About's useEffect runs BEFORE `onSplit` fires
5. `splittedRef.current` is still null
6. `getSplitText()` returns null
7. Animation condition fails, animation never runs

**Evidence**:
- `split-text/index.tsx:71-73` — `onSplit` callback sets `splittedRef.current`
- `about/index.tsx:28` — useEffect with empty dependency array `[]`
- `split-text/index.tsx:90` — useImperativeHandle depends on `[splittedText]` state

**Fix**:
```tsx
useEffect(() => {
  // ... animation setup ...
}, [headingRef.current?.splittedText])  // ← Add dependency on split completion
```

---

### 🟠 Issue #3: Visual Flash from gsap.from()
**File**: `components/sections/about/index.tsx:42-53`  
**Severity**: HIGH — Text disappears on mount

```tsx
gsap.from(chars, {
  duration: 0.6,
  opacity: 0,  // ← Sets opacity:0 immediately
  y: 20,
  scrollTrigger: { ... }
})
```

**Why This Happens**:
1. SplitText creates char elements with `opacity: 1` (default)
2. `gsap.from()` reads current state: `opacity: 1`
3. `gsap.from()` sets initial state: `opacity: 0` (the "from" value)
4. User sees: invisible text (flash of nothing)
5. When animation triggers, text fades in

**Fix**:
```tsx
// Option 1: Use gsap.fromTo()
gsap.fromTo(
  chars,
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.6, ... }
)

// Option 2: Set initial CSS
// split-text.module.css
.splitText :global(.char) {
  opacity: 0;
}
```

---

## MEDIUM ISSUES

### 🟡 Issue #4: Word Break Issue
**File**: `components/sections/about/about.module.css:42`  
**Severity**: MEDIUM — Text readability

Text breaks as "exper-iences" instead of "experiences".

**Fix**:
```css
.body {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}
```

---

### 🟡 Issue #5: Fragile Children Selector
**File**: `components/sections/about/index.tsx:57`  
**Severity**: MEDIUM — Fragile code

```tsx
gsap.from(bodyRef.current.children, { ... })
```

This works for current structure but breaks if DOM changes.

**Better approach**:
```tsx
// Add data attribute to paragraphs
<p key={paragraph} data-paragraph className={cn(s.paragraph, 'body-lg')}>

// Select by attribute
gsap.from(bodyRef.current.querySelectorAll('[data-paragraph]'), { ... })
```

---

## VERIFIED WORKING ✅

1. **GSAP Context Scoping** — Properly scopes animations and cleans up on unmount
2. **SplitText Component Integration** — Ref interface correctly exposes split instance
3. **Reduced Motion Handling** — Respects user's motion preferences
4. **SplitText Masking** — CSS masking prevents text overflow

---

## IMPACT ASSESSMENT

### Current State
- ❌ Heading animation: **BROKEN** (ref timing race)
- ❌ Body animation: **BROKEN** (ScrollTrigger not synced)
- ❌ Visual polish: **BROKEN** (flash on mount)
- ⚠️ Text readability: **DEGRADED** (word break issue)

### After Fixes
- ✅ Heading animation: Characters fade in and move up on scroll
- ✅ Body animation: Paragraphs stagger in on scroll
- ✅ Visual polish: Smooth, no flash
- ✅ Text readability: Proper word wrapping

---

## RECOMMENDED FIX ORDER

1. **IMMEDIATE** (5 min): Add `syncScrollTrigger={true}` to Lenis in wrapper
2. **IMMEDIATE** (10 min): Fix ref timing race with state dependency
3. **HIGH** (10 min): Replace `gsap.from()` with `gsap.fromTo()` or set initial CSS
4. **MEDIUM** (5 min): Add CSS word-break rules
5. **OPTIONAL** (10 min): Refactor children selector for robustness

**Total estimated fix time**: ~40 minutes

---

## FILES REVIEWED

| File | Lines | Status |
|------|-------|--------|
| `components/sections/about/index.tsx` | 113 | ❌ 3 issues |
| `components/sections/about/about.module.css` | 70 | ⚠️ 1 issue |
| `components/effects/split-text/index.tsx` | 118 | ✅ Working |
| `components/effects/split-text/split-text.module.css` | 0 | ⚠️ Empty |
| `components/layout/lenis/index.tsx` | 67 | ❌ 1 issue |
| `components/layout/lenis/scroll-trigger.tsx` | 41 | ✅ Working |
| `components/layout/wrapper/index.tsx` | 125 | ❌ 1 issue |
| `lib/utils/animation.ts` | 264 | ✅ Reference only |

---

## NEXT STEPS

1. Review this audit with the team
2. Implement fixes in order of priority
3. Test animations in browser (scroll to About section)
4. Verify no visual flash on page load
5. Verify characters animate in on scroll
6. Verify paragraphs stagger in on scroll
7. Test on mobile (word break fix)

