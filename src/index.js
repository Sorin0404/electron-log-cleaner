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
 * Export the class for testing purposes
 * Allows creating multiple instances in tests
 */
module.exports.ElectronLogCleaner = ElectronLogCleaner;
