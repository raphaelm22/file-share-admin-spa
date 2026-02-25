import { render, screen } from '@testing-library/react'
import TerminalHeader from './TerminalHeader'

describe('TerminalHeader', () => {
  it('renderiza o título // RASPBERRY_PI_GATEWAY', () => {
    render(<TerminalHeader />)
    expect(screen.getByText('// RASPBERRY_PI_GATEWAY')).toBeInTheDocument()
  })

  it('exibe CONN: SECURE por padrão', () => {
    render(<TerminalHeader />)
    expect(screen.getByText('CONN: SECURE')).toBeInTheDocument()
  })

  it('exibe CONN: CONNECTING... quando status="connecting"', () => {
    render(<TerminalHeader status="connecting" />)
    expect(screen.getByText('CONN: CONNECTING...')).toBeInTheDocument()
  })

  it('exibe CONN: RECONNECTING... quando status="reconnecting"', () => {
    render(<TerminalHeader status="reconnecting" />)
    expect(screen.getByText('CONN: RECONNECTING...')).toBeInTheDocument()
  })
})
