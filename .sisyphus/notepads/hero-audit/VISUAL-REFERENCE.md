# Hero Section Animation Audit — Visual Reference

## Component Structure

```
app/layout.tsx (ROOT)
├── <body>
│   ├── ❌ MISSING: <GSAPRuntime />  ← CRITICAL: Not mounted
│   ├── <ReactTempus />  ✓ Present
│   ├── <RealViewport>
│   │   └── <TransformProvider>
│   │       └── {children}
│   │           └── app/page.tsx
│   │               └── <Wrapper theme="dark" webgl>
│   │                   ├── <Header />
│   │                   ├── <Canvas root={webgl}>
│   │                   │   ├── <main>
│   │                   │   │   ├── <NoiseWaves />
│   │                   │   │   ├── <Hero />  ← AUDIT TARGET
│   │                   │   │   │   ├── <AnimatedGradient />  (WebGL)
│   │                   │   │   │   ├── <h1> name (GSAP scramble)
│   │                   │   │   │   ├── <p> subtitle (GSAP opacity)
│   │                   │   │   │   └── <div> scrollIndicator (GSAP opacity)
│   │                   │   │   ├── <About />
│   │                   │   │   ├── <Projects />
│   │                   │   │   ├── <Experience />
│   │                   │   │   └── <Contact />
│   │                   │   └── </main>
│   │                   ├── <Footer />
│   │                   └── <Lenis />  ✓ Smooth scroll
│   │                       └── <LenisScrollTriggerSync />
│   │                           └── (GSAP ScrollTrigger sync)
│   └── ❌ MISSING: <GlobalCanvas />  ← WARNING: AnimatedGradient needs this
```

## Hero Component Animation Flow

```
Hero Component Render
│
├── useEffect (dependency: [name])
│   │
│   ├── ❌ gsap.registerPlugin(ScrambleTextPlugin)  [CRITICAL]
│   │   └── Should be at MODULE LEVEL, not in useEffect
│   │
│   ├── Check prefers-reduced-motion
│   │   └── If true: return (skip all animations)
│   │
│   ├── ❌ gsap.context(() => {...})  [CRITICAL]
│   │   └── Missing scope: should be gsap.context(() => {...}, sectionRef.current)
│   │
│   ├── gsap.set(subtitleRef.current, { opacity: 0 })
│   │   └── ❌ No null check [CRITICAL]
│   │
│   ├── gsap.set(scrollIndicatorRef.current, { opacity: 0 })
│   │   └── ❌ No null check [CRITICAL]
│   │
│   ├── gsap.to(nameRef.current, {
│   │   delay: 0.3,
│   │   duration: 1.5,
│   │   scrambleText: {
│   │       chars: 'アイウエオカキクケコサシスセソタチツテト!@#$%&',
│   │       revealDelay: 0.5,
│   │       speed: 0.4,
│   │       text: name,
│   │   }
│   │   └── ❌ ScrambleTextPlugin NOT in free GSAP 3.14.2 [CRITICAL]
│   │   └── ❌ No null check [CRITICAL]
│   │
│   ├── gsap.to(subtitleRef.current, {
│   │   delay: 1.8,
│   │   duration: 0.8,
│   │   opacity: 1,
│   │   └── ❌ No null check [CRITICAL]
│   │
│   ├── gsap.to(scrollIndicatorRef.current, {
│   │   delay: 2.1,
│   │   duration: 0.8,
│   │   opacity: 1,
│   │   └── ❌ No null check [CRITICAL]
│   │
│   └── return () => ctx.revert()
│
└── JSX Render
    ├── <section ref={sectionRef}>
    │   ├── <AnimatedGradient />  (WebGL background)
    │   │   └── ❌ Requires GlobalCanvas in layout [WARNING]
    │   │
    │   ├── <h1 ref={nameRef}>
    │   │   └── Scramble animation target
    │   │
    │   ├── <p ref={subtitleRef}>
    │   │   └── Opacity animation target
    │   │   └── ❌ CSS has opacity: 0 [WARNING: conflicts with GSAP]
    │   │
    │   └── <div ref={scrollIndicatorRef}>
    │       ├── <span> "Scroll" text
    │       └── <div> animated line (CSS animation)
    │           └── ✓ CSS @keyframes scrollPulse (working)
    │           └── ❌ CSS has opacity: 0 [WARNING: conflicts with GSAP]
```

## Timing Diagram

```
Timeline (seconds):
0.0s ────────────────────────────────────────────────────────────────
     │
     ├─ GSAP Context Created
     │
0.3s ├─ Name Scramble Starts
     │  ├─ Duration: 1.5s
     │  ├─ Chars: アイウエオカキクケコサシスセソタチツテト!@#$%&
     │  └─ Speed: 0.4
     │
1.8s ├─ Name Scramble Ends
     │  ├─ Subtitle Fade In Starts
     │  │  └─ Duration: 0.8s
     │  │  └─ opacity: 0 → 1
     │  │
2.1s ├─ Scroll Indicator Fade In Starts
     │  │  └─ Duration: 0.8s
     │  │  └─ opacity: 0 → 1
     │  │
2.6s ├─ Scroll Indicator Fade In Ends
     │  │
     ├─ Scroll Line Animation (CSS)
     │  └─ Continuous: 1.8s loop
     │     ├─ 0%: opacity 0.2, translateY(-5px)
     │     ├─ 50%: opacity 0.8, translateY(5px)
     │     └─ 100%: opacity 0.2, translateY(-5px)
     │
∞    └─ Continuous Loop
```

