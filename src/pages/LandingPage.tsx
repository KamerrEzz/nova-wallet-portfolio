import { motion } from 'framer-motion'
import { useScrollProgress } from '@/shared/hooks'
import { LandingNav } from './landing/LandingNav'
import { HeroSection } from './landing/HeroSection'
import { MarqueeSection } from './landing/MarqueeSection'
import { FeaturesSection } from './landing/FeaturesSection'
import { CardShowcaseSection } from './landing/CardShowcaseSection'
import { StatsSection } from './landing/StatsSection'
import { TestimonialsSection } from './landing/TestimonialsSection'
import { CtaSection } from './landing/CtaSection'
import { LandingFooter } from './landing/LandingFooter'
import styles from './landing/LandingPage.module.css'

export default function LandingPage() {
  const { progress } = useScrollProgress()

  return (
    <div className={styles.page}>
      <motion.div className={styles.progressBar} style={{ scaleX: progress }} aria-hidden="true" />
      <LandingNav />
      <main>
        <HeroSection />
        <MarqueeSection />
        <FeaturesSection />
        <CardShowcaseSection />
        <StatsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
