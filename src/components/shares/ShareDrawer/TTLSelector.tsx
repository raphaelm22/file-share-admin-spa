import styles from './TTLSelector.module.scss'

interface TTLOption {
  label: string
  ttlHours: number | null
}

const TTL_OPTIONS: TTLOption[] = [
  { label: '1H',  ttlHours: 1    },
  { label: '24H', ttlHours: 24   },
  { label: '7D',  ttlHours: 168  },
  { label: 'INF', ttlHours: null },
]

function ttlToSeconds(ttlHours: number | null): number | null {
  return ttlHours !== null ? ttlHours * 3600 : null
}

interface TTLSelectorProps {
  value: number | null
  onChange: (ttlHours: number | null) => void
}

function TTLSelector({ value, onChange }: TTLSelectorProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const currentIndex = TTL_OPTIONS.findIndex(o => o.ttlHours === value)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const next = TTL_OPTIONS[(currentIndex + 1) % TTL_OPTIONS.length]
      onChange(next.ttlHours)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = TTL_OPTIONS[(currentIndex - 1 + TTL_OPTIONS.length) % TTL_OPTIONS.length]
      onChange(prev.ttlHours)
    }
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>// TIME_TO_LIVE (TTL)</span>
      <div
        className={styles.grid}
        role="radiogroup"
        aria-label="Selecionar TTL do link"
        onKeyDown={handleKeyDown}
      >
        {TTL_OPTIONS.map(opt => (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={value === opt.ttlHours}
            tabIndex={value === opt.ttlHours ? 0 : -1}
            className={value === opt.ttlHours ? styles.buttonSelected : styles.button}
            onClick={() => onChange(opt.ttlHours)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {value !== null && (
        <span className={styles.hint}>
          {`> LINK_DECAY: ${ttlToSeconds(value)} SECONDS`}
        </span>
      )}
    </div>
  )
}

export default TTLSelector
