type DogTargetInput = {
  dogSize: number
  dogX: number
  dogY: number
  followDistance: number
  frozen: boolean
  heroVisible: boolean
  margin: number
  mouseX: number
  mouseY: number
  viewportHeight: number
  viewportWidth: number
}

type DogTargetPosition = {
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function getDogTargetPosition({
  dogSize,
  dogX,
  dogY,
  followDistance,
  frozen,
  heroVisible,
  margin,
  mouseX,
  mouseY,
  viewportHeight,
  viewportWidth,
}: DogTargetInput): DogTargetPosition {
  const maxX = viewportWidth - dogSize - margin
  const maxY = viewportHeight - dogSize - margin

  if (heroVisible) {
    return { x: maxX, y: maxY }
  }

  if (frozen) {
    return {
      x: clamp(dogX, margin, maxX),
      y: clamp(dogY, margin, maxY),
    }
  }

  const dogCenterX = dogX + dogSize / 2
  const dogCenterY = dogY + dogSize / 2
  const toDogX = dogCenterX - mouseX
  const toDogY = dogCenterY - mouseY
  const distToDog = Math.hypot(toDogX, toDogY)

  if (distToDog === 0) {
    return {
      x: clamp(dogX, margin, maxX),
      y: clamp(dogY, margin, maxY),
    }
  }

  const targetX = mouseX - dogSize / 2 + (toDogX / distToDog) * followDistance
  const targetY = mouseY - dogSize / 2 + (toDogY / distToDog) * followDistance

  return {
    x: clamp(targetX, margin, maxX),
    y: clamp(targetY, margin, maxY),
  }
}
