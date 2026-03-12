# Draft: WebGL ImageTransition Feature

## Requirements (confirmed)
- Get the liquid distortion hover effect working on project cards
- Use `forceWebGL={true}` as the renderer fix (quick fix, not TSL rewrite)
- Make projects section background transparent so WebGL canvas shows through
- GIF/video support: nice-to-have, NOT required (include if easy, skip if not)

## Technical Decisions
- **Renderer**: forceWebGL={true} on GlobalCanvas — unblocks ShaderMaterial immediately
- **Visibility**: Remove opaque background from projects section — body bg already dark, same visual result
- **Scope**: Get ImageTransition working on project cards with hover effect

## Research Findings
- **WebGPU incompatibility**: ShaderMaterial (raw GLSL) doesn't work with WebGPU NodeMaterial system. forceWebGL bypasses this.
- **Visibility architecture**: GlobalCanvas at z-0, main content at z-20. Opaque section backgrounds block canvas. Hero works because it's transparent.
- **useWebGLElement**: Tracks DOM rect + IntersectionObserver. useWebGLRect converts to WebGL world-space coordinates.
- **ImageTransition pattern**: Transparent DOM div + WebGL mesh positioned via useWebGLRect at same screen position
- **Existing audit**: Full audit in `.sisyphus/notepads/projects-webgl-audit/` with implementation guide

## Open Questions
- Test strategy: TDD / tests-after / none?

## Scope Boundaries
- INCLUDE: forceWebGL fix, section bg fix, ImageTransition on project cards, hover effect
- INCLUDE (nice-to-have): gif/video texture support if straightforward
- EXCLUDE: TSL NodeMaterial rewrite (future work), WebGPU support
