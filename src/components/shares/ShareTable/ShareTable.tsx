import { useState } from 'react'
import type { ShareWithStatus } from '../../../types'
import styles from './ShareTable.module.scss'

interface ShareTableProps {
  shares: ShareWithStatus[]
  loading: boolean
  error: string | null
  onRevoke?: (id: string) => Promise<void>
}

function formatTTLRemaining(expiresAt: string | null): string {
  if (expiresAt === null) return '∞'
  const diffMs = new Date(expiresAt).getTime() - Date.now()
  if (diffMs <= 0) return 'EXPIRED'
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}H ${String(minutes).padStart(2, '0')}M`
  return `${minutes}M`
}

const STATUS_CLASS: Record<ShareWithStatus['status'], string> = {
  active: styles.badgeActive,
  expired: styles.badgeExpired,
  'file-removed': styles.badgeFileRemoved,
}

function ShareTable({ shares, loading, error, onRevoke }: ShareTableProps) {
  // Two-step revoke: the first click arms the row, the second one deletes the share
  const [armedId, setArmedId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [failedId, setFailedId] = useState<string | null>(null)

  async function handleRevokeClick(id: string) {
    if (!onRevoke) return
    if (armedId !== id) {
      setArmedId(id)
      setFailedId(null)
      return
    }
    setBusyId(id)
    try {
      await onRevoke(id)
      setArmedId(null)
    } catch {
      setFailedId(id)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className={styles.state}>
        <span className={styles.stateText}>// FETCHING_ACTIVE_SHARES...</span>
        <span className={styles.cursor} aria-hidden="true">▋</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <span className={styles.errorText}>// SHARES_FETCH_FAILED</span>
        <span className={styles.errorDetail}>{error}</span>
      </div>
    )
  }

  if (shares.length === 0) {
    return (
      <div className={styles.state}>
        <span className={styles.stateText}>// NO_ACTIVE_SHARES_DETECTED</span>
      </div>
    )
  }

  return (
    <section aria-label="Compartilhamentos ativos">
      <h2 className={styles.sectionTitle}>// ACTIVE_SHARES</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.th}>FILE</th>
            <th scope="col" className={styles.th}>TTL_REMAINING</th>
            <th scope="col" className={styles.th}>STATUS</th>
            {onRevoke && (
              <th scope="col" className={styles.th}>
                <span className={styles.srOnly}>Ações</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {shares.map(share => {
            const armed = armedId === share.id
            const busy = busyId === share.id
            return (
              <tr key={share.id} className={styles.row}>
                <td className={styles.fileName}>{share.fileName}</td>
                <td className={styles.ttl}>{formatTTLRemaining(share.expiresAt)}</td>
                <td>
                  <span className={STATUS_CLASS[share.status]}>
                    {share.status.toUpperCase().replace('-', '_')}
                  </span>
                </td>
                {onRevoke && (
                  <td className={styles.actions}>
                    <button
                      type="button"
                      className={armed ? styles.revokeArmed : styles.revoke}
                      onClick={() => handleRevokeClick(share.id)}
                      onBlur={() => { if (armed && !busy) setArmedId(null) }}
                      disabled={busy}
                      aria-label={armed
                        ? `Confirmar revogação de ${share.fileName}`
                        : `Revogar link de ${share.fileName}`}
                    >
                      {busy ? 'REVOKING...' : armed ? 'CONFIRM?' : 'REVOKE'}
                    </button>
                    {failedId === share.id && (
                      <span role="alert" className={styles.revokeError}>FAILED</span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

export default ShareTable
