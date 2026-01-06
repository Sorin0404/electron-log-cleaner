/**
 * Basic Usage Example
 *
 * This example shows the simplest way to use electron-log-cleaner.
 * It will automatically detect electron-log and set up log rotation.
 */

const cleaner = require('electron-log-cleaner');

// Minimal setup - just specify how long to keep logs
cleaner.setup({
  maxAge: 30, // Keep logs for 30 days
});

console.log('Log cleaner initialized with 30-day retention');
console.log('Logs will automatically rotate at midnight');
console.log('Old logs will be cleaned up automatically');

// Get current statistics
const stats = cleaner.getStats();
console.log('\nCurrent log statistics:');
console.log(`- Total files: ${stats.totalFiles}`);
console.log(`- Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`- Log directory: ${stats.logDir}`);
if (stats.oldestFile) {
  console.log(`- Oldest file: ${stats.oldestFile} (${stats.oldestDate})`);
}
if (stats.newestFile) {
  console.log(`- Newest file: ${stats.newestFile} (${stats.newestDate})`);
}