## CSS Animation States

```
.hero
├── background: radial-gradient (static)
│
.name
├── color: var(--color-secondary)
├── No animation (GSAP handles it)
│
.subtitle
├── color: var(--color-contrast)
├── opacity: 0  ❌ [WARNING: conflicts with GSAP]
├── @media (--reduced-motion)
│   └── opacity: 1  ⚠️ [Inconsistent with JS]
│
.scrollIndicator
├── opacity: 0  ❌ [WARNING: conflicts with GSAP]
├── @media (--reduced-motion)
│   └── opacity: 1  ⚠️ [Inconsistent with JS]
│
.scrollLine
├── animation: scrollPulse 1.8s ease-in-out infinite  ✓ [WORKING]
├── @media (--reduced-motion)
│   └── animation: none
│       opacity: 0.4
```

## Plugin Registration Comparison

### ❌ CURRENT (WRONG)
```tsx
// components/sections/hero/index.tsx
export function Hero() {
  useEffect(() => {
    gsap.registerPlugin(ScrambleTextPlugin)  // ❌ Inside useEffect
    // animations...
  }, [name])
}
```

### ✓ CORRECT
```tsx
// components/sections/hero/index.tsx
import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(ScrambleTextPlugin)  // ✓ Module level

export function Hero() {
  useEffect(() => {
    // animations...
  }, [name])
}
```

## gsap.context() Comparison

### ❌ CURRENT (WRONG)
```tsx
const ctx = gsap.context(() => {
  gsap.set(subtitleRef.current, { opacity: 0 })
  // animations...
})  // ❌ No scope
```

### ✓ CORRECT
```tsx
const ctx = gsap.context(() => {
  gsap.set(subtitleRef.current, { opacity: 0 })
  // animations...
}, sectionRef.current)  // ✓ Scope provided
```

## Dependency Array Comparison

### ❌ CURRENT (INCOMPLETE)
```tsx
useEffect(() => {
  // animations...
}, [name])  // ❌ Missing tagline
```

### ✓ CORRECT
```tsx
useEffect(() => {
  // animations...
}, [name, tagline])  // ✓ All dependencies included
```

## RAF Synchronization Chain

```
Tempus RAF (Main Loop)
│
├─ ReactTempus (app/layout.tsx)  ✓ Present
│  └─ Manages RAF for entire app
│
├─ Lenis (Wrapper component)  ✓ Present
│  └─ useTempus hook syncs smooth scroll
│
├─ ❌ GSAPRuntime (app/layout.tsx)  MISSING
│  └─ Should sync GSAP ticker with Tempus
│
└─ Custom RAF hooks
   └─ useFrame (in WebGL components)
```

## WebGL Context Chain

```
GlobalCanvas (should be in app/layout.tsx)  ❌ MISSING
│
├─ Canvas (React Three Fiber)
│  ├─ OrthographicCamera
│  ├─ RAF (render loop)
│  ├─ FlowmapProvider
│  │  └─ useFlowmap hook
│  │
│  └─ WebGLTunnel.Out
│     └─ Renders WebGL components
│
└─ DOMTunnel.Out
   └─ Renders DOM content

Canvas (in Wrapper)  ✓ Present
│
├─ Activates GlobalCanvas when root={webgl}
│
└─ Provides WebGLTunnel context
   └─ AnimatedGradient uses this
      └─ Renders WebGL gradient background
```

## Error Cascade

```
Issue #1: GSAPRuntime not mounted
│
├─ GSAP ticker not synced with Tempus
│  └─ Animations fire at wrong times
│
└─ Timing issues with other animations

Issue #2: ScrambleTextPlugin in useEffect
│
├─ Plugin may not be registered when animation runs
│  └─ React Compiler may batch effects
│
└─ Scramble animation fails

Issue #3: gsap.context() missing scope
│
├─ Animations not isolated to section
│  └─ Context cleanup may fail
│
└─ Potential side effects on other elements

Issue #4: Refs may be null
│
├─ If refs not populated, animations target null
│  └─ Fail silently with no error
│
└─ User sees no animation

Issue #5: ScrambleTextPlugin not in free GSAP
│
├─ Plugin registration fails silently
│  └─ No error message
│
└─ Scramble animation doesn't work
```

## Summary: What's Working vs. What's Broken

| Component | Status | Evidence |
|-----------|--------|----------|
| ScrollLine CSS animation | ✓ WORKING | CSS @keyframes scrollPulse defined correctly |
| Lenis smooth scroll | ✓ WORKING | Properly integrated with Tempus RAF |
| React Compiler setup | ✓ WORKING | No manual memoization needed |
| CSS modules | ✓ WORKING | Correct import pattern |
| Name scramble animation | ✗ BROKEN | ScrambleTextPlugin not available + plugin registration wrong |
| Subtitle fade-in | ✗ BROKEN | GSAP context missing scope + refs may be null |
| Scroll indicator fade-in | ✗ BROKEN | GSAP context missing scope + refs may be null |
| AnimatedGradient background | ⚠️ UNCERTAIN | GlobalCanvas may not be mounted |
| GSAP ticker sync | ✗ BROKEN | GSAPRuntime not mounted |

