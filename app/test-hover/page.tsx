import { HoverImageReveal } from '@/components/effects/hover-image-reveal'

export default function TestHoverPage() {
  return (
    <div style={{ padding: '200px', display: 'flex', gap: '100px' }}>
      <HoverImageReveal
        src="/hover-previews/headstarter.png"
        alt="Test preview"
      >
        <div
          style={{
            padding: '40px',
            background: '#333',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Hover me
        </div>
      </HoverImageReveal>
      <HoverImageReveal src="/hover-previews/tinyfish.png" alt="Test preview 2">
        <div
          style={{
            padding: '40px',
            background: '#555',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Hover me too
        </div>
      </HoverImageReveal>
    </div>
  )
}
