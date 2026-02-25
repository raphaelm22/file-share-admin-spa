import type { CSSProperties } from 'react'
import styles from './TelemetryCard.module.scss'
import type { SystemStats } from '../../../types'

type Variant = 'cpu' | 'memory' | 'disk'

interface TelemetryCardProps {
  variant: Variant
  stats: SystemStats | null
}

const LABELS: Record<Variant, string> = {
  cpu:    'CPU_LOAD',
  memory: 'RAM_USAGE',
  disk:   'DISK_SPACE',
}

function classNames(...parts: string[]): string {
  return parts.filter(Boolean).join(' ')
}

function getPercent(variant: Variant, stats: SystemStats): number {
  switch (variant) {
    case 'cpu':    return stats.cpuPercent
    case 'memory': return stats.ramTotalMb > 0 ? (stats.ramUsedMb / stats.ramTotalMb) * 100 : 0
    case 'disk':   return stats.diskTotalGb > 0 ? (stats.diskUsedGb / stats.diskTotalGb) * 100 : 0
  }
}

function getStateClass(percent: number): string {
  if (percent > 95) return styles.critical
  if (percent > 80) return styles.warning
  return ''
}

function getHeaderValue(variant: Variant, stats: SystemStats): string {
  switch (variant) {
    case 'cpu':    return `${stats.cpuPercent.toFixed(1)}%`
    case 'memory': return `${stats.ramUsedMb} MB`
    case 'disk':   return `${stats.diskUsedGb.toFixed(1)} GB`
  }
}

function getFooterText(variant: Variant, stats: SystemStats): string {
  switch (variant) {
    case 'cpu':    return ''
    case 'memory': return `TOTAL: ${stats.ramTotalMb} MB`
    case 'disk':   return `TOTAL: ${stats.diskTotalGb.toFixed(1)} GB`
  }
}

export function TelemetryCard({ variant, stats }: TelemetryCardProps) {
  const label = LABELS[variant]
  const isLoading = stats === null
  const percent = isLoading ? 0 : getPercent(variant, stats)
  const stateClass = isLoading ? '' : getStateClass(percent)
  const headerValue = isLoading ? '--' : getHeaderValue(variant, stats)
  const footerText = isLoading ? '' : getFooterText(variant, stats)

  return (
    <article
      className={classNames(styles.card, stateClass)}
      role="meter"
      aria-valuenow={isLoading ? undefined : Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-busy={isLoading || undefined}
      aria-label={`${label}: ${headerValue}`}
    >
      <header className={styles.header}>
        <span className={styles.label}>// {label}</span>
        <span className={classNames(styles.value, stateClass)}>{headerValue}</span>
      </header>

      <div className={styles.body}>
        {variant === 'cpu'    && <CpuChart percent={percent} isLoading={isLoading} stateClass={stateClass} />}
        {variant === 'memory' && <MemoryBar percent={percent} isLoading={isLoading} stateClass={stateClass} />}
        {variant === 'disk'   && <DiskPie percent={percent} isLoading={isLoading} stateClass={stateClass} />}
      </div>

      {footerText && (
        <footer className={styles.footer}>
          <span>{footerText}</span>
        </footer>
      )}
    </article>
  )
}

interface ChartProps {
  percent: number
  isLoading: boolean
  stateClass: string
}

// Bars 1-7 are decorative (fixed heights suggesting history); bar 8 = current value
const CPU_DECORATIVE_HEIGHTS = [40, 55, 30, 70, 45, 60, 35]

function CpuChart({ percent, isLoading, stateClass }: ChartProps) {
  const heights = isLoading
    ? Array(8).fill(0)
    : [...CPU_DECORATIVE_HEIGHTS, percent]
  return (
    <div className={styles.cpuChart} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={classNames(styles.cpuBar, i === 7 ? stateClass : '')}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  )
}

function MemoryBar({ percent, isLoading, stateClass }: ChartProps) {
  return (
    <div className={styles.memoryTrack} aria-hidden="true">
      <div
        className={classNames(styles.memoryFill, stateClass)}
        style={{ width: isLoading ? '0%' : `${Math.min(percent, 100)}%` }}
      />
    </div>
  )
}

function DiskPie({ percent, isLoading, stateClass }: ChartProps) {
  const angle = isLoading ? 0 : (percent / 100) * 360
  return (
    <div
      className={classNames(styles.diskPie, stateClass)}
      style={{ '--pie-angle': `${angle}deg` } as CSSProperties}
      aria-hidden="true"
    />
  )
}
