# QUICK FIX SNIPPETS

Copy-paste ready code to fix all issues.

---

## FIX #1: Enable ScrollTrigger Sync (5 min)

**File**: `components/layout/wrapper/index.tsx`  
**Line**: 122

### Current
```tsx
{lenis && <Lenis root options={typeof lenis === 'object' ? lenis : {}} />}
```

### Fixed
```tsx
{lenis && <Lenis root options={typeof lenis === 'object' ? lenis : {}} syncScrollTrigger={true} />}
```

---

## FIX #2: Fix Ref Timing Race (10 min)

**File**: `components/sections/about/index.tsx`  
**Lines**: 28-74

### Current
```tsx
useEffect(() => {
  gsap.registerPlugin(ScrollTrigger)

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (prefersReducedMotion) return

  const ctx = gsap.context(() => {
    const splitInstance = headingRef.current?.getSplitText()
    const chars = splitInstance?.chars

    if (chars && chars.length > 0) {
      gsap.from(chars, {
        duration: 0.6,
        ease: 'power2.out',
        opacity: 0,
        scrollTrigger: {
          start: 'top 80%',
          toggleActions: 'play none none none',
          trigger: sectionRef.current,
        },
        stagger: 0.02,
        y: 20,
      })
    }

    if (bodyRef.current) {
      gsap.from(bodyRef.current.children, {
        delay: 0.2,
        duration: 0.8,
        ease: 'power2.out',
        opacity: 0,
        scrollTrigger: {
          start: 'top 80%',
          toggleActions: 'play none none none',
          trigger: sectionRef.current,
        },
        stagger: 0.15,
        y: 16,
      })
    }
  }, sectionRef)

  return () => ctx.revert()
}, [])
```

### Fixed (Option A: Add dependency)
```tsx
const [splitReady, setSplitReady] = useState(false)

useEffect(() => {
  gsap.registerPlugin(ScrollTrigger)

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (prefersReducedMotion) return

  const ctx = gsap.context(() => {
    const splitInstance = headingRef.current?.getSplitText()
    const chars = splitInstance?.chars

    if (chars && chars.length > 0) {
      gsap.fromTo(
        chars,
        { opacity: 0, y: 20 },
        {
          duration: 0.6,
          ease: 'power2.out',
          opacity: 1,
          y: 0,
          scrollTrigger: {
            start: 'top 80%',
            toggleActions: 'play none none none',
            trigger: sectionRef.current,
          },
          stagger: 0.02,
        }
      )
    }

    if (bodyRef.current) {
      gsap.fromTo(
        bodyRef.current.children,
        { opacity: 0, y: 16 },
        {
          delay: 0.2,
          duration: 0.8,
          ease: 'power2.out',
          opacity: 1,
          y: 0,
          scrollTrigger: {
            start: 'top 80%',
            toggleActions: 'play none none none',
            trigger: sectionRef.current,
          },
          stagger: 0.15,
        }
      )
    }
  }, sectionRef)

  return () => ctx.revert()
}, [splitReady])  // ← Add dependency
```

### Fixed (Option B: Separate effect for animation)
```tsx
// Add this new effect AFTER the split completes
useEffect(() => {
  const splitInstance = headingRef.current?.getSplitText()
  if (!splitInstance?.chars) return

  gsap.registerPlugin(ScrollTrigger)

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (prefersReducedMotion) return

  const ctx = gsap.context(() => {
    const chars = splitInstance.chars

    if (chars && chars.length > 0) {
      gsap.fromTo(
        chars,
        { opacity: 0, y: 20 },
        {
          duration: 0.6,
          ease: 'power2.out',
          opacity: 1,
          y: 0,
          scrollTrigger: {
            start: 'top 80%',
            toggleActions: 'play none none none',
            trigger: sectionRef.current,
          },
          stagger: 0.02,
        }
      )
    }

    if (bodyRef.current) {
      gsap.fromTo(
        bodyRef.current.children,
        { opacity: 0, y: 16 },
        {
          delay: 0.2,
          duration: 0.8,
          ease: 'power2.out',
          opacity: 1,
          y: 0,
          scrollTrigger: {
            start: 'top 80%',
            toggleActions: 'play none none none',
            trigger: sectionRef.current,
          },
          stagger: 0.15,
        }
      )
    }
  }, sectionRef)

  return () => ctx.revert()
}, [headingRef.current?.splittedText])  // ← Trigger when split completes
```

