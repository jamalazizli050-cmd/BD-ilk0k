import { useCallback, useState } from 'react'
import Hero from './components/Hero'
import Game from './components/Game'
import Reveal from './components/Reveal'
import Footer from './components/Footer'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'

/* =========================================================
   КОРЕНЬ ПРИЛОЖЕНИЯ
   Порядок секций: Hero -> Game -> Reveal -> Footer.
   Reveal и Footer появляются только после того, как игра
   закончена (или пропущена) — чтобы финал не спойлерился.
   ========================================================= */

export default function App() {
  const [caught, setCaught] = useState(null) // null = игра ещё не завершена
  const reduced = usePrefersReducedMotion()
  const finished = caught !== null

  const scrollTo = useCallback(
    (id) => {
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    },
    [reduced]
  )

  const handleFinish = useCallback(
    (list) => {
      setCaught(list ?? [])
      // даём React отрисовать секцию, потом мягко к ней уезжаем
      setTimeout(() => scrollTo('reveal'), 90)
    },
    [scrollTo]
  )

  return (
    <>
      <Hero onScrollToGame={() => scrollTo('game')} />

      <main>
        <Game
          onFinish={handleFinish}
          finished={finished}
          onGoToReveal={() => scrollTo('reveal')}
        />

        {finished && <Reveal caught={caught} />}
        {finished && <Footer />}
      </main>
    </>
  )
}
