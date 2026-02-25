import type { FileEntry } from '../../../types'
import FileRow from '../FileRow/FileRow'
import styles from './FileList.module.scss'

interface FileListProps {
  files: FileEntry[]
  loading: boolean
  error: string | null
  activeShareFileNames?: Set<string>
  onShare?: (file: FileEntry) => void
}

function FileList({ files, loading, error, activeShareFileNames, onShare }: FileListProps) {
  if (loading) {
    return (
      <div className={styles.state}>
        <span className={styles.stateText}>// ESTABLISHING_CONNECTION...</span>
        <span className={styles.cursor} aria-hidden="true">▋</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.state} role="alert">
        <span className={styles.errorText}>// FETCH_FAILED</span>
        <span className={styles.errorDetail}>{error}</span>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className={styles.state}>
        <span className={styles.stateText}>// AWAITING_INPUT // NO_FILES_DETECTED</span>
        <div className={styles.monitoring}>
          <span className={styles.monitoringDot} aria-hidden="true" />
          <span>MONITORING: ACTIVE</span>
        </div>
      </div>
    )
  }

  return (
    <ul className={styles.list} aria-label="Arquivos monitorados">
      {files.map(file => (
        <FileRow
          key={file.fileName}
          file={file}
          isShared={activeShareFileNames?.has(file.fileName) ?? false}
          onShare={onShare}
        />
      ))}
    </ul>
  )
}

export default FileList
