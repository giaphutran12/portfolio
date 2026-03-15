'use client'

import cn from 'clsx'
import { useEffect, useRef } from 'react'

import s from './noise-waves.module.css'

// Perlin 2D noise — ported from AntoineW/AW-2025-Portfolio Noise.js (seedable, self-contained)

class Grad {
  x: number
  y: number
  z: number

  constructor(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  dot2(x: number, y: number) {
    return this.x * x + this.y * y
  }

  dot3(x: number, y: number, z: number) {
    return this.x * x + this.y * y + this.z * z
  }
}

class Noise {
  private grad3: Grad[]
  private p: number[]
  private perm: number[]
  private gradP: Grad[]

  constructor(seed = 0) {
    this.grad3 = [
      new Grad(1, 1, 0),
      new Grad(-1, 1, 0),
      new Grad(1, -1, 0),
      new Grad(-1, -1, 0),
      new Grad(1, 0, 1),
      new Grad(-1, 0, 1),
      new Grad(1, 0, -1),
      new Grad(-1, 0, -1),
      new Grad(0, 1, 1),
      new Grad(0, -1, 1),
      new Grad(0, 1, -1),
      new Grad(0, -1, -1),
    ]

    this.p = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
      120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177,
      33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
      71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211,
      133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25,
      63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
      135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
      226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206,
      59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248,
      152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
      39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
      246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241,
      81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157,
      184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
      222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
    ]

    this.perm = new Array<number>(512)
    this.gradP = new Array<Grad>(512)

    this.seed(seed)
  }

  seed(seed: number) {
    let s = seed > 0 && seed < 1 ? seed * 65536 : seed

    s = Math.floor(s)
    if (s < 256) {
      s |= s << 8
    }

    for (let i = 0; i < 256; i++) {
      let v: number
      if (i & 1) {
        v = this.p[i]! ^ (s & 255)
      } else {
        v = this.p[i]! ^ ((s >> 8) & 255)
      }

      this.perm[i] = this.perm[i + 256] = v
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12]!
    }
  }

  fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b
  }

  perlin2(x: number, y: number) {
    let X = Math.floor(x)
    let Y = Math.floor(y)

    const fx = x - X
    const fy = y - Y

    X &= 255
    Y &= 255

    const n00 = this.gradP[X + this.perm[Y]!]!.dot2(fx, fy)
    const n01 = this.gradP[X + this.perm[Y + 1]!]!.dot2(fx, fy - 1)
    const n10 = this.gradP[X + 1 + this.perm[Y]!]!.dot2(fx - 1, fy)
    const n11 = this.gradP[X + 1 + this.perm[Y + 1]!]!.dot2(fx - 1, fy - 1)

    const u = this.fade(fx)

    return this.lerp(
      this.lerp(n00, n10, u),
      this.lerp(n01, n11, u),
      this.fade(fy)
    )
  }
}

interface Point {
  x: number
  y: number
  wave: { x: number; y: number }
  cursor: { x: number; y: number; vx: number; vy: number }
}

interface MouseState {
  x: number
  y: number
  lx: number
  ly: number
  sx: number
  sy: number
  v: number
  vs: number
  a: number
  set: boolean
}

interface NoiseWavesProps {
  color?: string
  xGap?: number
  yGap?: number
  waveAmplitudeX?: number
  waveAmplitudeY?: number
  className?: string
}

