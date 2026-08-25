import { useEffect, useRef, useState } from 'react'

/**
 * Простой хук на IntersectionObserver.
 * Возвращает [ref, inView] — inView становится true один раз,
 * когда элемент появляется в зоне видимости.
 */
export function useInView({ threshold = 0.35, once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold, once])

  return [ref, inView]
}
