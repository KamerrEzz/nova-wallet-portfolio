import { cn } from '@/shared/lib/cn'

import styles from './Pagination.module.css'

type PageItem = number | 'ellipsis-start' | 'ellipsis-end'

/** Page items with ellipsis when there are more than 7 pages. */
function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items: PageItem[] = [1]
  const start = Math.max(2, page - 2)
  const end = Math.min(totalPages - 1, page + 2)

  if (start > 2) items.push('ellipsis-start')
  for (let p = start; p <= end; p += 1) items.push(p)
  if (end < totalPages - 1) items.push('ellipsis-end')
  items.push(totalPages)

  return items
}

export interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)

  return (
    <nav className={styles.nav} aria-label="Paginación">
      <ul className={styles.list}>
        <li>
          <button
            type="button"
            className={cn(styles.button, styles.step)}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </button>
        </li>
        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={cn(styles.button, item === page && styles.current)}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item}>
              <span className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={cn(styles.button, styles.step)}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  )
}
