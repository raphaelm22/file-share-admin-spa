import type { ShareWithStatus } from '../../../types'
import styles from './ShareTable.module.scss'

interface ShareTableProps {
  shares: ShareWithStatus[]
  loading: boolean
  error: string | null
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

function ShareTable({ shares, loading, error }: ShareTableProps) {
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
          </tr>
        </thead>
        <tbody>
          {shares.map(share => (
            <tr key={share.id} className={styles.row}>
              <td className={styles.fileName}>{share.fileName}</td>
              <td className={styles.ttl}>{formatTTLRemaining(share.expiresAt)}</td>
              <td>
                <span className={STATUS_CLASS[share.status]}>
                  {share.status.toUpperCase().replace('-', '_')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default ShareTable
