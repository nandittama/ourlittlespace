import { APP_NAME, APP_TAGLINE } from '../../config'
import { formatTodayLong, getGreeting } from '../../utils/date'
import { usePerson } from '../../context/PersonContext'

export default function HeroSection() {
  const { personName, hasPerson, setPerson, persons } = usePerson()

  return (
    <section className="hero">
      <p className="hero__brand">{APP_NAME}</p>
      <p className="hero__tagline">{APP_TAGLINE}</p>
      <p className="hero__date">{formatTodayLong()}</p>

      {hasPerson ? (
        <>
          <h1 className="hero__greeting">{getGreeting(personName)}</h1>
          <a className="hero__cta" href="#mood">
            How are you feeling today?
          </a>
          <p className="hero__as muted">
            You&apos;re {personName} ·{' '}
            <button
              type="button"
              className="linkish"
              onClick={() =>
                document.getElementById('settings')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Switch
            </button>
          </p>
        </>
      ) : (
        <>
          <h1 className="hero__greeting">Welcome</h1>
          <p className="muted">Who are you?</p>
          <div className="person-pick">
            {persons.map((p) => (
              <button
                key={p.key}
                type="button"
                className="person-pick__btn"
                onClick={() => setPerson(p.key)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
