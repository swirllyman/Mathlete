import { useEffect, useRef } from 'react'

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  spin: number
  angle: number
  color: string
  shape: 0 | 1 | 2
  life: number
}

const COLORS = ['#ff6b9d', '#ffd166', '#6fe0c6', '#8fb8ff', '#c3a6ff', '#ffab73', '#b6e86a']

/**
 * Canvas confetti. `burst` is a counter: bump it to fire a new burst.
 * `intensity` scales the number of pieces (a right answer is smaller than a
 * finished level, which is smaller than a new unlock).
 */
export function Confetti({ burst, intensity = 1 }: { burst: number; intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const piecesRef = useRef<Piece[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (burst === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const count = Math.round(70 * intensity)
    // Use the laid-out CSS size, not canvas.width: on the very first burst the
    // backing store has not been sized yet and everything would land in the
    // top-left corner.
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    for (let i = 0; i < count; i++) {
      piecesRef.current.push({
        x: w * (0.5 + (Math.random() - 0.5) * 0.7),
        y: h * 0.32,
        vx: (Math.random() - 0.5) * 11,
        vy: -6 - Math.random() * 10,
        size: 6 + Math.random() * 10,
        spin: (Math.random() - 0.5) * 0.3,
        angle: Math.random() * Math.PI,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.floor(Math.random() * 3) as 0 | 1 | 2,
        life: 1,
      })
    }
  }, [burst, intensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      const pieces = piecesRef.current
      for (const p of pieces) {
        p.vy += 0.42
        p.vx *= 0.995
        p.x += p.vx
        p.y += p.vy
        p.angle += p.spin
        if (p.y > h * 0.75) p.life -= 0.02

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        if (p.shape === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else if (p.shape === 1) {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(0, -p.size / 2)
          ctx.lineTo(p.size / 2, p.size / 2)
          ctx.lineTo(-p.size / 2, p.size / 2)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
      }
      piecesRef.current = pieces.filter((p) => p.life > 0 && p.y < h + 60)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="confetti" aria-hidden="true" />
}
