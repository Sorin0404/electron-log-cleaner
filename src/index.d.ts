/**
 * electron-log file transport interface
 * Defines only the parts we actually use
 */
export interface ElectronLogFileTransport {
  /**
   * Current log file name
   */
  fileName: string;

  /**
   * Maximum size of a single log file in bytes
   */
  maxSize?: number;

  /**
   * Log format string
   */
  format?: string;

  /**
   * Minimum log level to write to file
   */
  level?: string | false;

  /**
   * Get current log file information
   * @returns Object containing the current log file path
   */
  getFile(): { path: string };
}

/**
 * electron-log instance interface
 * Defines only the parts we actually use
 */
export interface ElectronLog {
  transports: {
    file: ElectronLogFileTransport;
  };
}

/**
 * File transport options for electron-log
 */
export interface FileTransportOptions {
  /**
   * Maximum size of a single log file in bytes
   */
  maxSize?: number;

  /**
   * Log format string
   * @example '[{y}-{m}-{d}] {text}'
   */
  format?: string;

  /**
   * Minimum log level to write to file
   */
  level?: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly' | false;
}

/**
 * Options for configuring the log cleaner
 */
export interface CleanerOptions {
  /**
   * Maximum age of log files in days
   * Files older than this will be deleted
   */
  maxAge: number;

  /**
   * electron-log instance to use
   * If not provided, will attempt to auto-detect
   */
  electronLog?: ElectronLog;

  /**
   * File transport options to apply to electron-log
   */
  fileTransport?: FileTransportOptions;

  /**
   * Error callback function
   * Called when an error occurs during cleanup
   */
  onError?: (error: Error) => void;
}

/**
 * Result of a cleanup operation
 */
export interface CleanupResult {
  /**
   * Number of files deleted
   */
  deletedCount: number;

  /**
   * Array of deleted file names
   */
  deletedFiles: string[];

  /**
   * Error message if cleanup failed
   */
  error?: string;
}

/**
 * Statistics about log files
 */
export interface CleanupStats {
  /**
   * Total number of log files
   */
  totalFiles: number;

  /**
   * Total size of all log files in bytes
   */
  totalSize: number;

  /**
   * Name of the oldest log file
   */
  oldestFile: string | null;

  /**
   * Date of the oldest log file (formatted as YYYY-MM-DD HH:mm:ss)
   */
  oldestDate: string | null;

  /**
   * Name of the newest log file
   */
  newestFile: string | null;

  /**
   * Date of the newest log file (formatted as YYYY-MM-DD HH:mm:ss)
   */
  newestDate: string | null;

  /**
   * Path to the log directory
   */
  logDir: string;

  /**
   * Current date in YYYYMMDD format
   */
  currentDate: string;

  /**
   * Error message if stats retrieval failed
   */
  error?: string;
}

/**
 * ElectronLogCleaner instance interface
 */
export interface ElectronLogCleanerInstance {
  /**
   * Setup the log cleaner with options
   * @param options Configuration options
   * @throws {Error} If setup fails
   */
  setup(options: CleanerOptions): void;

  /**
   * Clean up old log files
   * @returns Cleanup result with deleted file information
   */
  cleanup(): CleanupResult;

  /**
   * Get statistics about log files
   * @returns Statistics object
   */
  getStats(): CleanupStats;
}

/**
 * ElectronLogCleaner class (for testing)
 */
export class ElectronLogCleaner implements ElectronLogCleanerInstance {
  setup(options: CleanerOptions): void;
  cleanup(): CleanupResult;
  getStats(): CleanupStats;
}

/**
 * Singleton instance of ElectronLogCleaner
 */
declare const cleaner: ElectronLogCleanerInstance;

export default cleaner;
