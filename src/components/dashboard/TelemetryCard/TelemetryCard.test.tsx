import { render, screen } from '@testing-library/react'
import { TelemetryCard } from './TelemetryCard'
import type { SystemStats } from '../../../types'

const defaultStats: SystemStats = {
  cpuPercent: 42.5,
  ramUsedMb: 1024,
  ramTotalMb: 4096,
  diskUsedGb: 12.34,
  diskTotalGb: 119.24,
}

describe('TelemetryCard', () => {
  describe('loading state (stats = null)', () => {
    it('renders -- placeholder for cpu variant', () => {
      // Arrange
      render(<TelemetryCard variant="cpu" stats={null} />)

      // Act & Assert
      expect(screen.getByRole('meter')).toBeInTheDocument()
      expect(screen.getByText('--')).toBeInTheDocument()
    })

    it('renders -- placeholder for memory variant', () => {
      // Arrange
      render(<TelemetryCard variant="memory" stats={null} />)

      // Act & Assert
      expect(screen.getByText('--')).toBeInTheDocument()
    })

    it('renders -- placeholder for disk variant', () => {
      // Arrange
      render(<TelemetryCard variant="disk" stats={null} />)

      // Act & Assert
      expect(screen.getByText('--')).toBeInTheDocument()
    })
  })

  describe('cpu variant', () => {
    it('renders cpu percentage value', () => {
      // Arrange
      render(<TelemetryCard variant="cpu" stats={defaultStats} />)

      // Act & Assert
      expect(screen.getByText('42.5%')).toBeInTheDocument()
    })

    it('does not render footer for cpu variant', () => {
      // Arrange
      const { container } = render(<TelemetryCard variant="cpu" stats={defaultStats} />)

      // Act & Assert
      // CPU não tem "total" — footer deve estar ausente
      expect(container.querySelector('footer')).not.toBeInTheDocument()
    })

    it('has correct aria attributes', () => {
      // Arrange
      render(<TelemetryCard variant="cpu" stats={defaultStats} />)

      // Act & Assert
      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuenow', '43') // Math.round(42.5)
      expect(meter).toHaveAttribute('aria-valuemin', '0')
      expect(meter).toHaveAttribute('aria-valuemax', '100')
      expect(meter).not.toHaveAttribute('aria-busy') // não loading
    })

    it('has aria-busy when loading', () => {
      // Arrange
      render(<TelemetryCard variant="cpu" stats={null} />)

      // Act & Assert
      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-busy', 'true')
      expect(meter).not.toHaveAttribute('aria-valuenow') // undefined quando loading
    })
  })

  describe('memory variant', () => {
    it('renders ram used value', () => {
      // Arrange
      render(<TelemetryCard variant="memory" stats={defaultStats} />)

      // Act & Assert
      expect(screen.getByText('1024 MB')).toBeInTheDocument()
    })

    it('renders total ram in footer', () => {
      // Arrange
      render(<TelemetryCard variant="memory" stats={defaultStats} />)

      // Act & Assert
      expect(screen.getByText('TOTAL: 4096 MB')).toBeInTheDocument()
    })

    it('has correct aria-valuenow for memory percent', () => {
      // Arrange
      // 1024 / 4096 = 25%
      render(<TelemetryCard variant="memory" stats={defaultStats} />)

      // Act & Assert
      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuenow', '25')
    })
  })

  describe('disk variant', () => {
    it('renders disk used value', () => {
      // Arrange
      render(<TelemetryCard variant="disk" stats={defaultStats} />)

      // Act & Assert
      expect(screen.getByText('12.3 GB')).toBeInTheDocument()
    })

    it('renders total disk in footer', () => {
      // Arrange
      render(<TelemetryCard variant="disk" stats={defaultStats} />)

      // Act & Assert
      expect(screen.getByText('TOTAL: 119.2 GB')).toBeInTheDocument()
    })

    it('has correct aria-valuenow for disk percent', () => {
      // Arrange
      // 12.34 / 119.24 = 10.35%
      render(<TelemetryCard variant="disk" stats={defaultStats} />)

      // Act & Assert
      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuenow', '10')
    })
  })

  describe('color thresholds', () => {
    it('applies warning class when cpu > 80%', () => {
      // Arrange
      const highStats: SystemStats = { ...defaultStats, cpuPercent: 85 }
      const { container } = render(<TelemetryCard variant="cpu" stats={highStats} />)

      // Act & Assert
      // O elemento .value deve ter a classe 'warning'
      expect(container.querySelector('[class*="warning"]')).toBeInTheDocument()
    })

    it('applies critical class when cpu > 95%', () => {
      // Arrange
      const criticalStats: SystemStats = { ...defaultStats, cpuPercent: 97 }
      const { container } = render(<TelemetryCard variant="cpu" stats={criticalStats} />)

      // Act & Assert
      expect(container.querySelector('[class*="critical"]')).toBeInTheDocument()
    })

    it('applies warning class when memory > 80%', () => {
      // Arrange
      // 3400 / 4000 = 85%
      const highStats: SystemStats = { ...defaultStats, ramUsedMb: 3400, ramTotalMb: 4000 }
      const { container } = render(<TelemetryCard variant="memory" stats={highStats} />)

      // Act & Assert
      expect(container.querySelector('[class*="warning"]')).toBeInTheDocument()
    })

    it('applies critical class when disk > 95%', () => {
      // Arrange
      // 96 / 100 = 96%
      const criticalStats: SystemStats = { ...defaultStats, diskUsedGb: 96, diskTotalGb: 100 }
      const { container } = render(<TelemetryCard variant="disk" stats={criticalStats} />)

      // Act & Assert
      expect(container.querySelector('[class*="critical"]')).toBeInTheDocument()
    })

    it('does not apply warning class at 80% (threshold is strictly >80)', () => {
      // Arrange
      const borderStats: SystemStats = { ...defaultStats, cpuPercent: 80 }
      const { container } = render(<TelemetryCard variant="cpu" stats={borderStats} />)

      // Act & Assert
      expect(container.querySelector('[class*="warning"]')).not.toBeInTheDocument()
      expect(container.querySelector('[class*="critical"]')).not.toBeInTheDocument()
    })
  })

  describe('label display', () => {
    it('shows CPU_LOAD label for cpu variant', () => {
      // Arrange & Act
      render(<TelemetryCard variant="cpu" stats={null} />)

      // Assert
      expect(screen.getByText(/CPU_LOAD/)).toBeInTheDocument()
    })

    it('shows RAM_USAGE label for memory variant', () => {
      // Arrange & Act
      render(<TelemetryCard variant="memory" stats={null} />)

      // Assert
      expect(screen.getByText(/RAM_USAGE/)).toBeInTheDocument()
    })

    it('shows DISK_SPACE label for disk variant', () => {
      // Arrange & Act
      render(<TelemetryCard variant="disk" stats={null} />)

      // Assert
      expect(screen.getByText(/DISK_SPACE/)).toBeInTheDocument()
    })
  })
})
