/**
 * Error Handling Example
 *
 * This example demonstrates proper error handling when using
 * electron-log-cleaner, including validation errors and runtime errors.
 */

const log = require('electron-log/main');
const cleaner = require('electron-log-cleaner');

console.log('Error Handling Examples\n');

// Example 1: Invalid options handling
console.log('1. Testing invalid options...');
try {
  cleaner.setup({
    maxAge: -1, // Invalid: must be > 0
  });
} catch (error) {
  console.error('Expected error:', error.message);
}

try {
  cleaner.setup({
    maxAge: 'invalid', // Invalid: must be a number
  });
} catch (error) {
  console.error('Expected error:', error.message);
}

try {
  cleaner.setup({}); // Invalid: maxAge is required
} catch (error) {
  console.error('Expected error:', error.message);
}
console.log('');

// Example 2: Valid setup with error callback
console.log('2. Setting up with error callback...');
let errorCount = 0;

cleaner.setup({
  maxAge: 30,
  electronLog: log,
  onError: (error) => {
    errorCount++;
    console.error(`Error #${errorCount}:`, error.message);

    // Log to file
    log.error('Log cleaner error:', error);

    // You can also:
    // - Send to error monitoring service (Sentry, Bugsnag, etc.)
    // - Display user notification
    // - Implement retry logic
    // - Fallback to alternative behavior

    // Example: Send to monitoring service
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error, {
    //     tags: {
    //       component: 'log-cleaner'
    //     }
    //   });
    // }
  },
});

console.log('Cleaner initialized with error handling\n');

// Example 3: Handling cleanup errors gracefully
console.log('3. Testing cleanup error handling...');
const result = cleaner.cleanup();

if (result.error) {
  console.error('Cleanup failed:', result.error);
  console.log('Application can continue despite cleanup failure');
} else {
  console.log(`Cleanup successful: ${result.deletedCount} files deleted`);
}
console.log('');

// Example 4: Handling stats errors gracefully
console.log('4. Testing stats error handling...');
const stats = cleaner.getStats();

if (stats.error) {
  console.error('Failed to get statistics:', stats.error);
  console.log('Using default/fallback values');
} else {
  console.log(`Statistics retrieved: ${stats.totalFiles} files`);
}
console.log('');

// Example 5: Comprehensive error handling in production
console.log('5. Production-ready error handling setup...');

function setupProductionCleaner() {
  try {
    cleaner.setup({
      maxAge: process.env.LOG_RETENTION_DAYS || 30,
      electronLog: log,
      fileTransport: {
        maxSize: 10 * 1024 * 1024,
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      },
      onError: (error) => {
        // Log the error
        log.error('Log cleaner error:', {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });

        // Send to monitoring service in production
        if (process.env.NODE_ENV === 'production') {
          // sendToMonitoring(error);
        }

        // Don't crash the application
        console.error('Log cleaner encountered an error but application continues');
      },
    });

    log.info('Log cleaner initialized successfully');
    return true;
  } catch (error) {
    // Critical setup error - log and handle gracefully
    console.error('Failed to initialize log cleaner:', error.message);
    log.error('Log cleaner initialization failed:', error);

    // Application can still run without log cleaning
    console.log('Application will continue without automatic log cleaning');
    return false;
  }
}

const cleanerInitialized = setupProductionCleaner();

if (cleanerInitialized) {
  console.log('Log cleaner is active');
} else {
  console.log('Log cleaner is disabled due to initialization failure');
}

console.log('\nError handling best practices:');
console.log('- Always validate options before setup');
console.log('- Use try-catch for setup() calls');
console.log('- Implement onError callback for runtime errors');
console.log('- Check result.error and stats.error properties');
console.log('- Never let log cleaner errors crash your application');
console.log('- Log errors but continue application execution');
