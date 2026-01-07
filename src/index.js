const ElectronLogCleaner = require('./ElectronLogCleaner');

/**
 * Singleton instance of ElectronLogCleaner
 * This ensures only one cleaner instance is used throughout the application
 */
const instance = new ElectronLogCleaner();

/**
 * Export the singleton instance as default
 * @module electron-log-cleaner
 */
module.exports = instance;

/**
 * Export electron-log for direct access via getter
 * Users can use cleaner.log instead of importing electron-log separately
 * This getter ensures we always return the current log instance after setup()
 */
Object.defineProperty(module.exports, 'log', {
  get() {
    // Try to get from instance first (after setup)
    if (instance.log) {
      return instance.log;
    }
    // Fall back to require if not set up yet
    try {
      // eslint-disable-next-line global-require
      return require('electron-log/main');
    } catch (error) {
      return null;
    }
  },
  enumerable: true,
});

/**
 * Export the class for testing purposes
 * Allows creating multiple instances in tests
 */
module.exports.ElectronLogCleaner = ElectronLogCleaner;
