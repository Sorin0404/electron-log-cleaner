/**
 * Manual Cleanup Example
 *
 * This example demonstrates how to manually trigger cleanup
 * and work with log file statistics.
 */

const cleaner = require('electron-log-cleaner');

// Setup cleaner
cleaner.setup({
  maxAge: 30,
});

console.log('Log cleaner initialized\n');

// Function to display statistics in a formatted way
function displayStats(stats) {
  if (stats.error) {
    console.error('Error getting statistics:', stats.error);
    return;
  }

  console.log('Log Statistics:');
  console.log('===============');
  console.log(`Total Files: ${stats.totalFiles}`);
  console.log(`Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Log Directory: ${stats.logDir}`);
  console.log(`Current Date: ${stats.currentDate}`);

  if (stats.totalFiles > 0) {
    console.log(`\nOldest File: ${stats.oldestFile}`);
    console.log(`  Created: ${stats.oldestDate}`);
    console.log(`\nNewest File: ${stats.newestFile}`);
    console.log(`  Created: ${stats.newestDate}`);
  } else {
    console.log('\nNo log files found');
  }
  console.log('');
}

// Get statistics before cleanup
console.log('Before cleanup:');
const statsBefore = cleaner.getStats();
displayStats(statsBefore);

// Manually trigger cleanup
console.log('Running manual cleanup...\n');
const result = cleaner.cleanup();

if (result.error) {
  console.error('Cleanup failed:', result.error);
} else {
  console.log('Cleanup Results:');
  console.log('================');
  console.log(`Deleted Files: ${result.deletedCount}`);

  if (result.deletedCount > 0) {
    console.log('\nDeleted file list:');
    result.deletedFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
  } else {
    console.log('No old files to delete');
  }
  console.log('');
}

// Get statistics after cleanup
console.log('After cleanup:');
const statsAfter = cleaner.getStats();
displayStats(statsAfter);

// Calculate space saved
if (!statsBefore.error && !statsAfter.error) {
  const spaceSaved = statsBefore.totalSize - statsAfter.totalSize;
  const filesSaved = statsBefore.totalFiles - statsAfter.totalFiles;

  console.log('Cleanup Summary:');
  console.log('================');
  console.log(`Files removed: ${filesSaved}`);
  console.log(`Space freed: ${(spaceSaved / 1024 / 1024).toFixed(2)} MB`);
}

// Example: Schedule periodic manual cleanup
// (In addition to automatic midnight cleanup)
console.log('\nNote: Cleanup also runs automatically at midnight');
console.log('You can call cleanup() manually anytime if needed');

// Example: Cleanup on application shutdown
process.on('exit', () => {
  console.log('\nApplication shutting down...');
  const finalCleanup = cleaner.cleanup();
  console.log(`Final cleanup: ${finalCleanup.deletedCount} files removed`);
});
