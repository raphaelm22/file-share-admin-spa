import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import type { FileEntry, SystemStats } from '../types'

export type ConnectionStatus = 'secure' | 'connecting' | 'reconnecting'

interface UseSignalROptions {
  onFileAdded: (entry: FileEntry) => void
  onFileRemoved: (payload: { fileName: string }) => void
  onStatusChange: (status: ConnectionStatus) => void
  onShareExpired?: (payload: { token: string; fileName: string }) => void
  onSystemStats?: (stats: SystemStats) => void
}

export function useSignalR({ onFileAdded, onFileRemoved, onStatusChange, onShareExpired, onSystemStats }: UseSignalROptions) {
  const onFileAddedRef = useRef(onFileAdded)
  const onFileRemovedRef = useRef(onFileRemoved)
  const onStatusChangeRef = useRef(onStatusChange)
  const onShareExpiredRef = useRef(onShareExpired)
  const onSystemStatsRef = useRef(onSystemStats)

  onFileAddedRef.current = onFileAdded
  onFileRemovedRef.current = onFileRemoved
  onStatusChangeRef.current = onStatusChange
  onShareExpiredRef.current = onShareExpired
  onSystemStatsRef.current = onSystemStats

  useEffect(() => {
    let isMounted = true
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/fileshare')
      .withAutomaticReconnect()
      .build()

    connection.on('FileAdded', (entry: FileEntry) => onFileAddedRef.current(entry))
    connection.on('FileRemoved', (payload: { fileName: string }) => onFileRemovedRef.current(payload))
    connection.on('ShareExpired', (payload: { token: string; fileName: string }) => onShareExpiredRef.current?.(payload))
    connection.on('SystemStats', (stats: SystemStats) => onSystemStatsRef.current?.(stats))

    connection.onreconnecting(() => onStatusChangeRef.current('reconnecting'))
    connection.onreconnected(() => onStatusChangeRef.current('secure'))
    connection.onclose(() => onStatusChangeRef.current('reconnecting'))

    onStatusChangeRef.current('connecting')
    connection.start()
      .then(() => { if (isMounted) onStatusChangeRef.current('secure') })
      .catch(() => { if (isMounted) onStatusChangeRef.current('reconnecting') })

    return () => {
      isMounted = false
      connection.stop().catch(() => {})
    }
  }, [])
}
