import {
  APP_NAME,
  APP_SUBTITLE,
  ANNIVERSARY_DATE,
  RELATIONSHIP_VIBE,
  PERSON_ONE_NAME,
  PERSON_TWO_NAME,
} from '../../config'
import {
  formatAnniversaryLabel,
  getDaysTogether,
  getGreeting,
} from '../../utils/date'
import { usePerson } from '../../context/PersonContext'

export default function HeroSection() {
  const { personName, partnerName, hasPerson, switchPerson } = usePerson()
  const days = getDaysTogether(ANNIVERSARY_DATE)

  return (
    <section className="hero" id="hero">
      <div className="hero__top">
        <div>
          <p className="hero__brand">{APP_NAME}</p>
          <p className="hero__pair muted">
            {PERSON_ONE_NAME} &amp; {PERSON_TWO_NAME}
          </p>
        </div>
        <div className="hero__badges">
          <span className="pill">{days} hari</span>
          <span className="pill pill--soft">{RELATIONSHIP_VIBE}</span>
        </div>
      </div>

      <div className="hero__card">
        <p className="hero__eyebrow">{APP_SUBTITLE}</p>
        <h1 className="hero__title">
          {hasPerson ? getGreeting(personName) : `Selamat datang di ${APP_NAME}`}
        </h1>
        <p className="hero__meta">
          Together for <strong>{days}</strong> days
        </p>
        <p className="hero__date muted">Since {formatAnniversaryLabel(ANNIVERSARY_DATE)}</p>

        {hasPerson ? (
          <div className="persona-switcher">
            <div>
              <p className="persona-switcher__label">Kamu di sini sebagai</p>
              <p className="persona-switcher__name">
                {personName} <span className="online-dot">aktif</span>
              </p>
            </div>
            <button type="button" className="btn btn--secondary btn--sm" onClick={switchPerson}>
              Ganti ke {partnerName}
            </button>
          </div>
        ) : (
          <p className="muted">Pilih siapa yang memakai dulu.</p>
        )}
      </div>
    </section>
  )
}
