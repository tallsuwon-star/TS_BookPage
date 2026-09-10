import './Card.css'

export default function Card({ title, action, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {action && <div className="card__action">{action}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  )
}
