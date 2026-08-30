import type { Investment } from '@/shared/types'

/** Deterministic PRNG (same algorithm as the mock db). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(text: string): number {
  return Array.from(text).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
}

/**
 * Builds a deterministic synthetic series that drifts from the average
 * purchase price to the current price — the API exposes no price history.
 */
export function buildSparklineSeries(investment: Investment, points = 24): number[] {
  const rand = mulberry32(hashSeed(investment.id))
  const { avgPrice, currentPrice } = investment
  const series: number[] = []

  for (let i = 0; i < points; i += 1) {
    const t = i / (points - 1)
    const drift = avgPrice + (currentPrice - avgPrice) * t
    const noise = (rand() - 0.5) * avgPrice * 0.04
    series.push(i === points - 1 ? currentPrice : drift + noise)
  }

  return series
}
