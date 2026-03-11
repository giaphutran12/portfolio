# DETAILED TECHNICAL ANALYSIS

## Issue #1: ScrollTrigger Sync Breakdown

### The Problem Chain

1. **Wrapper renders Lenis without sync** (`wrapper/index.tsx:122`)
   ```tsx
   {lenis && <Lenis root options={typeof lenis === 'object' ? lenis : {}} />}
   // Missing: syncScrollTrigger={true}
   ```

2. **Lenis defaults to no sync** (`lenis/index.tsx:28`)
   ```tsx
   export function Lenis({
     root,
     options,
     syncScrollTrigger = false,  // ← DEFAULT IS FALSE
   }: LenisProps) {
   ```

3. **LenisScrollTriggerSync never renders** (`lenis/index.tsx:64`)
   ```tsx
   {syncScrollTrigger && root && <LenisScrollTriggerSync />}
   // Condition is FALSE, so this component is NEVER mounted
   ```

4. **ScrollTrigger.update() never called on scroll** (`scroll-trigger.tsx:24-26`)
   ```tsx
   const handleUpdate = useEffectEvent(() => {
     GSAPScrollTrigger.update()  // ← NEVER CALLED
   })
   ```

### Why This Breaks Animations

- Lenis provides smooth scrolling via `autoRaf: false` + Tempus RAF integration
- ScrollTrigger is a GSAP plugin that watches scroll position to trigger animations
- Without `ScrollTrigger.update()` being called on every Lenis scroll event, ScrollTrigger's internal scroll position cache becomes stale
- When About section scrolls into view, ScrollTrigger doesn't know the correct scroll position
- Animation trigger fires at wrong time or not at all

### Evidence from Code

**Lenis setup** (`lenis/index.tsx:35-39`):
```tsx
useTempus((time: number) => {
  if (lenisRef.current?.lenis) {
    lenisRef.current.lenis.raf(time)  // ← Lenis updates via Tempus
  }
})
```

Lenis is being driven by Tempus RAF, NOT by browser's native scroll events.

**ScrollTrigger expects native scroll events** (GSAP docs):
- ScrollTrigger listens to `scroll` events on window/element
- Lenis with `autoRaf: false` doesn't fire scroll events
- ScrollTrigger's position cache becomes out of sync

### The Fix

```tsx
// wrapper/index.tsx line 122
{lenis && (
  <Lenis 
    root 
    options={typeof lenis === 'object' ? lenis : {}} 
    syncScrollTrigger={true}  // ← ADD THIS
  />
)}
```

This enables the LenisScrollTriggerSync component, which calls `GSAPScrollTrigger.update()` on every Lenis scroll event.

---

## Issue #2: Ref Timing Race Condition

### The Execution Order

**React's useEffect execution order** (from React docs):
1. Child component effects run first
2. Parent component effects run second
3. Cleanup functions run in reverse order

**In this case**:

```
Mount phase:
1. SplitText component mounts
   - useEffect hook (line 45) registers
2. About component mounts
   - useEffect hook (line 28) registers
3. Browser paints
4. useEffect callbacks execute:
   - SplitText's useEffect runs first (child)
   - About's useEffect runs second (parent)
```

### The Race Condition

**SplitText's useEffect** (`split-text/index.tsx:45-80`):
```tsx
useEffect(() => {
  // ... setup ...
  const split = GSAPSplitText.create(findDeepestElement(splitRef.current), {
    type,
    ...(mask && { mask: type }),
    autoSplit: true,
    wordsClass: 'word',
    linesClass: 'line',
    charsClass: 'char',
    onSplit: (splitted) => {
      splittedRef.current = splitted  // ← Updates ref
      setSplittedText(splitted)       // ← Updates state
    },
  })
  // ...
}, [type, mask])
```

**About's useEffect** (`about/index.tsx:28-74`):
```tsx
useEffect(() => {
  gsap.registerPlugin(ScrollTrigger)
  // ... setup ...
  const ctx = gsap.context(() => {
    const splitInstance = headingRef.current?.getSplitText()  // ← Accesses ref
    const chars = splitInstance?.chars
    
    if (chars && chars.length > 0) {
      gsap.from(chars, { ... })  // ← Animation only runs if chars exist
    }
    // ...
  }, sectionRef)
  
  return () => ctx.revert()
}, [])  // ← Empty dependency array
```

