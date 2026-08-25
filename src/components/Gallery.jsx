import Photo from './Photo'
import s from './Gallery.module.css'

/* =========================================================
   ФОТОГАЛЕРЕЯ
   Файлы клади в public/images/ с именами photo1.jpg … photo4.jpg
   Хочешь больше/меньше карточек — просто правь массив PHOTOS.
   Подписи тоже меняются здесь.
   ========================================================= */

const PHOTOS = [
  { src: '/images/photo1.jpg', alt: 'совместное фото 1', caption: 'кадр 01' },
  { src: '/images/photo2.jpg', alt: 'совместное фото 2', caption: 'кадр 02' },
  { src: '/images/photo3.jpg', alt: 'совместное фото 3', caption: 'кадр 03' },
  { src: '/images/photo4.jpg', alt: 'совместное фото 4', caption: 'кадр 04' },
]

export default function Gallery() {
  return (
    <div>
      <div className={s.head}>
        <span className="hud">этап 03 · архив</span>
        <h2 className={s.title}>Немного доказательств</h2>
        <p className={s.lead}>
          Кадры, которые уже случились. В шестнадцать таких станет только больше.
        </p>
      </div>

      <div className={s.grid}>
        {PHOTOS.map((p) => (
          <div className={s.cell} key={p.src}>
            <Photo src={p.src} alt={p.alt} ratio="4 / 5" caption={p.caption} />
          </div>
        ))}
      </div>
    </div>
  )
}
