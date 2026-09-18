export default function ConnectionError() {
  return (
    <div className="connection-error">
      <h1>Unable to connect to our little space.</h1>
      <p>Please try again.</p>
      <p className="muted">
        Check your internet connection and make sure Supabase environment variables are set.
      </p>
      <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  )
}
