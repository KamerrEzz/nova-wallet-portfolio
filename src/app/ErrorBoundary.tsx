import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

import styles from './ErrorBoundary.module.css'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false })
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className={styles.root}>
          <h1 className={styles.title}>Algo salió mal</h1>
          <p className={styles.text}>
            Se produjo un error inesperado. Puedes intentarlo de nuevo o recargar la página.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={this.handleReset}>
              Reintentar
            </button>
            <button type="button" className={styles.secondary} onClick={this.handleReload}>
              Recargar página
            </button>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
