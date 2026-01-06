/**
 * Log prefix for all messages
 */
const LOG_PREFIX = '[ElectronLogCleaner]';

/**
 * Log info message with prefix
 * @param {string} message - Message to log
 */
function logInfo(message) {
  console.log(`${LOG_PREFIX} ${message}`);
}

/**
 * Log error message with prefix
 * @param {string} message - Message to log
 * @param {Error} [error] - Optional error object
 */
function logError(message, error) {
  console.error(`${LOG_PREFIX} ${message}`);
  if (error) {
    console.error(error);
  }
}

/**
 * Log warning message with prefix
 * @param {string} message - Message to log
 */
function logWarning(message) {
  console.warn(`${LOG_PREFIX} ${message}`);
}

module.exports = {
  logInfo,
  logError,
  logWarning,
};
