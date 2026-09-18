export default function Loading({ full = false, label = 'Loading...' }) {
  return (
    <div className={full ? 'loading loading--full' : 'loading'} role="status">
      <div className="loading__spinner" />
      <p>{label}</p>
    </div>
  )
}
