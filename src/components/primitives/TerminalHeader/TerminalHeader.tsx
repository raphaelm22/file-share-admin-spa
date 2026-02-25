import type { ReactElement } from 'react'
import styles from './TerminalHeader.module.scss'

interface TerminalHeaderProps {
  status?: 'secure' | 'connecting' | 'reconnecting'
}

const statusLabels = {
  secure: 'SECURE',
  connecting: 'CONNECTING...',
  reconnecting: 'RECONNECTING...',
} as const

function TerminalHeader({ status = 'secure' }: TerminalHeaderProps): ReactElement {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <span className={styles.title}>// RASPBERRY_PI_GATEWAY</span>
        <span className={styles.status} data-status={status} role="status">
          CONN: {statusLabels[status]}
        </span>
      </div>
    </header>
  )
}

export default TerminalHeader
