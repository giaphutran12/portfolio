'use client'

import { useFrame } from '@react-three/fiber'
import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import {
  ClampToEdgeWrapping,
  LinearFilter,
  type Mesh,
  type PlaneGeometry,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from 'three'
import { useWebGLRect } from '@/webgl/hooks/use-webgl-rect'
import { ImageTransitionMaterial } from './material'

type LoadedSet = {
  texture1: Texture
  texture2: Texture
  displacement: Texture
}

type WebGLImageTransitionProps = {
  rect: DOMRect
  visible?: boolean
  hovered: boolean
  imageSrc: string
  hoverImageSrc?: string
}

function configureTexture(texture: Texture) {
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  texture.wrapS = ClampToEdgeWrapping
  texture.wrapT = ClampToEdgeWrapping
  texture.needsUpdate = true
}

function getTextureSize(texture: Texture) {
  const image = texture.image as
    | {
        width?: number
        height?: number
        naturalWidth?: number
        naturalHeight?: number
      }
    | undefined

  const width = image?.naturalWidth ?? image?.width ?? 1
  const height = image?.naturalHeight ?? image?.height ?? 1

  return { width, height }
}

function loadTexture(loader: TextureLoader, src: string) {
  return new Promise<Texture>((resolve, reject) => {
    loader.load(src, resolve, undefined, reject)
  })
}

function disposeSet(set: LoadedSet | null) {
  if (!set) return
  set.texture1.dispose()
  set.texture2.dispose()
  set.displacement.dispose()
}

export function WebGLImageTransition({
  rect,
  visible = true,
  hovered,
  imageSrc,
  hoverImageSrc,
}: WebGLImageTransitionProps) {
  const [material] = useState(() => new ImageTransitionMaterial())
  const meshRef = useRef<Mesh>(null!)
  const geometryRef = useRef<PlaneGeometry>(null)
  const progressRef = useRef({ value: 0 })
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const loadedRef = useRef<LoadedSet | null>(null)

  useEffect(() => {
    const loader = new TextureLoader()
    let cancelled = false

    const nextHoverSrc = hoverImageSrc ?? imageSrc

    Promise.all([
      loadTexture(loader, imageSrc),
      loadTexture(loader, nextHoverSrc),
      loadTexture(loader, '/textures/displacement.jpg'),
    ])
      .then(([texture1, texture2, displacement]) => {
        if (cancelled) {
          texture1.dispose()
          texture2.dispose()
          displacement.dispose()
          return
        }

        texture1.colorSpace = SRGBColorSpace
        texture2.colorSpace = SRGBColorSpace

        configureTexture(texture1)
        configureTexture(texture2)
        configureTexture(displacement)

        material.texture1 = texture1
        material.texture2 = texture2
        material.displacementTexture = displacement
        material.sameImage = !hoverImageSrc

        const texture1Size = getTextureSize(texture1)
        const texture2Size = getTextureSize(texture2)

        material.imageResolution1.set(texture1Size.width, texture1Size.height)
        material.imageResolution2.set(texture2Size.width, texture2Size.height)

        disposeSet(loadedRef.current)
        loadedRef.current = { texture1, texture2, displacement }
      })
      .catch((error: unknown) => {
        console.error('[IMAGE_TRANSITION] Failed to load textures', error)
      })

    return () => {
      cancelled = true
    }
  }, [hoverImageSrc, imageSrc, material])

  useEffect(() => {
    material.planeResolution.set(
      Math.max(rect.width, 1),
      Math.max(rect.height, 1)
    )
  }, [material, rect.height, rect.width])

  useEffect(() => {
    tweenRef.current?.kill()
    tweenRef.current = gsap.to(progressRef.current, {
      value: hovered ? 1 : 0,
      duration: 1.2,
      ease: 'power2.inOut',
    })

    return () => {
      tweenRef.current?.kill()
    }
  }, [hovered])

  useEffect(() => {
    return () => {
      tweenRef.current?.kill()
      disposeSet(loadedRef.current)
      loadedRef.current = null
      geometryRef.current?.dispose()
      material.dispose()
    }
  }, [material])

  useWebGLRect(
    rect,
    ({ scale, position, rotation }) => {
      meshRef.current.position.set(position.x, position.y, position.z)
      meshRef.current.rotation.set(rotation.x, rotation.y, rotation.z)
      meshRef.current.scale.set(scale.x, scale.y, scale.z)
      meshRef.current.updateMatrix()
    },
    { visible }
  )

  useFrame(() => {
    if (!visible) return
    material.progress = progressRef.current.value
  })

  return (
    <mesh matrixAutoUpdate={false} ref={meshRef}>
      <planeGeometry ref={geometryRef} />
      <primitive object={material} />
    </mesh>
  )
}
