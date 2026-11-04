export const BRIEF_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp'
export const BRIEF_IMAGE_LIMIT = 6
const imageSizeLimit = 5 * 1024 * 1024
const totalSizeLimit = 20 * 1024 * 1024

const imageExtensions: Record<string, RegExp> = {
  'image/jpeg': /\.jpe?g$/i,
  'image/png': /\.png$/i,
  'image/webp': /\.webp$/i,
}

export type BriefImage = {
  /** A fresh nonce identifies this File instance, including same-name replacements. */
  id: string
  file: File
  preview: string
}

export function imageSelectionError(files: readonly File[]): string | null {
  if (files.length > BRIEF_IMAGE_LIMIT) return 'Vous pouvez joindre jusqu’à 6 images.'
  for (const file of files) {
    const extension = imageExtensions[file.type]
    if (!extension || !extension.test(file.name)) {
      return `« ${file.name} » : choisissez une image JPEG, PNG ou WebP. Pour un autre format, utilisez le lien de partage.`
    }
    if (file.size === 0) return `« ${file.name} » est vide. Choisissez une autre image.`
    if (file.size > imageSizeLimit) return `« ${file.name} » dépasse la limite de 5 Mio par image. Vous pouvez la partager via un lien.`
  }
  if (files.reduce((total, file) => total + file.size, 0) > totalSizeLimit) {
    return 'Vos images dépassent la limite totale de 20 Mio. Retirez une image ou utilisez le lien de partage dans cette rubrique.'
  }
  return null
}

export function imageFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.ceil(bytes / 1024))} Kio`
    : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(bytes / (1024 * 1024))} Mio`
}
