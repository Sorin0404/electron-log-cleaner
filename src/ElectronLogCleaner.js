const dayjs = require('dayjs');
const path = require('node:path');
const fs = require('node:fs');
const { validateOptions } = require('./utils/validator');
const { logInfo, logError, logWarning } = require('./utils/logger');

/**
 * ElectronLogCleaner - Automatically clean up old Electron logs
 * @class
 */
class ElectronLogCleaner {
  constructor() {
    this.maxAge = 30;
    this.log = null;
    this.logDir = null;
    this.currentDate = dayjs().format('YYYYMMDD');
    this.schedulerId = null;
    this.options = null;
  }

  /**
   * Setup the log cleaner with options
   * @param {Object} options - Configuration options
   * @param {number} options.maxAge - Maximum age of log files in days
   * @param {Object} [options.electronLog] - electron-log instance
   * @param {Object} [options.fileTransport] - File transport options
   * @param {Function} [options.onError] - Error callback
   * @throws {Error} If setup fails
   */
  setup(options) {
    try {
      // Validate options
      validateOptions(options);

      // Store options
      this.options = options;

      // Set maxAge
      this.maxAge = options.maxAge;

      // Get electron-log instance
      this.log = options.electronLog || this.getElectronLog();

      // Apply fileTransport options if provided
      if (options.fileTransport) {
        this.applyFileTransportOptions(options.fileTransport);
      }

      // Update file name with current date
      this.updateFileName();

      // Set log directory
      this.logDir = path.dirname(this.log.transports.file.getFile().path);

      // Schedule midnight check
      this.scheduleMidnightCheck();

      // Register quit handler
      this.registerQuitHandler();

      // Run initial cleanup
      this.cleanup();

      // Log success
      logInfo(`Setup complete. Max age: ${this.maxAge} days, Log dir: ${this.logDir}`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get electron-log instance
   * @private
   * @returns {Object} electron-log instance
   * @throws {Error} If electron-log is not found
   */
  getElectronLog() {
    try {
      // Try to require electron-log/main
      // eslint-disable-next-line global-require, import/no-unresolved
      return require('electron-log/main');
    } catch (error) {
      throw new Error('electron-log not found. Please install it or provide electronLog option.');
    }
  }

  /**
   * Apply file transport options to electron-log
   * @private
   * @param {Object} fileTransport - File transport options
   */
  applyFileTransportOptions(fileTransport) {
    if (fileTransport.maxSize !== undefined) {
      this.log.transports.file.maxSize = fileTransport.maxSize;
      logInfo(`File transport maxSize set to: ${fileTransport.maxSize}`);
    }

    if (fileTransport.format !== undefined) {
      this.log.transports.file.format = fileTransport.format;
      logInfo(`File transport format set to: ${fileTransport.format}`);
    }

    if (fileTransport.level !== undefined) {
      this.log.transports.file.level = fileTransport.level;
      logInfo(`File transport level set to: ${fileTransport.level}`);
    }
  }

  /**
   * Handle errors
   * @private
   * @param {Error} error - Error to handle
   */
  handleError(error) {
    logError('Error occurred', error);

    // Call onError callback if provided
    if (this.options?.onError) {
      try {
        this.options.onError(error);
      } catch (callbackError) {
        logError('Error in onError callback', callbackError);
      }
    }
  }

  /**
   * Update file name with current date
   */
  updateFileName() {
    const date = dayjs().format('YYYYMMDD');
    const fileName = `app-${date}.log`;
    this.log.transports.file.fileName = fileName;
    this.currentDate = date;
    logInfo(`Log file: ${fileName}`);
  }

  /**
   * Schedule midnight check for log rotation
   */
  scheduleMidnightCheck() {
    const scheduleNext = () => {
      // Get current time
      const now = dayjs();

      // Calculate next midnight
      const midnight = now.startOf('day').add(1, 'day');

      // Calculate delay in milliseconds
      const delay = midnight.diff(now);

      // Log next rotation time
      logInfo(`Next rotation at midnight (${midnight.format('YYYY-MM-DD HH:mm:ss')})`);

      // Schedule the midnight task
      this.schedulerId = setTimeout(() => {
        logInfo('Midnight reached - rotating log file');
        this.updateFileName();
        this.cleanup();
        scheduleNext(); // Schedule next midnight check
      }, delay);
    };

    // Start the scheduling
    scheduleNext();
  }

  /**
   * Register quit handler for cleanup on app exit
   */
  registerQuitHandler() {
    try {
      // Try to get electron app instance
      // eslint-disable-next-line global-require, import/no-extraneous-dependencies
      const { app } = require('electron');

      // Register quit handler
      app.on('quit', () => {
        logInfo('App quitting - running final cleanup');
        this.cleanup();
        if (this.schedulerId) {
          clearTimeout(this.schedulerId);
        }
      });

      logInfo('Quit handler registered');
    } catch (error) {
      // Electron might not be available in all environments (e.g., testing)
      logWarning('Could not register quit handler - electron not available');
    }
  }

  /**
   * Clean up old log files
   * @returns {Object} Cleanup result
   */
  cleanup() {
    try {
      // Get all files in log directory
      const files = fs.readdirSync(this.logDir);
      const now = dayjs();
      let deletedCount = 0;
      const deletedFiles = [];

      // Get current log file name to avoid deleting it
      const currentLogPath = this.log.transports.file.getFile().path;
      const currentLogName = path.basename(currentLogPath);

      // Process each file
      for (const file of files) {
        const filePath = path.join(this.logDir, file);

        // Skip current log file
        if (file === currentLogName) {
          continue;
        }

        // Handle .old.log files (rotated by electron-log)
        if (file.endsWith('.old.log')) {
          try {
            const stats = fs.statSync(filePath);
            const age = now.diff(dayjs(stats.mtime), 'day');

            if (age > this.maxAge) {
              fs.unlinkSync(filePath);
              deletedCount += 1;
              deletedFiles.push(file);
              logInfo(`Deleted old log: ${file} (${age} days old)`);
            }
          } catch (error) {
            logError(`Failed to process ${file}`, error);
          }
          continue;
        }

        // Handle app-YYYYMMDD.log pattern
        const dateMatch = file.match(/app-(\d{8})\.log/);
        if (dateMatch) {
          try {
            const fileDate = dayjs(dateMatch[1], 'YYYYMMDD');
            const age = now.diff(fileDate, 'day');

            if (age > this.maxAge) {
              fs.unlinkSync(filePath);
              deletedCount += 1;
              deletedFiles.push(file);
              logInfo(`Deleted old log: ${file} (${age} days old)`);
            }
          } catch (error) {
            logError(`Failed to process ${file}`, error);
          }
        }
      }

      // Log completion
      if (deletedCount > 0) {
        logInfo(`Cleanup complete. Deleted ${deletedCount} old log file(s).`);
      } else {
        logInfo('Cleanup complete. No old files to delete.');
      }

      return { deletedCount, deletedFiles };
    } catch (error) {
      this.handleError(error);
      return { deletedCount: 0, deletedFiles: [], error: error.message };
    }
  }

  /**
   * Get statistics about log files
   * @returns {Object} Statistics object
   */
  getStats() {
    try {
      // Get all files in log directory
      const files = fs.readdirSync(this.logDir);
      let totalSize = 0;
      let oldestFile = null;
      let oldestDate = null;
      let newestFile = null;
      let newestDate = null;

      // Process each file
      for (const file of files) {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);

        // Add to total size
        totalSize += stats.size;

        // Update oldest file
        if (!oldestDate || stats.mtime < oldestDate) {
          oldestDate = stats.mtime;
          oldestFile = file;
        }

        // Update newest file
        if (!newestDate || stats.mtime > newestDate) {
          newestDate = stats.mtime;
          newestFile = file;
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        oldestFile,
        oldestDate: oldestDate ? dayjs(oldestDate).format('YYYY-MM-DD HH:mm:ss') : null,
        newestFile,
        newestDate: newestDate ? dayjs(newestDate).format('YYYY-MM-DD HH:mm:ss') : null,
        logDir: this.logDir,
        currentDate: this.currentDate,
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = ElectronLogCleaner;