### Why This Fails

1. Both useEffect callbacks are registered synchronously during render
2. React executes them in order: SplitText first, then About
3. **BUT**: SplitText's `onSplit` callback is async
4. About's useEffect runs IMMEDIATELY, before `onSplit` fires
5. `headingRef.current?.getSplitText()` returns `null` because `splittedRef.current` hasn't been set yet
6. `chars` is undefined
7. Animation condition `if (chars && chars.length > 0)` is FALSE
8. **Animation never runs**

### Proof from Code

The `useImperativeHandle` dependency array (`split-text/index.tsx:90`):
```tsx
useImperativeHandle(
  ref,
  () => ({
    getSplitText: () => splittedRef.current,
    getNode: () => splitRef.current,
    splittedText,
  }),
  [splittedText]  // ← Dependency on state
)
```

This shows that the ref's return value depends on `splittedText` state, which is only set in the `onSplit` callback.

### The Fix

**Option 1: Add state dependency to About's useEffect**
```tsx
useEffect(() => {
  // ... setup code ...
  
  const splitInstance = headingRef.current?.getSplitText()
  const chars = splitInstance?.chars
  
  if (chars && chars.length > 0) {
    gsap.from(chars, { ... })
  }
}, [headingRef.current?.splittedText])  // ← Add dependency
```

**Option 2: Use a separate effect for animation**
```tsx
const [splitReady, setSplitReady] = useState(false)

// First effect: wait for split
useEffect(() => {
  const checkSplit = () => {
    if (headingRef.current?.getSplitText()) {
      setSplitReady(true)
    }
  }
  
  const interval = setInterval(checkSplit, 10)
  return () => clearInterval(interval)
}, [])

// Second effect: animate when ready
useEffect(() => {
  if (!splitReady) return
  
  const ctx = gsap.context(() => {
    const chars = headingRef.current?.getSplitText()?.chars
    if (chars?.length) {
      gsap.from(chars, { ... })
    }
  }, sectionRef)
  
  return () => ctx.revert()
}, [splitReady])
```

---

## Issue #3: Visual Flash from gsap.from()

### How gsap.from() Works

```tsx
gsap.from(chars, {
  duration: 0.6,
  opacity: 0,  // ← "from" value
  y: 20,
  scrollTrigger: { ... }
})
```

**Execution**:
1. GSAP reads current DOM state: `opacity: 1` (default), `y: 0` (default)
2. GSAP sets initial state: `opacity: 0`, `y: 20` (the "from" values)
3. GSAP creates animation: animate FROM `{opacity: 0, y: 20}` TO `{opacity: 1, y: 0}`
4. ScrollTrigger waits for trigger point
5. When trigger fires, animation plays

### The Flash

**Timeline**:
```
T0: SplitText creates chars with default styles
    - opacity: 1 (inherited from parent)
    - transform: none

T1: About's useEffect runs
    - gsap.from() initializes
    - GSAP sets opacity: 0 on all chars
    - GSAP sets y: 20 on all chars

T2: Browser paints
    - User sees: invisible text (opacity: 0)

T3: User scrolls to trigger point
    - ScrollTrigger fires
    - Animation plays: opacity 0 → 1, y 20 → 0
    - User sees: text fading in and moving up
```

**But if user hasn't scrolled yet**:
```
T0-T2: User sees invisible text (flash of nothing)
       This is jarring and breaks the experience
```

### Why This Happens

The SplitText component doesn't set initial opacity:

```tsx
// split-text/index.tsx line 107-117
return (
  <Tag
    className={cn(s.splitText, className)}
    ref={splitRef}
    style={{
      opacity: willAppear ? 0 : 1,  // ← Only if willAppear=true
    }}
  >
    {children}
  </Tag>
)
```

And `split-text.module.css` is empty:
```css
// split-text.module.css
(empty file)
```

So chars inherit `opacity: 1` from parent, then GSAP immediately sets them to `opacity: 0`.

### The Fix

