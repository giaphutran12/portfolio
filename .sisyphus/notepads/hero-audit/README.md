# Hero Section Animation Audit

**Date**: March 11, 2026  
**Status**: ✗ CRITICAL ISSUES FOUND  
**Severity**: 🔴 Blocks all animations

---

## Quick Start

**Start here**: Read `SUMMARY.txt` for executive summary (2 min read)

Then choose your path:
- **Visual learner?** → `VISUAL-REFERENCE.md` (diagrams, flow charts)
- **Need details?** → `audit-report.md` (comprehensive analysis)
- **Want to fix it?** → `issues.md` (line-by-line breakdown)
- **Learning?** → `learnings.md` (patterns and best practices)

---

## Files in This Audit

| File | Purpose | Read Time |
|------|---------|-----------|
| **SUMMARY.txt** | Executive summary with root cause analysis | 2 min |
| **VISUAL-REFERENCE.md** | Component structure, flow diagrams, comparisons | 5 min |
| **audit-report.md** | Detailed findings with evidence and fixes | 8 min |
| **issues.md** | Line-by-line issue breakdown with solutions | 10 min |
| **learnings.md** | Patterns, best practices, debugging tips | 5 min |

---

## Root Cause (TL;DR)

**5 CRITICAL issues prevent animations from working:**

1. **GSAPRuntime not mounted** in `app/layout.tsx`
   - GSAP ticker not synced with Tempus RAF
   - Animations fire at wrong times or not at all

2. **ScrambleTextPlugin registered inside useEffect** (not module-level)
   - Plugin may not be available when animation runs
   - React Compiler may batch effects, causing timing issues

3. **gsap.context() missing scope reference**
   - Should be: `gsap.context(() => {...}, sectionRef.current)`
   - Currently: `gsap.context(() => {...})` (no scope)

4. **Refs used without null checks**
   - If refs not populated, animations target `null`
   - Fail silently with no error messages

5. **ScrambleTextPlugin is premium** (not in free GSAP 3.14.2)
   - Plugin registration fails silently
   - No error message, just no animation

---

## Quick Fix Checklist

### Priority 1 (Must Fix)
- [ ] Mount `<GSAPRuntime />` in `app/layout.tsx`
- [ ] Move `gsap.registerPlugin()` to module level in Hero component
- [ ] Pass `sectionRef.current` to `gsap.context()`
- [ ] Verify ScrambleTextPlugin availability (may need TextPlugin instead)

### Priority 2 (Should Fix)
- [ ] Remove CSS `opacity: 0` from `.subtitle` and `.scrollIndicator`
- [ ] Align reduced motion handling in CSS and JS
- [ ] Verify `<GlobalCanvas />` is mounted in `app/layout.tsx`
- [ ] Update useEffect dependency array to include `tagline`

### Priority 3 (Nice to Have)
- [ ] Add null checks to ref animations
- [ ] Use selector-based targeting instead of refs
- [ ] Add error handling for missing plugins

---

## Files to Modify

1. **app/layout.tsx**
   - Import and render `<GSAPRuntime />`
   - Verify `<GlobalCanvas />` is mounted

2. **components/sections/hero/index.tsx**
   - Move `gsap.registerPlugin()` to module level
   - Pass `sectionRef.current` to `gsap.context()`
   - Update useEffect dependency array
   - Add null checks to ref animations

3. **components/sections/hero/hero.module.css**
   - Remove `opacity: 0` from `.subtitle`
   - Remove `opacity: 0` from `.scrollIndicator`
   - Align reduced motion behavior with JavaScript

---

## What's Working

✓ ScrollLine CSS animation  
✓ Lenis smooth scroll integration  
✓ React Compiler compatibility  
✓ CSS module imports  

---

## What's Broken

✗ Name scramble animation (ScrambleTextPlugin issue)  
✗ Subtitle fade-in (gsap.context scope + null refs)  
✗ Scroll indicator fade-in (gsap.context scope + null refs)  
⚠️ AnimatedGradient background (GlobalCanvas may not be mounted)  
✗ GSAP ticker sync (GSAPRuntime not mounted)  

---

## Key Learnings

### GSAP Runtime Integration
- GSAPRuntime must be mounted in root layout to sync GSAP ticker with Tempus RAF
- Without it, GSAP uses its own ticker (not synced), causing timing issues

### Plugin Registration Pattern
- Register GSAP plugins at MODULE LEVEL, not inside useEffect
- React Compiler may batch effects, causing plugin to register after animation starts

### gsap.context() Scope Binding
- Always pass scope element as second argument: `gsap.context(() => {...}, sectionRef.current)`
- Scope isolates animations to a specific container

### ScrambleTextPlugin Availability
- Premium plugin (requires Club GreenSock membership)
- Free GSAP 3.14.2 does NOT include it
- Use TextPlugin (free) as alternative

### CSS + GSAP Opacity Conflicts
- Don't set initial opacity in CSS if GSAP will animate it
- Let GSAP handle all animated properties via `gsap.set()`

---

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

---

## Next Steps

1. **Read SUMMARY.txt** (2 min) to understand the issues
2. **Read VISUAL-REFERENCE.md** (5 min) to see the structure
3. **Read issues.md** (10 min) for detailed solutions
4. **Apply fixes** in order of priority
5. **Test animations** in browser
6. **Verify** all animations work as expected

---

## Questions?

Refer to:
- `audit-report.md` for comprehensive analysis
- `learnings.md` for patterns and best practices
- `VISUAL-REFERENCE.md` for diagrams and comparisons

---

**Audit completed**: March 11, 2026  
**Total issues found**: 9 (5 critical, 4 warnings)  
**Estimated fix time**: 30-45 minutes