---

## FIX #3: Eliminate Visual Flash (10 min)

**File**: `components/sections/about/index.tsx`  
**Lines**: 42-53 and 57-70

### Current (gsap.from)
```tsx
gsap.from(chars, {
  duration: 0.6,
  ease: 'power2.out',
  opacity: 0,
  scrollTrigger: {
    start: 'top 80%',
    toggleActions: 'play none none none',
    trigger: sectionRef.current,
  },
  stagger: 0.02,
  y: 20,
})
```

### Fixed (gsap.fromTo)
```tsx
gsap.fromTo(
  chars,
  { opacity: 0, y: 20 },
  {
    duration: 0.6,
    ease: 'power2.out',
    opacity: 1,
    y: 0,
    scrollTrigger: {
      start: 'top 80%',
      toggleActions: 'play none none none',
      trigger: sectionRef.current,
    },
    stagger: 0.02,
  }
)
```

### Alternative: Set Initial CSS

**File**: `components/effects/split-text/split-text.module.css`

```css
.splitText :global(.char) {
  opacity: 0;
}
```

Then keep `gsap.from()` as-is.

---

## FIX #4: Fix Word Break (5 min)

**File**: `components/sections/about/about.module.css`  
**Lines**: 38-47

### Current
```css
.body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 680px;

  @media (--desktop) {
    gap: 32px;
  }
}
```

### Fixed
```css
.body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 680px;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;

  @media (--desktop) {
    gap: 32px;
  }
}
```

---

## FIX #5: Robust Children Selector (Optional, 10 min)

**File**: `components/sections/about/index.tsx`  
**Lines**: 94-109 (JSX) and 57-70 (animation)

### Current JSX
```tsx
<div ref={bodyRef} className={cn(s.body)}>
  {paragraphs.map((paragraph) => (
    <p key={paragraph} className={cn(s.paragraph, 'body-lg')}>
      {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={part} className={cn(s.accent)}>
              {part.slice(2, -2)}
            </span>
          )
        }
        return part
      })}
    </p>
  ))}
</div>
```

### Fixed JSX (add data attribute)
```tsx
<div ref={bodyRef} className={cn(s.body)}>
  {paragraphs.map((paragraph) => (
    <p key={paragraph} data-paragraph className={cn(s.paragraph, 'body-lg')}>
      {paragraph.split(/(\*\*[^*]+\*\*)/g).map((part) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <span key={part} className={cn(s.accent)}>
              {part.slice(2, -2)}
            </span>
          )
        }
        return part
      })}
    </p>
  ))}
</div>
```

### Fixed Animation (use selector)
```tsx
if (bodyRef.current) {
  gsap.fromTo(
    bodyRef.current.querySelectorAll('[data-paragraph]'),
    { opacity: 0, y: 16 },
    {
      delay: 0.2,
      duration: 0.8,
      ease: 'power2.out',
      opacity: 1,
      y: 0,
      scrollTrigger: {
        start: 'top 80%',
        toggleActions: 'play none none none',
        trigger: sectionRef.current,
      },
      stagger: 0.15,
    }
  )
}
```

---

## TESTING CHECKLIST

After applying fixes:

- [ ] Page loads without text disappearing
- [ ] Scroll to About section
- [ ] Heading characters fade in and move up
- [ ] Body paragraphs stagger in below heading
- [ ] Text doesn't break awkwardly (no "exper-iences")
- [ ] Animation only plays once (doesn't repeat on scroll up/down)
- [ ] Works on mobile (check word wrapping)
- [ ] Respects prefers-reduced-motion setting
- [ ] No console errors

---

## VERIFICATION COMMANDS

```bash
# Check for TypeScript errors
bun run typecheck

# Run linter
bun lint

# Run tests
bun test

# Full check
bun run check
```

