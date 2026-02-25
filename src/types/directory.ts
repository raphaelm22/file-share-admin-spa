export interface DirectoryNode {
  name: string;
  /**
   * Path relative to the monitored root folder, using forward slashes.
   * Root node uses empty string ''. All other nodes use relative paths.
   * Examples: '' (root), 'backups', 'backups/2025'
   */
  path: string;
  children: DirectoryNode[];
}
