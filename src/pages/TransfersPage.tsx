import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import {
  useCreateTransferMutation,
  useGetBalanceQuery,
  useGetRecipientsQuery,
} from '@/shared/api/apiSlice'
import { Card, Tabs } from '@/shared/ui'

import { recordRecipientUse } from './transfers/favorites'
import { ProgressSteps } from './transfers/ProgressSteps'
import { StepAmount } from './transfers/StepAmount'
import { StepConfirm } from './transfers/StepConfirm'
import { StepRecipient } from './transfers/StepRecipient'
import { StepSuccess } from './transfers/StepSuccess'
import { TemplateGrid } from './transfers/TemplateGrid'
import type { TransferTemplate } from './transfers/TemplateGrid'
import { TransferHistory } from './transfers/TransferHistory'
import { buildTransferSchema } from './transfers/transferSchema'
import type { TransferFormValues } from './transfers/transferSchema'
import styles from './transfers/transfers.module.css'

const SUCCESS_STEP = 3

const PAGE_TABS = [
  { id: 'nueva', label: 'Nueva' },
  { id: 'plantillas', label: 'Plantillas' },
  { id: 'historial', label: 'Historial' },
] as const

type PageTab = (typeof PAGE_TABS)[number]['id']

/** Extrae el `{ message }` del cuerpo de error del servidor (`{status, data:{message}}`). */
function getServerMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: unknown } }).data
    if (data && typeof data.message === 'string') return data.message
  }
  return 'No se pudo enviar la transferencia'
}

export default function TransfersPage() {
  const [step, setStep] = useState(0)
  const [activeTab, setActiveTab] = useState<PageTab>('nueva')
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  const { data: balance } = useGetBalanceQuery()
  // The schema reads the balance lazily — the query may resolve after the
  // form resolver is created, so we go through a ref instead of a closure.
  const balanceRef = useRef<number | undefined>(undefined)
  balanceRef.current = balance?.total

  const { data: recipients } = useGetRecipientsQuery()

  const resolver = useMemo(
    () => zodResolver(buildTransferSchema(() => balanceRef.current)),
    [],
  )

  const form = useForm<TransferFormValues>({
    resolver,
    mode: 'onChange',
    defaultValues: { recipientId: '', amount: Number.NaN, concept: '' },
  })

  const [createTransfer, { isLoading: sending, error: sendError, reset: resetTransfer }] =
    useCreateTransferMutation()

  const values = form.watch()
  const recipient = recipients?.find((user) => user.id === values.recipientId)

  const goNext = async () => {
    if (step === 0 && (await form.trigger('recipientId'))) {
      setStep(1)
    } else if (step === 1 && (await form.trigger(['amount', 'concept']))) {
      setStep(2)
    }
  }

  const goBackToAmount = () => {
    resetTransfer()
    setStep(1)
  }

  const onConfirm = form.handleSubmit(async (data) => {
    try {
      await createTransfer({
        recipientId: data.recipientId,
        amount: data.amount,
        ...(data.concept.trim() ? { concept: data.concept.trim() } : {}),
      }).unwrap()
      recordRecipientUse(data.recipientId)
      setStep(SUCCESS_STEP)
    } catch {
      // El error se muestra inline desde el estado de la mutación.
    }
  })

  const resetWizard = () => {
    form.reset()
    resetTransfer()
    setStep(0)
  }

  /** Pre-rellena el asistente con una plantilla y vuelve al paso de destinatario. */
  const applyTemplate = (template: TransferTemplate) => {
    form.reset({
      recipientId: '',
      amount: template.amount,
      concept: template.concept,
    })
    resetTransfer()
    setStep(0)
    setActiveTab('nueva')
  }

  const slide = reduceMotion ? 0 : 32
  const stepMotion = {
    initial: { opacity: 0, x: slide },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -slide },
    transition: { duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' as const },
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Enviar dinero</h1>
        <Tabs
          tabs={PAGE_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as PageTab)}
        />
        {activeTab === 'nueva' && step < SUCCESS_STEP && (
          <ProgressSteps current={step} onBack={(target) => setStep(target)} />
        )}
      </header>

      {activeTab === 'nueva' && (
        <Card glass padding="lg" className={styles.wizardCard}>
          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && (
              <motion.div key="recipient" {...stepMotion}>
                <StepRecipient form={form} onNext={goNext} />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="amount" {...stepMotion}>
                <StepAmount form={form} onBack={() => setStep(0)} onNext={goNext} />
              </motion.div>
            )}
            {step === 2 && recipient && (
              <motion.div key="confirm" {...stepMotion}>
                <StepConfirm
                  recipient={recipient}
                  values={values}
                  sending={sending}
                  errorMessage={sendError ? getServerMessage(sendError) : null}
                  onBack={goBackToAmount}
                  onConfirm={onConfirm}
                />
              </motion.div>
            )}
            {step === SUCCESS_STEP && recipient && (
              <motion.div key="success" {...stepMotion}>
                <StepSuccess
                  recipient={recipient}
                  amount={values.amount}
                  onReset={resetWizard}
                  onGoDashboard={() => navigate('/app')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {activeTab === 'plantillas' && (
        <div role="tabpanel" aria-label="Plantillas" className={styles.tabPanel}>
          <TemplateGrid onUse={applyTemplate} />
        </div>
      )}

      {activeTab === 'historial' && (
        <div role="tabpanel" aria-label="Historial" className={styles.tabPanel}>
          <TransferHistory />
        </div>
      )}
    </div>
  )
}
