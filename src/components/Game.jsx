import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PHRASES, KIND_LABEL, shuffle } from '../data/phrases'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import s from './Game.module.css'

/* =========================================================
   МИНИ-ИГРА «ЛОВИ ПРИЯТНЫЕ СЛОВА»
   Плашки с фразами падают сверху, ловим их «слотом» внизу.
   Слот едет за курсором (десктоп), за пальцем (мобилка)
   и за стрелками на клавиатуре.

   Настройки раунда — константы ниже.
   Сами фразы — в src/data/phrases.js
   ========================================================= */

const ROUND_MS = 38000 // длительность раунда
const SPAWN_MS = 1250 // интервал появления новой плашки
const FALL_MIN = 105 // скорость падения, px/сек
const FALL_MAX = 150
const CATCH_H = 84 // высота зоны слота от низа сцены
const CATCH_BAND = 46 // «толщина» зоны срабатывания по вертикали

export default function Game({ onFinish, finished, onGoToReveal }) {
  const reduced = usePrefersReducedMotion()

  const [status, setStatus] = useState('idle') // idle | playing | done
  const [chips, setChips] = useState([]) // видимые плашки
  const [caught, setCaught] = useState([]) // пойманные фразы (для счётчика)
  const [secondsLeft, setSecondsLeft] = useState(Math.round(ROUND_MS / 1000))
  const [bursts, setBursts] = useState([]) // всплески частиц при поимке

  // --- мутабельное состояние анимации, живёт вне рендера ---
  const stageRef = useRef(null)
  const catcherRef = useRef(null)
  const timerBarRef = useRef(null)
  const chipEls = useRef(new Map()) // id -> DOM-элемент
  const chipData = useRef(new Map()) // id -> { x, y, vy, w, h, phrase, done }
  const queueRef = useRef([])
  const caughtRef = useRef([])
  const pointerX = useRef(0)
  const catcherX = useRef(0)
  const rafRef = useRef(0)
  const uid = useRef(0)

  /* ---------- работа с плашками ---------- */

  const removeChip = useCallback((id) => {
    chipData.current.delete(id)
    chipEls.current.delete(id)
    setChips((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Поймали: пишем фразу в улов, зажигаем частицы, убираем плашку
  const markCaught = useCallback(
    (id, phrase, x, y) => {
      caughtRef.current = [...caughtRef.current, phrase]
      setCaught(caughtRef.current)
      setChips((prev) => prev.map((c) => (c.id === id ? { ...c, state: 'caught' } : c)))

      if (!reduced) {
        const bid = `b${id}`
        setBursts((prev) => [...prev, { id: bid, x, y }])
        setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== bid)), 700)
      }

      setTimeout(() => removeChip(id), 420)
    },
    [reduced, removeChip]
  )

  // Пролетело мимо — это не ошибка, просто тихо гаснет
  const markMissed = useCallback(
    (id) => {
      setChips((prev) => prev.map((c) => (c.id === id ? { ...c, state: 'missed' } : c)))
      setTimeout(() => removeChip(id), 380)
    },
    [removeChip]
  )

  /* ---------- старт раунда ---------- */
  const start = useCallback(() => {
    queueRef.current = shuffle(PHRASES)
    chipEls.current.clear()
    chipData.current.clear()
    caughtRef.current = []
    setChips([])
    setCaught([])
    setBursts([])
    setSecondsLeft(Math.round(ROUND_MS / 1000))
    const rect = stageRef.current?.getBoundingClientRect()
    pointerX.current = (rect?.width ?? 600) / 2
    catcherX.current = pointerX.current
    setStatus('playing')
  }, [])

  /* ---------- пропустить игру ---------- */
  const skip = useCallback(() => {
    const picked = shuffle(PHRASES).slice(0, 6)
    caughtRef.current = picked
    setCaught(picked)
    setChips([])
    setStatus('done')
    onFinish(picked)
  }, [onFinish])

  /* ---------- главный игровой цикл (requestAnimationFrame) ---------- */
  useEffect(() => {
    if (status !== 'playing') return
    const stage = stageRef.current
    if (!stage) return

    let last = performance.now()
    let spawnAcc = SPAWN_MS * 0.4 // первая плашка появляется почти сразу
    let elapsed = 0
    let lastSecond = -1

    const step = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05) // защита от скачка при возврате во вкладку
      last = now
      elapsed += dt * 1000

      const { width: W, height: H } = stage.getBoundingClientRect()
      const catchTop = H - CATCH_H

      /* --- таймер --- */
      const progress = Math.max(0, 1 - elapsed / ROUND_MS)
      if (timerBarRef.current) timerBarRef.current.style.transform = `scaleX(${progress})`
      const sec = Math.ceil((ROUND_MS - elapsed) / 1000)
      if (sec !== lastSecond) {
        lastSecond = sec
        setSecondsLeft(Math.max(0, sec))
      }

      /* --- появление новых плашек --- */
      spawnAcc += dt * 1000
      if (spawnAcc >= SPAWN_MS && queueRef.current.length && elapsed < ROUND_MS - 2500) {
        spawnAcc = 0
        const phrase = queueRef.current.shift()
        const id = ++uid.current
        chipData.current.set(id, {
          x: 110 + Math.random() * Math.max(1, W - 220),
          y: -70,
          vy: FALL_MIN + Math.random() * (FALL_MAX - FALL_MIN),
          w: 0,
          h: 0,
          phrase,
          done: false,
        })
        setChips((prev) => [...prev, { id, phrase, state: 'fall' }])
      }

      /* --- слот плавно догоняет курсор --- */
      const cEl = catcherRef.current
      const cw = cEl ? cEl.offsetWidth : 150
      if (cEl) {
        const target = Math.min(Math.max(pointerX.current, cw / 2 + 4), W - cw / 2 - 4)
        catcherX.current += (target - catcherX.current) * Math.min(1, dt * 14)
        cEl.style.transform = `translate3d(${catcherX.current - cw / 2}px, 0, 0)`
      }

      /* --- движение плашек и столкновения --- */
      let active = 0
      for (const [id, d] of chipData.current) {
        // считаем «живые» плашки даже до того, как React их отрисовал,
        // иначе раунд может закончиться раньше времени
        if (!d.done) active++

        const el = chipEls.current.get(id)
        if (!el) continue

        if (!d.w) {
          // размеры известны только после монтирования — тогда же поджимаем к краям
          d.w = el.offsetWidth
          d.h = el.offsetHeight
          d.x = Math.min(Math.max(d.x, d.w / 2 + 6), Math.max(d.w / 2 + 6, W - d.w / 2 - 6))
        }

        if (d.done) continue

        d.y += d.vy * dt
        el.style.transform = `translate3d(${d.x - d.w / 2}px, ${d.y}px, 0)`

        const bottom = d.y + d.h
        const hitY = bottom >= catchTop && d.y <= catchTop + CATCH_BAND
        const hitX = Math.abs(d.x - catcherX.current) < cw / 2 + d.w / 2 - 10

        if (hitY && hitX) {
          d.done = true
          markCaught(id, d.phrase, d.x, catchTop)
          continue
        }

        if (d.y > H + 20) {
          d.done = true
          markMissed(id)
        }
      }

      /* --- конец раунда --- */
      if (elapsed >= ROUND_MS || (queueRef.current.length === 0 && active === 0)) {
        setStatus('done')
        return
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [status, markCaught, markMissed])

  /* ---------- управление ---------- */
  const handlePointer = useCallback((e) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    pointerX.current = e.clientX - rect.left
  }, [])

  useEffect(() => {
    if (status !== 'playing') return
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') pointerX.current -= 44
      if (e.key === 'ArrowRight') pointerX.current += 44
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status])

  const total = PHRASES.length
  const pad = (n) => String(n).padStart(2, '0')

  return (
    <section className={`section ${s.section}`} id="game">
      <div className="container">
        {/* --- шапка секции --- */}
        <div className={s.head}>
          <span className="hud">этап 01 · мини-игра</span>
          <h2 className={s.title}>Лови приятные слова</h2>
          <p className={s.lead}>
            Сверху падают слова, которые про тебя. Двигай слот и собирай — что поймаешь, то и
            заберёшь себе. Промахи тут ничего не стоят.
          </p>
        </div>

        {/* --- сцена --- */}
        <div
          className={`panel ${s.stage} ${status === 'playing' ? s.stagePlaying : ''}`}
          ref={stageRef}
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
        >
          {/* полоса таймера по верхней кромке */}
          <div className={s.timerTrack} aria-hidden="true">
            <span className={s.timerFill} ref={timerBarRef} />
          </div>

          {/* HUD: счётчик и время */}
          <div className={s.hudRow}>
            <div className={s.counter}>
              <span className="hud">поймано</span>
              <div className={s.counterNums}>
                <span className={s.counterBig}>{pad(caught.length)}</span>
                <span className={s.counterTotal}>/ {total}</span>
              </div>
              <div className={s.segments} aria-hidden="true">
                {Array.from({ length: total }, (_, i) => (
                  <span key={i} className={`${s.segment} ${i < caught.length ? s.segmentOn : ''}`} />
                ))}
              </div>
            </div>

            <div className={s.clock}>
              <span className="hud">время</span>
              <span className={s.clockValue}>0:{pad(secondsLeft)}</span>
            </div>
          </div>

          {/* поле с падающими плашками */}
          <div className={s.field}>
            {chips.map((chip) => (
              <div
                key={chip.id}
                className={s.chip}
                ref={(el) => {
                  if (!el) {
                    chipEls.current.delete(chip.id)
                    return
                  }
                  chipEls.current.set(chip.id, el)
                  // сразу ставим на позицию, чтобы плашка не мигнула в углу
                  const d = chipData.current.get(chip.id)
                  if (d) {
                    if (!d.w) {
                      d.w = el.offsetWidth
                      d.h = el.offsetHeight
                      const W = stageRef.current?.getBoundingClientRect().width ?? 0
                      d.x = Math.min(
                        Math.max(d.x, d.w / 2 + 6),
                        Math.max(d.w / 2 + 6, W - d.w / 2 - 6)
                      )
                    }
                    el.style.transform = `translate3d(${d.x - d.w / 2}px, ${d.y}px, 0)`
                  }
                }}
              >
                <div
                  className={[
                    s.chipInner,
                    chip.state === 'caught' ? s.chipCaught : '',
                    chip.state === 'missed' ? s.chipMissed : '',
                  ].join(' ')}
                >
                  <span className={s.chipKind}>{KIND_LABEL[chip.phrase.kind]}</span>
                  <span className={s.chipText}>{chip.phrase.text}</span>
                </div>
              </div>
            ))}

            {/* частицы в момент поимки */}
            {bursts.map((b) => (
              <div key={b.id} className={s.burst} style={{ left: b.x, top: b.y }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <span key={i} className={s.spark} style={{ '--i': i }} />
                ))}
              </div>
            ))}
          </div>

          {/* СЛОТ-ЛОВУШКА — фирменный элемент интерфейса */}
          <div className={s.catcherLayer} aria-hidden="true">
            <div className={s.catcher} ref={catcherRef}>
              <span className={s.catcherGuide} />
              <span className={s.catcherBody}>
                <span className={s.catcherLabel}>слот</span>
              </span>
            </div>
          </div>

          {/* оверлеи: старт и финиш */}
          <AnimatePresence>
            {status === 'idle' && (
              <motion.div
                key="idle"
                className={s.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.35 }}
              >
                <div className={s.overlayInner}>
                  <span className="hud hud--accent">готов?</span>
                  <h3 className={s.overlayTitle}>20 слов · 38 секунд</h3>
                  <ul className={s.rules}>
                    <li>слот едет за курсором или пальцем</li>
                    <li>ловишь плашку — она уходит в счётчик</li>
                    <li>промах — не проигрыш, просто мимо</li>
                  </ul>
                  <div className={s.overlayActions}>
                    <button type="button" className="btn" onClick={start}>
                      Начать игру
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={skip}>
                      пропустить
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'done' && (
              <motion.div
                key="done"
                className={s.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className={s.overlayInner}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="hud hud--accent">раунд завершён</span>
                  <h3 className={s.overlayTitle}>
                    Поймано {caught.length} из {total}
                  </h3>
                  <p className={s.overlayText}>
                    {caught.length >= 12
                      ? 'Реакция на месте. Забирай всё это себе.'
                      : caught.length >= 5
                        ? 'Хороший улов. Остальное всё равно про тебя.'
                        : 'Слова тут важнее счёта — держи то, что успело долететь.'}
                  </p>
                  <div className={s.overlayActions}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => (finished ? onGoToReveal() : onFinish(caughtRef.current))}
                    >
                      {finished ? 'Вниз, к подарку ↓' : 'Что я поймал →'}
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={start}>
                      ещё раз
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className={s.hint}>
          <span className="hud">управление</span>
          <span>мышь · палец · стрелки ← →</span>
        </p>
      </div>
    </section>
  )
}
