export default function MoodCard({ title, mood, emptyText, hint }) {
  return (
    <div className="mood-card fade-in">
      <p className="mood-card__title">{title}</p>
      {mood ? (
        <>
          <p className="mood-card__emoji" aria-hidden="true">
            {mood.mood_emoji}
          </p>
          <p className="mood-card__label">{mood.mood_label}</p>
          {mood.message ? <p className="mood-card__message">“{mood.message}”</p> : null}
          {hint ? <p className="mood-card__hint">{hint}</p> : null}
        </>
      ) : (
        <p className="mood-card__empty">{emptyText}</p>
      )}
    </div>
  )
}
