'use client'

import dynamic from 'next/dynamic'
import {
  type ComponentProps,
  type CSSProperties,
  useEffect,
  useState,
} from 'react'
import { WebGLTunnel } from '@/webgl/components/tunnel'
import { useWebGLElement } from '@/webgl/hooks/use-webgl-element'
import {
  defaultRenderState,
  type RenderState,
  shouldHideFallback,
  transitionRenderState,
} from './render-state'

const WebGLImageTransition = dynamic(
  () =>
    import('./webgl').then(({ WebGLImageTransition }) => WebGLImageTransition),
  {
    ssr: false,
  }
)

const toDOMRect = (
  rect: {
    width?: number
    height?: number
    top?: number
    left?: number
    right?: number
    bottom?: number
    x?: number
    y?: number
  } | null
): DOMRect => ({
  top: rect?.top ?? 0,
  right: rect?.right ?? 0,
  bottom: rect?.bottom ?? 0,
  left: rect?.left ?? 0,
  width: rect?.width ?? 0,
  height: rect?.height ?? 0,
  x: rect?.x ?? 0,
  y: rect?.y ?? 0,
  toJSON: () => ({
    top: rect?.top ?? 0,
    right: rect?.right ?? 0,
    bottom: rect?.bottom ?? 0,
    left: rect?.left ?? 0,
    width: rect?.width ?? 0,
    height: rect?.height ?? 0,
    x: rect?.x ?? 0,
    y: rect?.y ?? 0,
  }),
})

type ProjectCardMediaProps = {
  className?: string | undefined
  style?: CSSProperties | undefined
  suspended?: boolean | undefined
} & Omit<
  ComponentProps<typeof WebGLImageTransition>,
  'hovered' | 'rect' | 'visible'
>

export function ProjectCardMedia({
  className,
  style,
  suspended = false,
  ...props
}: ProjectCardMediaProps) {
  const { setRef, rect, isVisible } = useWebGLElement<HTMLDivElement>()
  const [hovered, setHovered] = useState(false)
  const [renderState, setRenderState] =
    useState<RenderState>(defaultRenderState)
  const shouldHideDOMFallback =
    Boolean(props.hoverImageSrc) && shouldHideFallback(renderState)

  const resolvedStyle = shouldHideDOMFallback
    ? {
        ...style,
        backgroundColor: 'transparent',
        backgroundImage: 'none',
      }
    : style

  useEffect(() => {
    if (suspended) {
      setHovered(false)
    }
  }, [suspended])

  return (
    <div
      className={className}
      data-suspended={suspended || undefined}
      onPointerEnter={() => {
        if (!suspended) {
          setHovered(true)
        }
      }}
      onPointerLeave={() => setHovered(false)}
      ref={setRef}
      style={resolvedStyle}
    >
      <WebGLTunnel>
        <WebGLImageTransition
          onError={() =>
            setRenderState((state) => transitionRenderState(state, 'loadError'))
          }
          onLoading={() =>
            setRenderState((state) =>
              transitionRenderState(state, 'startLoading')
            )
          }
          onReady={() =>
            setRenderState((state) =>
              transitionRenderState(state, 'loadSuccess')
            )
          }
          hovered={hovered && !suspended}
          rect={toDOMRect(rect)}
          visible={isVisible && !suspended}
          {...props}
        />
      </WebGLTunnel>
    </div>
  )
}
