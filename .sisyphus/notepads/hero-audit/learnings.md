# Hero Section Animation Audit — Learnings

## Key Findings

### GSAP Runtime Integration Pattern
- **Pattern**: GSAPRuntime must be mounted in root layout to sync GSAP ticker with Tempus RAF
- **Location**: `components/effects/gsap.tsx` provides the component
- **Usage**: Import and render in `app/layout.tsx` body (alongside `<ReactTempus />`)
- **Why**: Without GSAPRuntime, GSAP uses its own ticker (not synced to Tempus), causing timing issues

### Plugin Registration Best Practice
- **Rule**: Register GSAP plugins at MODULE LEVEL, not inside useEffect
- **Why**: Plugins must be available before any animations run
- **React Compiler Impact**: Effects may be batched, causing plugin to register after animation starts
- **Pattern**:
  ```tsx
  import gsap from 'gsap'
  import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
  
  // Module level
  gsap.registerPlugin(ScrambleTextPlugin)
  
  export function Hero() { ... }
  ```

### gsap.context() Scope Binding
- **Rule**: Always pass scope element as second argument to `gsap.context()`
- **Pattern**: `gsap.context(() => {...}, sectionRef.current)`
- **Why**: Scope isolates animations to a specific container, prevents global state pollution
- **Without Scope**: Animations may target wrong elements or fail silently

### ScrambleTextPlugin Availability
- **Status**: Premium plugin (requires Club GreenSock membership)
- **GSAP 3.14.2**: Free version includes TextPlugin, but NOT ScrambleTextPlugin
- **Import Path**: `gsap/ScrambleTextPlugin` may succeed but plugin registration fails
- **Alternative**: Use TextPlugin (free) for text animations

### CSS + GSAP Opacity Conflicts
- **Pattern**: Don't set initial opacity in CSS if GSAP will animate it
- **Why**: Double-setting creates race conditions and timing issues
- **Solution**: Let GSAP handle all animated properties via `gsap.set()` in useEffect

### Reduced Motion Handling
- **Pattern**: Check `prefers-reduced-motion` in both CSS and JavaScript
- **Consistency**: Ensure CSS and JS behavior align (both skip animations or both show static state)
- **Current Issue**: CSS shows elements, JS skips animations — inconsistent

### AnimatedGradient WebGL Dependencies
- **Requirement**: GlobalCanvas must be mounted in root layout
- **Pattern**: `<Canvas root={webgl}>` in page activates it, but GlobalCanvas must exist
- **Location**: Should be in `app/layout.tsx` after body content
- **Lazy Loading**: AnimatedGradient uses `dynamic()` import, so WebGL context must be ready

## Satus Starter Patterns

### RAF Management
- **Tool**: Tempus (RAF management library)
- **Pattern**: `<ReactTempus patch={!isDraftMode} />` in root layout
- **Integration**: Lenis, GSAP, and custom RAF hooks all sync to Tempus
- **Why**: Single RAF loop prevents jank and keeps animations in sync

### CSS Modules Convention
- **Pattern**: `import s from './component.module.css'`
- **Usage**: `className={cn(s.className, 'tailwind-classes')}`
- **Biome Rule**: Enforces this pattern via `no-relative-parent-imports`

### React Compiler Compatibility
- **Rule**: No manual memoization (useMemo, useCallback, React.memo)
- **Why**: React Compiler handles optimization automatically
- **Exception**: useRef for class instantiation to prevent infinite loops

## Debugging Tips

### Animation Not Firing
1. Check if GSAPRuntime is mounted in layout
2. Verify plugin is registered at module level
3. Check browser console for plugin registration errors
4. Verify refs are populated before useEffect runs
5. Check if `prefers-reduced-motion` is blocking animations

### WebGL Not Rendering
1. Check if GlobalCanvas is mounted in root layout
2. Verify `<Canvas root={webgl}>` is in page wrapper
3. Check GPU capability detection (may fail on some devices)
4. Look for WebGL context errors in console

### Timing Issues
1. Ensure GSAP ticker is synced via GSAPRuntime
2. Check Tempus RAF is running (ReactTempus in layout)
3. Verify Lenis is using autoRaf: false (manual RAF)
4. Check for conflicting animation libraries
