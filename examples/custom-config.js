/**
 * Custom Configuration Example
 *
 * This example shows how to use electron-log-cleaner with custom
 * file transport settings and configurations.
 */

const log = require('electron-log/main');
const cleaner = require('electron-log-cleaner');

// Configure with custom settings
cleaner.setup({
  // Keep logs for 7 days (useful for development)
  maxAge: 7,

  // Provide electron-log instance explicitly
  electronLog: log,

  // Custom file transport configuration
  fileTransport: {
    // Limit file size to 5 MB
    maxSize: 5 * 1024 * 1024,

    // Custom log format with timestamp
    format: '[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}',

    // Only log info level and above
    level: 'info',
  },

  // Error callback for monitoring
  onError: (error) => {
    console.error('Log cleaner encountered an error:', error);

    // You can send errors to a monitoring service here
    // Example: Sentry.captureException(error);
  },
});

// Test logging with different levels
log.error('This is an error message');
log.warn('This is a warning message');
log.info('This is an info message');
log.verbose('This verbose message will NOT be logged (level: info)');
log.debug('This debug message will NOT be logged (level: info)');

console.log('\nLog cleaner configured with:');
console.log('- Retention period: 7 days');
console.log('- Max file size: 5 MB');
console.log('- Log level: info and above');
console.log('- Custom format with timestamps');

// Get statistics
const stats = cleaner.getStats();
console.log('\nCurrent statistics:');
console.log(`- Total files: ${stats.totalFiles}`);
console.log(`- Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`- Log directory: ${stats.logDir}`);

// Example: Different configurations for different environments
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

if (isDevelopment) {
  console.log('\nDevelopment mode: Using 7-day retention with debug logging');
  // In development, you might want shorter retention and more verbose logs
} else if (isProduction) {
  console.log('\nProduction mode: Consider using 30-day retention with info logging');
  // In production, you might want longer retention and less verbose logs
}
