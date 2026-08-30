export type ClassValue = string | false | null | undefined

/** Joins conditional class names, dropping falsy values. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ')
}
