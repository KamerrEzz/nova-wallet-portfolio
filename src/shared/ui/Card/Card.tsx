import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Card.module.css'

export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Glassmorphism: translucent surface with backdrop blur. */
  glass?: boolean
  /** Lifts the card on hover. */
  hover?: boolean
  padding?: CardPadding
}

export type CardSectionProps = HTMLAttributes<HTMLDivElement>

function CardRoot({ glass, hover, padding = 'none', className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        glass && styles.glass,
        hover && styles.hover,
        styles[`pad${padding[0].toUpperCase()}${padding.slice(1)}`],
        className,
      )}
      {...rest}
    />
  )
}

function Header({ className, ...rest }: CardSectionProps) {
  return <div className={cn(styles.header, className)} {...rest} />
}

function Body({ className, ...rest }: CardSectionProps) {
  return <div className={cn(styles.body, className)} {...rest} />
}

function Footer({ className, ...rest }: CardSectionProps) {
  return <div className={cn(styles.footer, className)} {...rest} />
}

/** Compound card: `Card`, `Card.Header`, `Card.Body`, `Card.Footer`. */
export const Card = Object.assign(CardRoot, { Header, Body, Footer })
