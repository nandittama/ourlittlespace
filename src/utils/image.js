const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export function validateImageFile(file) {
  if (!file) return 'Please choose a photo.'
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, or WEBP images are allowed.'
  }
  if (file.size > MAX_SIZE) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

export function getImageExtension(file) {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return map[file.type] || 'jpg'
}

/** Compress/resize image via canvas before upload. Returns a Blob. */
export async function compressImage(file, maxWidth = 1400, quality = 0.82) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not process image.'))
          return
        }
        resolve(blob)
      },
      mime,
      quality
    )
  })
}
