export const DATE_IDEAS = [
  { emoji: '☕', title: 'Ngopi bersama', detail: 'Ngopi dan ngobrol tanpa sibuk dengan HP.' },
  { emoji: '🍜', title: 'Cari tempat makan baru', detail: 'Coba tempat makan yang belum pernah dikunjungi.' },
  { emoji: '🚶', title: 'Jalan sore', detail: 'Jalan santai sore hari, tanpa terburu-buru.' },
  { emoji: '🎬', title: 'Nonton film', detail: 'Pilih film favorit dan nikmati bersama.' },
  { emoji: '🍳', title: 'Masak bersama', detail: 'Masak sesuatu sederhana di rumah.' },
  { emoji: '🎮', title: 'Main game', detail: 'Main game yang bisa dimainkan berdua.' },
  { emoji: '📷', title: 'Foto bersama', detail: 'Ambil beberapa foto spontan hari ini.' },
  { emoji: '🗺️', title: 'Cari tempat baru', detail: 'Eksplor tempat di sekitar yang belum pernah dikunjungi.' },
  { emoji: '🍕', title: 'Beli makanan favorit', detail: 'Pesan atau beli makanan favorit kalian.' },
  { emoji: '🧭', title: 'Jalan tanpa tujuan', detail: 'Keluar dan biarkan jalan menentukan tujuannya.' },
  { emoji: '📚', title: 'Baca atau belajar bareng', detail: 'Duduk bareng sambil baca atau kerjakan sesuatu.' },
  { emoji: '🍦', title: 'Dessert date', detail: 'Cari es krim atau dessert manis untuk berbagi.' },
]

export function pickRandomIdea(excludeTitle = null) {
  const pool = excludeTitle
    ? DATE_IDEAS.filter((idea) => idea.title !== excludeTitle)
    : DATE_IDEAS
  const list = pool.length > 0 ? pool : DATE_IDEAS
  return list[Math.floor(Math.random() * list.length)]
}
