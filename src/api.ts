import type { CreatedShare, FileEntry, ShareWithStatus, SystemStats } from './types'
import type { DirectoryNode } from './types/directory'

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json() as Promise<T>
}

export async function fetchFiles(): Promise<FileEntry[]> {
  return fetchJson<FileEntry[]>('/api/v1/files')
}

export async function fetchShares(): Promise<ShareWithStatus[]> {
  return fetchJson<ShareWithStatus[]>('/api/v1/shares')
}

export async function fetchSystemStats(): Promise<SystemStats> {
  return fetchJson<SystemStats>('/api/v1/system')
}

export async function fetchDirectoryTree(): Promise<DirectoryNode> {
  const data = await fetchJson<{ root: DirectoryNode }>('/api/v1/directories')
  return data.root
}

export async function createShare(filePath: string, ttlHours: number | null): Promise<CreatedShare> {
  const response = await fetch('/api/v1/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath, ttlHours }),
  })
  if (!response.ok) {
    const problem = await response.json() as { detail?: string }
    throw new Error(problem.detail ?? `HTTP ${response.status}`)
  }
  return response.json() as Promise<CreatedShare>
}

export async function revokeShare(id: string): Promise<void> {
  const response = await fetch(`/api/v1/shares/${encodeURIComponent(id)}`, { method: 'DELETE' })
  // 404 = already gone (expired and cleaned up, or revoked elsewhere): same end state
  if (!response.ok && response.status !== 404) throw new Error(`HTTP ${response.status}`)
}
