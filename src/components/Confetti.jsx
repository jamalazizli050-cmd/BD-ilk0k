import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

/* =========================================================
   КОНФЕТТИ НА CANVAS
   Сдержанное: акцентный лайм + белый + серый, ~90 частиц,
   один залп, сам себя останавливает. Без бесконечных циклов.
   Запускается пропом fire (false -> true).
   ========================================================= */
const COLORS = ['#c8f24e', '#e9ebf1', '#9aa2b4', '#c8f24e']

export default function Confetti({ fire, count = 90, originY = 0.32 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const partsRef = useRef([])
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!fire || reduced) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const { width: W, height: H } = canvas.getBoundingClientRect()
    const ox = W / 2
    const oy = H * originY

    partsRef.current = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.1
      const speed = 5 + Math.random() * 8
      return {
        x: ox + (Math.random() - 0.5) * W * 0.35,
        y: oy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed * 1.15,
        vy: Math.sin(angle) * speed,
        w: 4 + Math.random() * 5,
        h: 7 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1,
      }
    })

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      let alive = 0

      for (const p of partsRef.current) {
        p.vy += 0.22           // гравитация
        p.vx *= 0.992          // сопротивление
        p.vy *= 0.992
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        if (p.y > H * 0.62) p.life -= 0.022

        if (p.life <= 0 || p.y > H + 40) continue
        alive++

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (alive > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, W, H)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [fire, count, originY, reduced])

  if (reduced) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  )
}
