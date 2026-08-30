import { useState } from 'react'

import { Card, Select, Switch } from '@/shared/ui'

import styles from './AutoRulesCard.module.css'

const PERCENTAGE_OPTIONS = [5, 10, 15, 20]

export function AutoRulesCard() {
  const [roundUp, setRoundUp] = useState(false)
  const [percentage, setPercentage] = useState(false)
  const [percentageValue, setPercentageValue] = useState(String(PERCENTAGE_OPTIONS[1]))

  return (
    <Card padding="lg" aria-labelledby="auto-rules-heading" className={styles.card}>
      <div className={styles.header}>
        <h2 id="auto-rules-heading" className={styles.heading}>
          Reglas automáticas
        </h2>
        <p className={styles.subtitle}>Ahorra sin pensar: deja que las reglas trabajen por ti.</p>
      </div>

      <div className={styles.rule}>
        <div className={styles.ruleInfo}>
          <span className={styles.ruleName}>Redondeo</span>
          <span className={styles.ruleDescription}>
            Redondea cada compra al euro y guarda la diferencia.
          </span>
        </div>
        <Switch
          checked={roundUp}
          onChange={setRoundUp}
          label={roundUp ? 'Desactivar redondeo' : 'Activar redondeo'}
        />
      </div>

      <div className={styles.rule}>
        <div className={styles.ruleInfo}>
          <span className={styles.ruleName}>Porcentaje de cada ingreso</span>
          <span className={styles.ruleDescription}>
            Aparte automáticamente una parte de lo que recibas.
          </span>
        </div>
        <div className={styles.ruleControls}>
          {percentage && (
            <Select
              value={percentageValue}
              onChange={(event) => setPercentageValue(event.target.value)}
              aria-label="Porcentaje de cada ingreso"
            >
              {PERCENTAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}%
                </option>
              ))}
            </Select>
          )}
          <Switch
            checked={percentage}
            onChange={setPercentage}
            label={percentage ? 'Desactivar porcentaje' : 'Activar porcentaje'}
          />
        </div>
      </div>
    </Card>
  )
}
