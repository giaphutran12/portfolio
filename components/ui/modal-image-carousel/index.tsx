'use client'

import cn from 'clsx'
import useEmblaCarousel from 'embla-carousel-react'
import { type ComponentProps, type KeyboardEvent, useRef } from 'react'
import { Image } from '@/components/ui/image'
import s from './modal-image-carousel.module.css'

interface CarouselImage {
  src: string
  alt: string
}

interface ModalImageCarouselProps extends ComponentProps<'div'> {
  images: readonly CarouselImage[]
}

export function ModalImageCarousel({
  images,
  className,
  ...props
}: ModalImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const apiRef = useRef(emblaApi)
  apiRef.current = emblaApi

  const scrollPrev = () => apiRef.current?.scrollPrev()
  const scrollNext = () => apiRef.current?.scrollNext()

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      scrollNext()
    }
  }

  if (images.length === 0) return null

  return (
    <div
      className={cn(s.root, className)}
      data-testid="carousel-root"
      {...props}
    >
      <div
        className={cn(s.viewport)}
        ref={emblaRef}
        data-testid="carousel-viewport"
      >
        <div className={cn(s.container)} data-testid="carousel-container">
          {images.map((image) => (
            <div className={cn(s.slide)} key={image.src}>
              <Image
                src={image.src}
                alt={image.alt}
                aspectRatio={16 / 9}
                className={cn(s.image)}
                objectFit="contain"
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 ? (
        <div
          className={cn(s.controls)}
          role="toolbar"
          aria-label="Gallery navigation"
          onKeyDown={handleKeyDown}
        >
          <button
            type="button"
            className={cn(s.navButton)}
            onClick={scrollPrev}
            aria-label="Previous image"
            data-testid="carousel-prev"
          >
            <svg
              className={cn(s.navIcon)}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className={cn(s.navButton)}
            onClick={scrollNext}
            aria-label="Next image"
            data-testid="carousel-next"
          >
            <svg
              className={cn(s.navIcon)}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  )
}
