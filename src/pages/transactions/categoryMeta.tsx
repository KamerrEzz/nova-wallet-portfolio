/* ------------------------------------------------------------------ */
/* Category metadata for the transactions explorer                     */
/* ------------------------------------------------------------------ */

export const CATEGORY_LABELS: Record<string, string> = {
  comida: 'Comida',
  transporte: 'Transporte',
  hogar: 'Hogar',
  ocio: 'Ocio',
  salud: 'Salud',
  ingresos: 'Ingresos',
  transferencias: 'Transferencias',
}

/** Categories offered in the filter select, in display order. */
export const CATEGORY_VALUES = [
  'comida',
  'transporte',
  'hogar',
  'ocio',
  'salud',
  'ingresos',
  'transferencias',
] as const

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

function baseIcon(size: number, paths: string) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths} />
    </svg>
  )
}

export function CategoryIcon({ category, size = 18 }: { category: string; size?: number }) {
  switch (category) {
    case 'comida':
      return baseIcon(size, 'M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M6 3v18M15 3v18M15 3c2.5 0 4 2.5 4 6 0 2.5-1.5 4-4 4')
    case 'transporte':
      return baseIcon(size, 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM3 7h11v8H3zM14 10h4l3 3v2h-7')
    case 'hogar':
      return baseIcon(size, 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5')
    case 'ocio':
      return baseIcon(size, 'M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Zm9-2v2m0 4v2m0 4v-2')
    case 'salud':
      return baseIcon(size, 'M12 21s-7.5-4.6-9.5-9A5.5 5.5 0 0 1 12 6.5 5.5 5.5 0 0 1 21.5 12c-2 4.4-9.5 9-9.5 9Z')
    case 'ingresos':
      return baseIcon(size, 'M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 21h16')
    case 'transferencias':
      return baseIcon(size, 'M4 7h13l-3.5-3.5M20 17H7l3.5 3.5')
    default:
      return baseIcon(size, 'M6 3h12v18l-3-2-3 2-3-2-3 2Zm3 5h6m-6 4h6')
  }
}
