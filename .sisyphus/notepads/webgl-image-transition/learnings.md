# Learnings

## 2026-03-12 Session Start
- forceWebGL is already set in lib/features/index.tsx:58
- Projects section is a SERVER component — ImageTransition is a client component that can be imported directly (Next.js client component boundary)
- Body bg is var(--color-primary) = #0a0a08 — same as section bg, so making section transparent has zero visual change
- Tailwind v4 z-index: only z-0, z-10, z-20, z-30, z-40, z-50, z-auto — custom values need bracket syntax z-[1]
- CSS modules imported as `s` (enforced by CLAUDE.md)
- No manual memoization — React Compiler handles it
- import type for type-only imports (verbatimModuleSyntax)
- Biome enforces sorted Tailwind classes
