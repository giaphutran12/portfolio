import { describe, expect, it } from 'bun:test'
import {
  defaultRenderState,
  shouldHideFallback,
  transitionRenderState,
} from './render-state'

describe('ImageTransition render state', () => {
  it('initial state is fallback', () => {
    expect(defaultRenderState).toBe('fallback')
    expect(shouldHideFallback(defaultRenderState)).toBeFalse()
  })

  it('follows fallback -> loading -> ready on successful texture load', () => {
    const loadingState = transitionRenderState('fallback', 'startLoading')
    const readyState = transitionRenderState(loadingState, 'loadSuccess')

    expect(loadingState).toBe('loading')
    expect(shouldHideFallback(loadingState)).toBeFalse()
    expect(readyState).toBe('ready')
    expect(shouldHideFallback(readyState)).toBeTrue()
  })

  it('follows fallback -> loading -> error and keeps fallback visible', () => {
    const loadingState = transitionRenderState('fallback', 'startLoading')
    const errorState = transitionRenderState(loadingState, 'loadError')

    expect(loadingState).toBe('loading')
    expect(shouldHideFallback(loadingState)).toBeFalse()
    expect(errorState).toBe('error')
    expect(shouldHideFallback(errorState)).toBeFalse()
  })
})
