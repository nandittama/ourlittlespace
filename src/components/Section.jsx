import { useReveal } from '../hooks/useReveal'

export default function Section({ id, title, subtitle, children, className = '' }) {
  const { ref, visible } = useReveal()

  return (
    <section
      id={id}
      ref={ref}
      className={`section reveal ${visible ? 'reveal--in' : ''} ${className}`}
    >
      {(title || subtitle) && (
        <header className="section__head">
          {title ? <h2 className="section__title">{title}</h2> : null}
          {subtitle ? <p className="section__subtitle">{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  )
}
