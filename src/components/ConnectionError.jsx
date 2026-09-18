export default function ConnectionError() {
  return (
    <div className="connection-error">
      <h1>Ada yang kurang beres 🤍</h1>
      <p>Coba lagi sebentar ya.</p>
      <p className="muted">Periksa koneksi dan pastikan Supabase sudah dikonfigurasi.</p>
      <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
        Coba lagi
      </button>
    </div>
  )
}
