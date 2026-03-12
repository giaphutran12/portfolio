'use client'

import dynamic from 'next/dynamic'
import { type ComponentProps, type CSSProperties, useState } from 'react'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { WebGLTunnel } from '@/webgl/components/tunnel'
import { useWebGLElement } from '@/webgl/hooks/use-webgl-element'

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

type ImageTransitionProps = {
  className?: string | undefined
  style?: CSSProperties | undefined
} & Omit<
  ComponentProps<typeof WebGLImageTransition>,
  'hovered' | 'rect' | 'visible'
>

export function ImageTransition({
  className,
  style,
  ...props
}: ImageTransitionProps) {
  const { setRef, rect, isVisible } = useWebGLElement<HTMLDivElement>()
  const { isWebGL } = useDeviceDetection()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className={className}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      ref={setRef}
      style={
        isWebGL
          ? {
              ...style,
              backgroundColor: 'transparent',
              backgroundImage: 'none',
            }
          : style
      }
    >
      <WebGLTunnel>
        <WebGLImageTransition
          hovered={hovered}
          rect={toDOMRect(rect)}
          visible={isVisible}
          {...props}
        />
      </WebGLTunnel>
    </div>
  )
}
