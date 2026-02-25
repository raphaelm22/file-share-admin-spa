import { useState } from 'react'
import type { FileEntry } from '../../../types'
import { formatFileSize } from '../../../utils/formatFileSize'
import FileActionsBar from './FileActionsBar'
import styles from './FileRow.module.scss'

function formatDate(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface FileRowProps {
  file: FileEntry
  isShared?: boolean
  onShare?: (file: FileEntry) => void
}

function FileRow({ file, isShared, onShare }: FileRowProps) {
  const [expanded, setExpanded] = useState(false)
  const actionsBarId = `file-actions-${file.fileName.replace(/[^a-zA-Z0-9]/g, '-')}`

  return (
    <li className={styles.row}>
      <button
        type="button"
        className={styles.rowHeader}
        onClick={() => setExpanded(prev => !prev)}
        aria-expanded={expanded}
        aria-controls={expanded ? actionsBarId : undefined}
        aria-label={`${file.fileName}, ${formatFileSize(file.fileSize)}`}
      >
        <span className={styles.typeTag}>[FILE]</span>
        <span className={styles.fileName}>{file.fileName}</span>
        {isShared
          ? <span className={styles.sharedBadge} aria-label="Arquivo compartilhado ativamente">SHARED_ACTIVE</span>
          : <span aria-hidden="true" />
        }
        <span className={styles.fileSize}>{formatFileSize(file.fileSize)}</span>
        <span className={styles.modifiedAt}>{formatDate(file.modifiedAt)}</span>
      </button>
      {expanded && (
        <FileActionsBar
          id={actionsBarId}
          onShare={onShare ? () => onShare(file) : undefined}
        />
      )}
    </li>
  )
}

export default FileRow
