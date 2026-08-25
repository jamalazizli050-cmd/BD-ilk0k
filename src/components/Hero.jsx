import { motion } from 'framer-motion'
import s from './Hero.module.css'

/* =========================================================
   HERO — первый экран.
   Заголовок, имя, цифра 16 и полоска «уровень 15 -> 16».
   Появление: последовательный слайд снизу + фейд (~1.2 c).
   ========================================================= */

// Общий вариант появления для строк
const rise = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.12 + i * 0.11, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function Hero({ onScrollToGame }) {
  return (
    <header className={s.hero} id="top">
      <div className={`container ${s.inner}`}>
        {/* Верхняя служебная строка — как шапка игрового меню */}
        <motion.div
          className={s.topbar}
          variants={rise}
          initial="hidden"
          animate="show"
          custom={0}
        >
          <span className="hud">player_01 · леха</span>
          <span className={s.topbarDivider} aria-hidden="true" />
          <span className="hud">26.08.2010</span>
        </motion.div>

        <div className={s.center}>
          <motion.p className={s.kicker} variants={rise} initial="hidden" animate="show" custom={1}>
            С днём рождения
          </motion.p>

          <div className={s.titleRow}>
            <motion.h1
              className={s.name}
              variants={rise}
              initial="hidden"
              animate="show"
              custom={2}
            >
              ЛЕХА
            </motion.h1>

            <motion.div
              className={s.ageBox}
              variants={rise}
              initial="hidden"
              animate="show"
              custom={3}
            >
              <span className={s.age}>16</span>
              <span className={s.ageLabel}>лет</span>
            </motion.div>
          </div>

          <motion.p
            className={s.subtitle}
            variants={rise}
            initial="hidden"
            animate="show"
            custom={4}
          >
            Пятнадцать пройдены без единого сейва. Загружаем шестнадцать.
          </motion.p>

          {/* Полоска прогресса «уровень пройден» — фирменная деталь */}
          <motion.div
            className={s.level}
            variants={rise}
            initial="hidden"
            animate="show"
            custom={5}
          >
            <span className="hud">lvl 15</span>
            <div className={s.bar}>
              <motion.span
                className={s.barFill}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className={s.barTicks} aria-hidden="true" />
            </div>
            <span className="hud hud--accent">lvl 16</span>
          </motion.div>
        </div>

        {/* Индикатор скролла */}
        <motion.button
          type="button"
          className={s.scroll}
          onClick={onScrollToGame}
          variants={rise}
          initial="hidden"
          animate="show"
          custom={6}
        >
          <span className="hud">листай — там игра</span>
          <span className={s.arrow} aria-hidden="true" />
        </motion.button>
      </div>
    </header>
  )
}
