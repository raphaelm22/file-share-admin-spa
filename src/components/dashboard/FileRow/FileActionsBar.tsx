import styles from './FileActionsBar.module.scss'

interface FileActionsBarProps {
  id: string
  onShare?: () => void
}

function FileActionsBar({ id, onShare }: FileActionsBarProps) {
  return (
    <div id={id} className={styles.bar}>
      <button type="button" className={styles.shareButton} onClick={onShare}>
        [ SHARE ]
      </button>
    </div>
  )
}

export default FileActionsBar
