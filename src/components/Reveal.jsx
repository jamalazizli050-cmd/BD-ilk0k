import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PHRASES, KIND_LABEL, shuffle } from '../data/phrases'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import Confetti from './Confetti'
import Gallery from './Gallery'
import Gift from './Gift'
import s from './Reveal.module.css'

/* =========================================================
   ЭКРАН-РАСКРЫТИЕ ПОСЛЕ ИГРЫ
   Блоки появляются по очереди:
   1 — пойманные фразы (личный «лут»)
   2 — плашка achievement unlocked + конфетти
   3 — фотогалерея
   4 — тизер подарка и сам подарок (компонент Gift)
   ========================================================= */

// Через сколько миллисекунд показывать каждый шаг
const STEP_DELAYS = [120, 2100, 3600, 4800]

export default function Reveal({ caught }) {
  const reduced = usePrefersReducedMotion()
  const [step, setStep] = useState(reduced ? 4 : 0)

  // Если поймал совсем мало — тихо добираем несколько фраз,
  // чтобы подарок из слов не выглядел пустым. Никаких упрёков.
  const { loot, addedExtra } = useMemo(() => {
    const unique = []
    const seen = new Set()
    for (const p of caught) {
      if (!seen.has(p.id)) {
        seen.add(p.id)
        unique.push(p)
      }
    }
    if (unique.length >= 5) return { loot: unique, addedExtra: false }

    const rest = shuffle(PHRASES.filter((p) => !seen.has(p.id))).slice(0, 5 - unique.length)
    return { loot: [...unique, ...rest], addedExtra: rest.length > 0 }
  }, [caught])

  // Последовательное появление блоков
  useEffect(() => {
    if (reduced) return
    const timers = STEP_DELAYS.map((delay, i) => setTimeout(() => setStep(i + 1), delay))
    return () => timers.forEach(clearTimeout)
  }, [reduced])

  const appear = (delay = 0) =>
    reduced
      ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
        }

  return (
    <section className={`section ${s.section}`} id="reveal">
      <div className="container">
        {/* ---------- ШАГ 1: пойманные слова ---------- */}
        {step >= 1 && (
          <motion.div className={s.block} {...appear(0)}>
            <div className={s.head}>
              <span className="hud">этап 02 · инвентарь</span>
              <h2 className={s.title}>Твой личный набор тёплых слов</h2>
              <p className={s.lead}>
                {addedExtra
                  ? 'Часть слов пролетела мимо слота — доложил их сам, они всё равно про тебя.'
                  : 'Всё это ты поймал сам. Значит, официально твоё.'}
              </p>
            </div>

            <ul className={s.loot}>
              {loot.map((p, i) => (
                <motion.li
                  key={p.id}
                  className={s.lootItem}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: reduced ? 0 : 0.5,
                    delay: reduced ? 0 : 0.15 + i * 0.06,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span className={s.lootIndex}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.lootText}>{p.text}</span>
                  <span className={s.lootKind}>{KIND_LABEL[p.kind]}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* ---------- ШАГ 2: achievement unlocked ---------- */}
        {step >= 2 && (
          <div className={s.achWrap}>
            <Confetti fire={step >= 2} count={110} originY={0.5} />
            <motion.div
              className={s.ach}
              initial={reduced ? { opacity: 1 } : { opacity: 0, x: 70, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 190, damping: 17, mass: 0.9 }
              }
            >
              <div className={s.achIcon} aria-hidden="true">
                <span className={s.achIconInner}>16</span>
              </div>
              <div className={s.achBody}>
                <span className="hud hud--accent">achievement unlocked</span>
                <h3 className={s.achTitle}>С днём рождения, Леха!</h3>
                <p className={s.achMeta}>уровень 16 открыт · прогресс сохранён</p>
              </div>
              <span className={s.achShine} aria-hidden="true" />
            </motion.div>
          </div>
        )}

        {/* ---------- ШАГ 3: фотогалерея ---------- */}
        {step >= 3 && (
          <motion.div className={s.block} {...appear(0)}>
            <Gallery />
          </motion.div>
        )}

        {/* ---------- ШАГ 4: подарок ---------- */}
        {step >= 4 && (
          <motion.div className={s.block} {...appear(0)}>
            <Gift />
          </motion.div>
        )}
      </div>
    </section>
  )
}
