import { useState } from 'react'
import s from './Photo.module.css'

/* =========================================================
   ФОТО-КАРТОЧКА
   Файлы лежат в public/images/ — просто положи туда jpg
   с нужными именами (photo1.jpg, lekha.jpg, keyboard.jpg).
   Если файла ещё нет — вместо битой картинки покажется
   аккуратный плейсхолдер с подсказкой, куда класть файл.
   ========================================================= */
export default function Photo({ src, alt = '', ratio = '4 / 5', className = '', caption }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const fileName = src.split('/').pop()

  return (
    <figure className={`${s.wrap} ${className}`} style={{ '--ratio': ratio }}>
      {failed ? (
        <div className={s.placeholder}>
          <span className={s.phIcon} aria-hidden="true">
            {'[ ]'}
          </span>
          <span className={s.phName}>{fileName}</span>
          <span className={s.phHint}>положи файл в public/images/</span>
        </div>
      ) : (
        <img
          className={`${s.img} ${loaded ? s.imgLoaded : ''}`}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {caption ? <figcaption className={s.caption}>{caption}</figcaption> : null}
    </figure>
  )
}
