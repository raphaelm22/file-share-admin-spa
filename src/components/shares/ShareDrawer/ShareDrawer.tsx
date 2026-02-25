import { useState, useEffect } from 'react'
import { FocusTrap } from 'focus-trap-react'
import TTLSelector from './TTLSelector'
import LinkOutput from './LinkOutput'
import QRCodeDisplay from './QRCodeDisplay'
import { createShare } from '../../../api'
import { formatFileSize } from '../../../utils/formatFileSize'
import type { FileEntry } from '../../../types'
import styles from './ShareDrawer.module.scss'

interface ShareDrawerProps {
  file: FileEntry
  onClose: () => void
}

function ShareDrawer({ file, onClose }: ShareDrawerProps) {
  const [ttlHours, setTtlHours] = useState<number | null>(24)
  const [token, setToken] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const shareUrl = token
    ? `${import.meta.env.VITE_PUBLIC_BASE_URL ?? ''}/dl/${token}`
    : null

  useEffect(() => {
    let cancelled = false
    setGenerating(true)
    setError(null)
    setToken(null)
    createShare(file.filePath, ttlHours)
      .then(s => { if (!cancelled) setToken(s.token) })
      .catch((err: Error) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setGenerating(false) })
    return () => { cancelled = true }
  }, [file.filePath, ttlHours])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <FocusTrap focusTrapOptions={{ returnFocusOnDeactivate: true }}>
      <div className={styles.root}>
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-drawer-title"
          className={styles.drawer}
        >
          <div className={styles.header}>
            <h2 id="share-drawer-title" className={styles.title}>// SHARE_CONFIG</h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Fechar drawer"
            >
              ✕
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.targetFile}>
              <span className={styles.targetLabel}>// TARGET_FILE</span>
              <span className={styles.targetName}>{file.fileName}</span>
              <span className={styles.targetSize}>{formatFileSize(file.fileSize)}</span>
            </div>

            {error && (
              <div className={styles.errorBlock} role="alert">
                ERROR // SHARE_FAILED
              </div>
            )}

            <TTLSelector value={ttlHours} onChange={setTtlHours} />

            <LinkOutput
              url={generating ? null : shareUrl}
              onCopy={handleCopy}
              copied={copied}
            />

            <QRCodeDisplay url={generating ? null : shareUrl} />
          </div>
        </div>
      </div>
    </FocusTrap>
  )
}

export default ShareDrawer