export function NoiseWaves({
  color = 'currentColor',
  xGap = 10,
  yGap = 32,
  waveAmplitudeX = 32,
  waveAmplitudeY = 16,
  className,
}: NoiseWavesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const noiseRef = useRef<Noise | null>(null)
  const linesRef = useRef<Point[][]>([])
  const pathsRef = useRef<SVGPathElement[]>([])
  const mouseRef = useRef<MouseState>({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  })
  const rafRef = useRef(0)
  const boundingRef = useRef({ left: 0, top: 0, width: 0, height: 0 })

  if (!noiseRef.current) {
    noiseRef.current = new Noise(Math.random())
  }

  useEffect(() => {
    const container = containerRef.current
    const svg = svgRef.current
    if (!(container && svg)) return

    const noise = noiseRef.current!

    function setSize() {
      const rect = container!.getBoundingClientRect()
      boundingRef.current = {
        left: rect.left,
        top: rect.top,
        width: container!.clientWidth,
        height: container!.clientHeight,
      }
      svg!.setAttribute('width', String(boundingRef.current.width))
      svg!.setAttribute('height', String(boundingRef.current.height))
    }

    function setLines() {
      const { width, height } = boundingRef.current

      for (const path of pathsRef.current) {
        path.remove()
      }
      pathsRef.current = []
      linesRef.current = []

      const oWidth = width + 200
      const oHeight = height + 30
      const totalLines = Math.ceil(oWidth / xGap)
      const totalPoints = Math.ceil(oHeight / yGap)

      const xStart = (width - xGap * totalLines) / 2
      const yStart = (height - yGap * totalPoints) / 2

      for (let i = 0; i <= totalLines; i++) {
        const points: Point[] = []

        for (let j = 0; j <= totalPoints; j++) {
          points.push({
            x: xStart + xGap * i,
            y: yStart + yGap * j,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          })
        }

        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        )
        path.setAttribute('fill', 'none')
        path.setAttribute('stroke', color)
        path.setAttribute('stroke-width', '1')

        svg!.appendChild(path)
        pathsRef.current.push(path)
        linesRef.current.push(points)
      }
    }

    function movePoints(time: number) {
      const mouse = mouseRef.current
      const isMobileViewport = boundingRef.current.width < 800

      for (const points of linesRef.current) {
        for (const p of points) {
          const move =
            noise.perlin2(
              (p.x + time * 0.0125) * 0.002,
              (p.y + time * 0.005) * 0.0015
            ) * 12
          p.wave.x = Math.cos(move) * waveAmplitudeX
          p.wave.y = Math.sin(move) * waveAmplitudeY

          const dx = p.x - mouse.sx
          const dy = p.y - mouse.sy
          const dist = Math.hypot(dx, dy)
          const limit = Math.max(isMobileViewport ? 75 : 200, mouse.vs)

          if (dist < limit) {
            const s = 1 - dist / limit
            const f = Math.cos(dist * 0.001) * s

            const pushX = (p.x - mouse.sx) / (dist || 1)
            const pushY = (p.y - mouse.sy) / (dist || 1)
            const velocityBoost = 1 + mouse.vs * 0.02
            const baseForce = f * (isMobileViewport ? 5 : 12) * velocityBoost

            p.cursor.vx += pushX * baseForce
            p.cursor.vy += pushY * baseForce
          }

          p.cursor.vx += (0 - p.cursor.x) * 0.004
          p.cursor.vy += (0 - p.cursor.y) * 0.004
          p.cursor.vx *= 0.94
          p.cursor.vy *= 0.94
          p.cursor.x += p.cursor.vx * 2
          p.cursor.y += p.cursor.vy * 2
          const maxDisp = isMobileViewport ? 150 : 400
          p.cursor.x = Math.min(maxDisp, Math.max(-maxDisp, p.cursor.x))
          p.cursor.y = Math.min(maxDisp, Math.max(-maxDisp, p.cursor.y))
        }
      }
    }

    function moved(point: Point, withCursorForce: boolean) {
      let x = point.x + point.wave.x + (withCursorForce ? point.cursor.x : 0)
      let y = point.y + point.wave.y + (withCursorForce ? point.cursor.y : 0)
      x = Math.round(x * 10) / 10
      y = Math.round(y * 10) / 10
      return { x, y }
    }

    function drawLines() {
      const lines = linesRef.current
      const paths = pathsRef.current

      for (let li = 0; li < lines.length; li++) {
        const points = lines[li]!
        const p0 = moved(points[0]!, false)
        let d = `M ${p0.x} ${p0.y}`

        for (let pi = 0; pi < points.length; pi++) {
          const isLast = pi === points.length - 1
          const p = moved(points[pi]!, !isLast)
          d += `L ${p.x} ${p.y}`
        }

        paths[li]!.setAttribute('d', d)
      }
    }

    function tick(time: number) {
      const mouse = mouseRef.current

      mouse.sx += (mouse.x - mouse.sx) * 0.1
      mouse.sy += (mouse.y - mouse.sy) * 0.1

      const dx = mouse.x - mouse.lx
      const dy = mouse.y - mouse.ly
      const dist = Math.hypot(dx, dy)

      mouse.v = dist
      mouse.vs += (dist - mouse.vs) * 0.1
      mouse.vs = Math.min(100, mouse.vs)

      mouse.lx = mouse.x
      mouse.ly = mouse.y

      mouse.a = Math.atan2(dy, dx)

      movePoints(time)
      drawLines()

      rafRef.current = requestAnimationFrame(tick)
    }

    function onMouseMove(e: MouseEvent) {
      updateMousePosition(e.clientX, e.clientY)
    }

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0]
      if (!touch) return
      updateMousePosition(touch.clientX, touch.clientY)
    }

    function updateMousePosition(x: number, y: number) {
      const mouse = mouseRef.current
      mouse.x = x - boundingRef.current.left
      mouse.y = y - boundingRef.current.top

      if (!mouse.set) {
        mouse.sx = mouse.x
        mouse.sy = mouse.y
        mouse.lx = mouse.x
        mouse.ly = mouse.y
        mouse.set = true
      }
    }

    setSize()
    setLines()
    drawLines()

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReducedMotion) {
      const resizeObs = new ResizeObserver(() => {
        setSize()
        setLines()
        drawLines()
      })
      resizeObs.observe(container)

      return () => {
        resizeObs.disconnect()
        for (const path of pathsRef.current) {
          path.remove()
        }
        pathsRef.current = []
        linesRef.current = []
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    const resizeObs = new ResizeObserver(() => {
      setSize()
      setLines()
      drawLines()
    })
    resizeObs.observe(container)

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      cancelAnimationFrame(rafRef.current)
      resizeObs.disconnect()
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)

      for (const path of pathsRef.current) {
        path.remove()
      }
      pathsRef.current = []
      linesRef.current = []
    }
  }, [color, xGap, yGap, waveAmplitudeX, waveAmplitudeY])

  return (
    <div
      ref={containerRef}
      className={cn(s.container, className)}
      aria-hidden="true"
    >
      <svg ref={svgRef} className="block h-full w-full" />
    </div>
  )
}
