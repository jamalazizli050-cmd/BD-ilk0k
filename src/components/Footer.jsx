import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import Confetti from './Confetti'
import s from './Footer.module.css'

/* =========================================================
   ФИНАЛЬНАЯ СЕКЦИЯ
   Личный текст + большая «16» как гранд-финал.
   Конфетти запускается, когда секция попадает в зону видимости
   (IntersectionObserver в хуке useInView).
   ========================================================= */

export default function Footer() {
  const [ref, inView] = useInView({ threshold: 0.4 })
  const reduced = usePrefersReducedMotion()

  const appear = (delay = 0) => ({
    initial: reduced ? { opacity: 1 } : { opacity: 0, y: 26 },
    animate: inView || reduced ? { opacity: 1, y: 0 } : {},
    transition: { duration: reduced ? 0 : 0.8, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] },
  })

  return (
    <footer className={`section ${s.footer}`} ref={ref} id="final">
      <Confetti fire={inView} count={90} originY={0.22} />

      <div className={`container ${s.inner}`}>
        <motion.span className="hud" {...appear(0)}>
          этап 05 · финал
        </motion.span>

        <motion.h2 className={s.title} {...appear(0.08)}>
          Ну что, шестнадцать.
        </motion.h2>

        <motion.div className={s.text} {...appear(0.18)}>
          <p>
            Это тот возраст, когда детство ещё никуда не делось, но многое уже реально
            зависит от тебя. И, если честно, у тебя это неплохо получается: ты стал спокойнее
            и упрямее в хорошем смысле — со стороны видно.
          </p>
          <p>
            Пусть в этом году найдётся дело, от которого невозможно оторваться. Пусть рядом
            останутся те, кто не сливается на полпути. И пусть ты пореже сомневаешься, что
            тянешь. Тянешь.
          </p>
        </motion.div>

        {/* Гранд-финал: крупная 16 */}
        <motion.div
          className={s.bigWrap}
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
          animate={inView || reduced ? { opacity: 1, scale: 1 } : {}}
          transition={
            reduced ? { duration: 0 } : { duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <span className={s.big} aria-hidden="true">
            16
          </span>
          <span className={s.bigLabel}>с днём рождения, леха</span>
        </motion.div>

        <motion.div className={s.meta} {...appear(0.5)}>
          <span className="hud">26.08.2010</span>
          <span className={s.metaLine} aria-hidden="true" />
          <span className="hud">save · complete</span>
        </motion.div>
      </div>
    </footer>
  )
}
