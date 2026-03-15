export type RenderState = 'fallback' | 'loading' | 'ready' | 'error'

export type RenderStateEvent = 'startLoading' | 'loadSuccess' | 'loadError'

export const defaultRenderState: RenderState = 'fallback'

export function transitionRenderState(
  currentState: RenderState,
  event: RenderStateEvent
): RenderState {
  switch (event) {
    case 'startLoading':
      return 'loading'
    case 'loadSuccess':
      return 'ready'
    case 'loadError':
      return 'error'
    default:
      return currentState
  }
}

export function shouldHideFallback(state: RenderState) {
  return state === 'ready'
}
