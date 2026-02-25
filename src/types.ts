export interface FileEntry {
  filePath: string   // caminho absoluto no servidor — usado em POST /api/v1/shares (admin only)
  fileName: string
  fileSize: number   // bytes — formatar no componente
  modifiedAt: string // ISO 8601 UTC — formatar no componente
  directory: string  // caminho relativo do diretório pai — "" para root, "backups" para backups/, etc.
}

export interface Share {
  id: string
  token: string
  fileName: string
  fileSize: number
  expiresAt: string | null // ISO 8601 UTC, null = TTL infinito
  createdAt: string        // ISO 8601 UTC
}

export interface ShareWithStatus extends Share {
  status: 'active' | 'expired' | 'file-removed'
}

export interface SystemStats {
  cpuPercent: number       // 0-100
  ramUsedMb: number        // megabytes
  ramTotalMb: number       // megabytes
  diskUsedGb: number       // gigabytes
  diskTotalGb: number      // gigabytes
}
