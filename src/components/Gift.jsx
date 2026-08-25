import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import Confetti from './Confetti'
import Photo from './Photo'
import s from './Gift.module.css'

/* =========================================================
   ПОДАРОК
   Сначала тизер с фото (public/images/lekha.jpg) и кнопкой,
   по клику карточка «переворачивается» и открывается финальная
   карточка с клавиатурой (public/images/keyboard.jpg).

   Тексты подарка — прямо здесь, меняются в одну строку.
   ========================================================= */

// Шуточные «характеристики» подарка — как в описании предмета в игре
const STATS = [
  { label: 'тактильность', value: 92 },
  { label: 'скорость', value: 87 },
  { label: 'понты', value: 99 },
]

export default function Gift() {
  const [open, setOpen] = useState(false)
  const reduced = usePrefersReducedMotion()

  const flipIn = reduced
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { rotateY: 82, opacity: 0, scale: 0.94 },
        animate: { rotateY: 0, opacity: 1, scale: 1 },
        transition: { type: 'spring', stiffness: 120, damping: 16, mass: 0.9 },
      }

  return (
    <div>
      <div className={s.head}>
        <span className="hud">этап 04 · подарок</span>
        <h2 className={s.title}>{open ? 'Открыто' : 'И это ещё не всё'}</h2>
      </div>

      <div className={s.stage}>
        <AnimatePresence mode="wait">
          {!open ? (
            /* ---------- ТИЗЕР ---------- */
            <motion.div
              key="teaser"
              className={`panel brackets ${s.teaser}`}
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              exit={reduced ? { opacity: 0 } : { rotateY: -84, opacity: 0, scale: 0.95 }}
              transition={{ duration: reduced ? 0 : 0.42, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={s.teaserPhoto}>
                {/* фото именинника: public/images/lekha.jpg */}
                <Photo src="/images/lekha.jpg" alt="Леха" ratio="4 / 5" />
              </div>

              <div className={s.teaserBody}>
                <span className="hud hud--accent">коробка уже ждёт</span>
                <h3 className={s.teaserTitle}>У меня для тебя кое-что есть</h3>
                <p className={s.teaserText}>
                  Оно давно лежит и делает вид, что просто коробка. Внутри — вещь, которой
                  тебе не хватало каждый вечер. Жми, не тяни.
                </p>
                <button type="button" className="btn" onClick={() => setOpen(true)}>
                  Посмотреть подарок
                </button>
              </div>
            </motion.div>
          ) : (
            /* ---------- ФИНАЛЬНАЯ КАРТОЧКА ---------- */
            <motion.div key="gift" className={s.giftWrap} {...flipIn}>
              <Confetti fire count={130} originY={0.35} />

              <div className={`${s.gift} brackets`}>
                <div className={s.giftRibbon}>
                  <span className="hud hud--accent">item unlocked</span>
                  <span className={s.rarity}>rarity: legendary</span>
                </div>

                <div className={s.giftGrid}>
                  <div className={s.giftPhoto}>
                    {/* фото подарка: public/images/keyboard.jpg */}
                    <Photo src="/images/keyboard.jpg" alt="Новая механическая клавиатура" ratio="3 / 2" />
                  </div>

                  <div className={s.giftBody}>
                    <h3 className={s.giftTitle}>
                      твоя новая клава <span className={s.emoji}>🎹⌨️</span>
                    </h3>
                    <p className={s.giftText}>
                      Пятнадцать ты дожал на том, что было. Шестнадцать — только по механике:
                      теперь каждый клик звучит так, будто ты уже выиграл раунд.
                    </p>
                    <p className={s.giftText}>
                      Заслужил апгрейд. Пользуйся, залипай, печатай мне в три часа ночи — я
                      по звуку узнаю, что это ты.
                    </p>

                    {/* шуточные характеристики предмета */}
                    <div className={s.stats}>
                      {STATS.map((st, i) => (
                        <div className={s.stat} key={st.label}>
                          <span className={s.statLabel}>{st.label}</span>
                          <span className={s.statTrack}>
                            <motion.span
                              className={s.statFill}
                              initial={reduced ? { scaleX: st.value / 100 } : { scaleX: 0 }}
                              animate={{ scaleX: st.value / 100 }}
                              transition={{
                                duration: reduced ? 0 : 0.9,
                                delay: reduced ? 0 : 0.35 + i * 0.12,
                                ease: [0.16, 1, 0.3, 1],
                              }}
                            />
                          </span>
                          <span className={s.statValue}>+{st.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
