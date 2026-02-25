import { useState, useEffect, useMemo } from 'react'
import type { ReactElement } from 'react'
import TerminalHeader from './components/primitives/TerminalHeader/TerminalHeader'
import FileList from './components/dashboard/FileList/FileList'
import ShareDrawer from './components/shares/ShareDrawer/ShareDrawer'
import ShareTable from './components/shares/ShareTable/ShareTable'
import { fetchFiles, fetchShares, fetchSystemStats, fetchDirectoryTree } from './api'
import { useSignalR, type ConnectionStatus } from './hooks/useSignalR'
import type { FileEntry, ShareWithStatus, SystemStats } from './types'
import { TelemetryCard } from './components/dashboard/TelemetryCard/TelemetryCard'
import { DirectoryTree } from './components/DirectoryTree/DirectoryTree'
import type { DirectoryNode } from './types/directory'
import styles from './App.module.scss'

function App(): ReactElement {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting')
  const [sharingFile, setSharingFile] = useState<FileEntry | null>(null)
  const [shares, setShares] = useState<ShareWithStatus[]>([])
  const [sharesLoading, setSharesLoading] = useState(true)
  const [sharesError, setSharesError] = useState<string | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [directoryTree, setDirectoryTree] = useState<DirectoryNode | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [treeExpanded, setTreeExpanded] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchFiles()
      .then(data => {
        if (isMounted) {
          setFiles(data)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchShares()
      .then(data => {
        if (isMounted) {
          setShares(data)
          setSharesLoading(false)
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setSharesError(err.message)
          setSharesLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchSystemStats()
      .then(data => { if (isMounted) setSystemStats(data) })
      .catch(() => { /* stats ficam null — placeholder '--' é exibido */ })
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    let isMounted = true
    fetchDirectoryTree()
      .then(tree => { if (isMounted) setDirectoryTree(tree) })
      .catch(() => { /* tree fica null — FileList permanece funcional sem árvore */ })
    return () => { isMounted = false }
  }, [])

  const activeShareFileNames = useMemo(
    () => new Set(shares.filter(s => s.status === 'active').map(s => s.fileName)),
    [shares]
  )

  const filteredFiles = useMemo(
    () => selectedPath === null
      ? files
      : files.filter(f => f.directory === selectedPath),
    [files, selectedPath]
  )

  useSignalR({
    onFileAdded: (entry) => setFiles(prev => {
      if (prev.some(f => f.fileName === entry.fileName)) return prev
      return [...prev, { ...entry, directory: entry.directory ?? '' }]
    }),
    onFileRemoved: ({ fileName }) => setFiles(prev =>
      prev.filter(f => f.fileName !== fileName)
    ),
    onStatusChange: setConnectionStatus,
    onShareExpired: ({ token }) => setShares(prev =>
      prev.map(s => s.token === token ? { ...s, status: 'expired' as const } : s)
    ),
    onSystemStats: setSystemStats,
  })

  return (
    <div className={styles.app}>
      <TerminalHeader status={connectionStatus} />
      <main className={styles.main}>
        <div className={styles.telemetryGrid}>
          <TelemetryCard variant="cpu"    stats={systemStats} />
          <TelemetryCard variant="memory" stats={systemStats} />
          <TelemetryCard variant="disk"   stats={systemStats} />
        </div>
        <div className={styles.browserPane}>
          {directoryTree && (
            <div className={styles.treePanel}>
              <button
                type="button"
                className={styles.treePanelToggle}
                onClick={() => setTreeExpanded(prev => !prev)}
                aria-expanded={treeExpanded}
                aria-controls="directory-tree-content"
              >
                {treeExpanded ? '▾' : '▸'} DIRECTORY_TREE
              </button>
              <div
                id="directory-tree-content"
                className={!treeExpanded ? styles.treeContentCollapsed : undefined}
              >
                <DirectoryTree
                  tree={directoryTree}
                  selectedPath={selectedPath}
                  onSelect={setSelectedPath}
                />
              </div>
            </div>
          )}
          <div className={styles.fileListPanel}>
            <FileList
              files={filteredFiles}
              loading={loading}
              error={error}
              activeShareFileNames={activeShareFileNames}
              onShare={setSharingFile}
            />
          </div>
        </div>
        <ShareTable shares={shares} loading={sharesLoading} error={sharesError} />
      </main>
      {sharingFile && (
        <ShareDrawer file={sharingFile} onClose={() => setSharingFile(null)} />
      )}
    </div>
  )
}

export default App
