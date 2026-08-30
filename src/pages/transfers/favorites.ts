/**
 * Tracks the last recipients the user sent money to, persisted in
 * localStorage (most recent first, capped at {@link MAX_FAVORITES}).
 */

const STORAGE_KEY = 'nova:favorite-recipients'
const MAX_FAVORITES = 3

/** Returns the stored recipient ids, most recent first. Empty when unavailable. */
export function getFavoriteRecipientIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((id): id is string => typeof id === 'string').slice(0, MAX_FAVORITES)
  } catch {
    return []
  }
}

/** Moves `recipientId` to the front of the favorites list. */
export function recordRecipientUse(recipientId: string): void {
  try {
    const next = [recipientId, ...getFavoriteRecipientIds().filter((id) => id !== recipientId)]
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, MAX_FAVORITES)))
  } catch {
    // Sin almacenamiento disponible (modo privado, etc.): simplemente no se guarda.
  }
}