**Option 1: Use gsap.fromTo()**
```tsx
gsap.fromTo(
  chars,
  { opacity: 0, y: 20 },  // from state
  {                        // to state
    duration: 0.6,
    ease: 'power2.out',
    opacity: 1,
    y: 0,
    scrollTrigger: { ... },
    stagger: 0.02,
  }
)
```

**Option 2: Set initial CSS opacity**
```css
/* split-text.module.css */
.splitText :global(.char) {
  opacity: 0;
}
```

Then use `gsap.from()` as-is.

**Option 3: Use autoAlpha**
```tsx
gsap.from(chars, {
  duration: 0.6,
  autoAlpha: 0,  // opacity + visibility
  y: 20,
  scrollTrigger: { ... },
  stagger: 0.02,
})
```

---

## Issue #4: Word Break Issue

### Current CSS
```css
.body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 680px;
}
```

### The Problem

Text: "Crafting digital experiences with intention."

At 680px width, the word "experiences" doesn't fit on the line, so the browser breaks it:
- "exper-" on one line
- "iences" on the next

This is the browser's default hyphenation behavior.

### The Fix

```css
.body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 680px;
  
  /* Prevent awkward breaks */
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}
```

Or increase max-width:
```css
.body {
  max-width: 720px;  /* or 740px */
}
```

---

## Summary Table

| Issue | Root Cause | Symptom | Fix |
|-------|-----------|---------|-----|
| ScrollTrigger not synced | `syncScrollTrigger={false}` | Animations don't fire or fire at wrong time | Add `syncScrollTrigger={true}` to Lenis |
| Ref timing race | Parent useEffect runs before child split completes | `chars` is null, animation never runs | Add state dependency to useEffect |
| Visual flash | `gsap.from()` sets opacity:0 immediately | Text disappears before animation | Use `gsap.fromTo()` or set initial CSS |
| Word break | No CSS word-break rules | "exper-iences" breaks awkwardly | Add `overflow-wrap: break-word` |


---

## GSAP OFFICIAL INTEGRATION PATTERNS (Research Confirmed)

### From GSAP Documentation & Community Best Practices

The research confirms all identified issues and provides official guidance:

#### Pattern 1: Build Tweens Inside onSplit()
```ts
const split = SplitText.create(titleRef.current, {
  type: "words,chars",
  autoSplit: true,
  onSplit(self) {
    return gsap.from(self.chars, {
      yPercent: 100,
      opacity: 0,
      stagger: 0.02,
      ease: "power2.out",
      scrollTrigger: { trigger: titleRef.current, start: "top 80%" },
    });
  },
});
```

**Why this matters**: 
- SplitText can re-split when fonts load or layout changes
- Building tweens inside `onSplit()` ensures they're always in sync
- Current code builds tweens in parent useEffect, which can access stale `chars` array

#### Pattern 2: Use useGSAP Hook (or gsap.context)
```ts
useGSAP(() => {
  // All GSAP code here
  const split = SplitText.create(...)
  return () => split.revert();
}, { scope: containerRef });
```

**Why this matters**:
- Ensures cleanup on unmount
- Scopes selectors to container
- Prevents memory leaks

#### Pattern 3: Prevent Flash with Initial CSS
```css
.splitText :global(.char) {
  opacity: 0;
  visibility: hidden;
}
```

Then reveal with animation. This prevents the "visible → hidden → animated" flash.

#### Pattern 4: Lenis + ScrollTrigger Sync
```ts
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

**Why this matters**:
- Lenis smooth scroll updates on RAF, not native scroll events
- ScrollTrigger needs `update()` called on every scroll frame
- Without this, ScrollTrigger's position cache lags behind actual scroll

### Current Code vs. Best Practices

| Aspect | Current | Best Practice | Status |
|--------|---------|----------------|--------|
| Build tweens in onSplit() | ❌ No | ✅ Yes | ISSUE #2 |
| Use gsap.context/useGSAP | ✅ Yes | ✅ Yes | ✅ OK |
| Initial CSS opacity | ❌ No | ✅ Yes | ISSUE #3 |
| Lenis + ScrollTrigger sync | ❌ No | ✅ Yes | ISSUE #1 |

---

