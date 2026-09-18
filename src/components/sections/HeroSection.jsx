import {
  APP_NAME,
  APP_TAGLINE,
  RELATIONSHIP_START,
  getOtherPerson,
  getPersonName,
} from '../../config'
import {
  formatAnniversaryLabel,
  formatTodayLong,
  getDaysTogether,
  getGreeting,
} from '../../utils/date'
import { usePerson } from '../../context/PersonContext'

export default function HeroSection({ myMood, partnerMood }) {
  const { person, personName, hasPerson, openPicker } = usePerson()
  const days = getDaysTogether(RELATIONSHIP_START)
  const partnerName = hasPerson ? getPersonName(getOtherPerson(person)) : getPersonName('dia')

  return (
    <section className="hero">
      <div className="hero__brand-row">
        <div>
          <p className="hero__brand">{APP_NAME}</p>
          <p className="hero__names muted">
            {getPersonName('kamu')} &amp; {getPersonName('dia')}
          </p>
        </div>
        {hasPerson ? (
          <span className="hero__days" aria-label={`${days} days together`}>
            {days} hari
          </span>
        ) : null}
      </div>

      <div className="hero__welcome card">
        <p className="hero__eyebrow">Ruang kecil untuk dua orang</p>
        <h1 className="hero__greeting">
          {hasPerson ? getGreeting(personName) : `Welcome to ${APP_NAME}`}
        </h1>
        <p className="hero__meta muted">
          {formatAnniversaryLabel(RELATIONSHIP_START)} ({days} hari bersama)
        </p>
        <p className="hero__date muted">{formatTodayLong()}</p>
        <p className="hero__tagline">{APP_TAGLINE}</p>

        {hasPerson ? (
          <>
            <p className="hero__soft">How&apos;s your heart today?</p>

            <div className="hero__switch card card--inset">
              <div>
                <p className="hero__active-label">Profil aktif</p>
                <p className="hero__active-name">{personName}</p>
              </div>
              <button type="button" className="btn btn--primary" onClick={openPicker}>
                Switch
              </button>
            </div>

            <div className="hero__mood-bubbles">
              <div className="mood-bubble mood-bubble--you">
                <p>
                  Mood {personName}:{' '}
                  {myMood
                    ? `${myMood.mood_label}${myMood.message ? ` · ${myMood.message}` : ''}`
                    : 'Belum check-in'}
                </p>
              </div>
              <div className="mood-bubble mood-bubble--partner">
                <p>
                  Mood {partnerName}:{' '}
                  {partnerMood
                    ? `${partnerMood.mood_label}${partnerMood.message ? ` · ${partnerMood.message}` : ''}`
                    : 'Belum check-in'}
                </p>
              </div>
            </div>

            <p className="hero__scroll muted">Scroll to explore</p>
          </>
        ) : (
          <p className="hero__soft muted">Pilih siapa yang memakai dulu.</p>
        )}
      </div>
    </section>
  )
}
