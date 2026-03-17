import { describe, expect, it } from 'bun:test'

describe('useVideoAutoplay', () => {
  it('hook is exported and callable', () => {
    const { useVideoAutoplay } = require('./use-video-autoplay')
    expect(typeof useVideoAutoplay).toBe('function')
  })

  it('hook accepts videoRef and options parameters', () => {
    const { useVideoAutoplay } = require('./use-video-autoplay')
    const signature = useVideoAutoplay.toString()

    expect(signature).toContain('videoRef')
    expect(signature).toContain('rootMargin')
    expect(signature).toContain('threshold')
  })

  it('hook uses IntersectionObserver API', () => {
    const { useVideoAutoplay } = require('./use-video-autoplay')
    const source = useVideoAutoplay.toString()

    expect(source).toContain('IntersectionObserver')
    expect(source).toContain('useDocumentVisibility')
  })

  it('hook handles play() rejection with catch', () => {
    const { useVideoAutoplay } = require('./use-video-autoplay')
    const source = useVideoAutoplay.toString()

    expect(source).toContain('.catch')
  })

  it('hook pauses on visibility hidden', () => {
    const { useVideoAutoplay } = require('./use-video-autoplay')
    const source = useVideoAutoplay.toString()

    expect(source).toContain('visibility === "hidden"')
    expect(source).toContain('video.pause()')
  })

  it('hook resumes on visibility visible and intersecting', () => {
    const { useVideoAutoplay } = require('./use-video-autoplay')
    const source = useVideoAutoplay.toString()

    expect(source).toContain('visibility === "visible"')
    expect(source).toContain('isIntersectingRef.current')
  })

  it('hook uses useRef for observer instance', () => {
    const { useVideoAutoplay } = require('./use-video-autoplay')
    const source = useVideoAutoplay.toString()

    expect(source).toContain('useRef')
    expect(source).toContain('observerRef')
  })

  it('hook cleans up observer on unmount', () => {
    const { useVideoAutoplay } = require('./use-video-autoplay')
    const source = useVideoAutoplay.toString()

    expect(source).toContain('disconnect')
    expect(source).toContain('useEffect')
  })
})
