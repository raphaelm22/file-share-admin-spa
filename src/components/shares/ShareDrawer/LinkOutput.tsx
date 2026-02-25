import styles from './LinkOutput.module.scss'

interface LinkOutputProps {
  url: string | null
  onCopy: () => void
  copied: boolean
}

function LinkOutput({ url, onCopy, copied }: LinkOutputProps) {
  return (
    <div className={styles.container}>
      <span className={styles.srAnnounce} aria-live="polite" aria-atomic="true">
        {copied ? 'Link copiado com sucesso' : ''}
      </span>
      <div className={styles.labelRow}>
        <span className={styles.label}>// GENERATED_TOKEN_HASH</span>
        <span className={styles.badge}>SECURE_SSL</span>
      </div>
      <div className={styles.inputWrapper}>
        <span
          className={`${styles.icon} ${url ? styles.iconPulse : ''}`}
          aria-hidden="true"
        >
          ⬡
        </span>
        <input
          type="text"
          readOnly
          value={url ?? 'GENERATING_TOKEN...'}
          aria-label="Link de compartilhamento"
          aria-readonly="true"
          className={`${styles.input} ${!url ? styles.inputGenerating : ''}`}
        />
      </div>
      <button
        type="button"
        className={`${styles.copyButton} ${copied ? styles.copyButtonCopied : ''}`}
        onClick={onCopy}
        disabled={!url}
      >
        {copied ? 'COPIED // LINK_READY' : '[ COPY_TO_CLIPBOARD ]'}
      </button>
    </div>
  )
}

export default LinkOutput
