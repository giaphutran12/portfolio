# Portfolio Revamp — Learnings

## SplitText + ScrollTrigger Pattern

### SplitText Ref Interface
The `SplitText` component exposes an imperative ref handle with:
- `getSplitText()` → `GSAPSplitText | null` — returns the GSAP SplitText instance
- `getNode()` → `HTMLElement | null`
- `splittedText: GSAPSplitText | null`

To type it inline without importing the interface:
```tsx
const headingRef = useRef<{
  getSplitText: () => import('gsap/SplitText').SplitText | null
  getNode: () => HTMLElement | null
  splittedText: import('gsap/SplitText').SplitText | null
} | null>(null)
```

### Timing: SplitText chars available after mount
`getSplitText()` returns null until the `SplitText` component's `useEffect` fires and sets state. Since both components mount together, access chars inside `useEffect` — it works because React batches renders and both effects run in the same commit. However, if chars are null (e.g., async split), the `if (chars && chars.length > 0)` guard prevents crashes.

### ScrollTrigger Registration
Must call `gsap.registerPlugin(ScrollTrigger)` in the component's `useEffect`, not at module level, to avoid SSR issues (GSAP checks `typeof window`).

### gsap.context() Scoping
Wrap all GSAP setup in `gsap.context(() => {...}, sectionRef)` so cleanup (`ctx.revert()`) properly kills ScrollTrigger instances bound to the section.

### prefers-reduced-motion
Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and early-return before any GSAP setup. Text remains visible (no initial `opacity: 0`) because GSAP never runs `gsap.from()`.

### No @gsap/react
The project uses vanilla GSAP + `useEffect` + `gsap.context()`. No `@gsap/react` package is installed — use the Hero component pattern.

## Biome Formatter
- Biome enforces line length limits on JSX attributes and object types
- Use `bun run format` to auto-fix formatting before `bun run check`
- The `{' '}` JSX whitespace trick is sometimes reflowed by the formatter — it's fine to omit and let the natural text flow work

## CSS Modules
- Use `@media (--reduced-motion)` for motion reduction (postcss-preset-env handles the custom media query)
- `var(--color-primary)`, `var(--color-secondary)`, `var(--color-contrast)` are the design system tokens
- `color-mix(in srgb, var(--color-secondary) 50%, transparent)` for muted text colors

## WebGL image transition pattern
- For custom transitions, keep uniforms inside a class-based `ShaderMaterial` and expose typed setters (`texture1`, `texture2`, `displacementTexture`, `progress`) to avoid React-driven re-instantiation.
- Drive hover animations with `gsap.to(progressRef.current, { value, duration: 1.2, ease: 'power2.inOut' })` and sync to shader uniforms inside `useFrame()` for zero React re-renders.
- Use a GLSL `coverUv` helper with image and plane resolution uniforms to preserve image aspect ratio in DOM-synced planes.
- For single-image cards, feed the same texture into both samplers and blend in a small zoom term in shader space while still applying displacement UV offsets.
