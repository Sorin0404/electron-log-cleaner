# electron-log-cleaner

[![CI](https://github.com/Sorin0404/electron-log-cleaner/workflows/CI/badge.svg)](https://github.com/Sorin0404/electron-log-cleaner/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/electron-log-cleaner.svg)](https://www.npmjs.com/package/electron-log-cleaner)
[![codecov](https://codecov.io/gh/Sorin0404/electron-log-cleaner/branch/main/graph/badge.svg)](https://codecov.io/gh/Sorin0404/electron-log-cleaner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/electron-log-cleaner.svg)](https://nodejs.org)

**Language**: English | [한국어](./docs/ko/README.md)

Automatic log file rotation and cleanup utility for electron-log. Manages log files by date, automatically rotates at midnight, and removes old logs based on configurable retention periods.

## Documentation

- [English Documentation](./README.md) (Current)
- [한국어 문서](./docs/ko/README.md)
  - [API 레퍼런스](./docs/ko/api.md)
  - [사용 예제](./docs/ko/examples.md)

## Features

- **Automatic Log Rotation**: Rotates log files daily at midnight with date-based naming (e.g., `app-20260106.log`)
- **Old Log Cleanup**: Automatically deletes log files older than specified days
- **Configurable**: Customize file transport settings (maxSize, format, level)
- **TypeScript Support**: Includes complete TypeScript type definitions
- **Statistics**: Get detailed information about log files (size, count, dates)
- **Error Handling**: Optional error callback for handling failures gracefully

## Installation

```bash
npm install electron-log-cleaner
```

## Quick Start

### Basic Usage (ESM)

```javascript
import cleaner from 'electron-log-cleaner';

// Setup with minimal configuration
cleaner.setup({
  maxAge: 30  // Keep logs for 30 days
});
```

### Basic Usage (CommonJS)

```javascript
const cleaner = require('electron-log-cleaner');

// Setup with minimal configuration
cleaner.setup({
  maxAge: 30  // Keep logs for 30 days
});
```

### With electron-log Integration

```javascript
import log from 'electron-log/main';
import cleaner from 'electron-log-cleaner';

// Setup cleaner with electron-log instance
cleaner.setup({
  maxAge: 30,
  electronLog: log
});

// Use electron-log as usual
log.info('Application started');
```

## Configuration Options

### CleanerOptions

```typescript
interface CleanerOptions {
  maxAge: number;                    // Required: Maximum age of log files in days
  electronLog?: ElectronLog;         // Optional: electron-log instance (auto-detected if not provided)
  fileTransport?: FileTransportOptions;  // Optional: File transport configuration
  onError?: (error: Error) => void;  // Optional: Error callback
}
```

### FileTransportOptions

```typescript
interface FileTransportOptions {
  maxSize?: number;     // Maximum size of a single log file in bytes
  format?: string;      // Log format string (e.g., '[{y}-{m}-{d}] {text}')
  level?: string | false;  // Minimum log level: 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly' | false
}
```

## API Reference

### setup(options)

Initialize the log cleaner with configuration options.

```javascript
cleaner.setup({
  maxAge: 30,
  electronLog: log,
  fileTransport: {
    maxSize: 10 * 1024 * 1024,  // 10 MB
    format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}',
    level: 'info'
  },
  onError: (error) => {
    console.error('Cleaner error:', error);
  }
});
```

**Throws**: Error if options are invalid or setup fails

### cleanup()

Manually trigger cleanup of old log files.

```javascript
const result = cleaner.cleanup();
console.log(`Deleted ${result.deletedCount} files`);
console.log('Deleted files:', result.deletedFiles);
```

**Returns**: `CleanupResult`
```typescript
interface CleanupResult {
  deletedCount: number;      // Number of files deleted
  deletedFiles: string[];    // Array of deleted file names
  error?: string;            // Error message if cleanup failed
}
```

### getStats()

Get statistics about log files.

```javascript
const stats = cleaner.getStats();
console.log(`Total files: ${stats.totalFiles}`);
console.log(`Total size: ${stats.totalSize} bytes`);
console.log(`Oldest file: ${stats.oldestFile} (${stats.oldestDate})`);
console.log(`Newest file: ${stats.newestFile} (${stats.newestDate})`);
```

**Returns**: `CleanupStats`
```typescript
interface CleanupStats {
  totalFiles: number;        // Total number of log files
  totalSize: number;         // Total size of all log files in bytes
  oldestFile: string | null; // Name of the oldest log file
  oldestDate: string | null; // Date of the oldest log file (YYYY-MM-DD HH:mm:ss)
  newestFile: string | null; // Name of the newest log file
  newestDate: string | null; // Date of the newest log file (YYYY-MM-DD HH:mm:ss)
  logDir: string;            // Path to the log directory
  currentDate: string;       // Current date in YYYYMMDD format
  error?: string;            // Error message if stats retrieval failed
}
```

## Examples

### Example 1: Basic Setup

```javascript
import cleaner from 'electron-log-cleaner';

cleaner.setup({
  maxAge: 30  // Keep logs for 30 days
});
```

### Example 2: With Custom File Transport

```javascript
import log from 'electron-log/main';
import cleaner from 'electron-log-cleaner';

cleaner.setup({
  maxAge: 7,  // Keep logs for 7 days
  electronLog: log,
  fileTransport: {
    maxSize: 5 * 1024 * 1024,  // 5 MB per file
    format: '[{y}-{m}-{d} {h}:{i}:{s}] {text}',
    level: 'info'
  }
});
```

### Example 3: With Error Handling

```javascript
import cleaner from 'electron-log-cleaner';

cleaner.setup({
  maxAge: 30,
  onError: (error) => {
    console.error('Log cleaner error:', error);
    // Send error to monitoring service
  }
});
```

### Example 4: Manual Cleanup and Statistics

```javascript
import cleaner from 'electron-log-cleaner';

cleaner.setup({ maxAge: 30 });

// Get statistics before cleanup
const statsBefore = cleaner.getStats();
console.log('Before cleanup:', statsBefore);

// Manually trigger cleanup
const result = cleaner.cleanup();
console.log(`Deleted ${result.deletedCount} old log files`);

// Get statistics after cleanup
const statsAfter = cleaner.getStats();
console.log('After cleanup:', statsAfter);
```

### Example 5: Electron Main Process Integration

```javascript
import { app } from 'electron';
import log from 'electron-log/main';
import cleaner from 'electron-log-cleaner';

app.whenReady().then(() => {
  // Setup log cleaner
  cleaner.setup({
    maxAge: 30,
    electronLog: log,
    fileTransport: {
      maxSize: 10 * 1024 * 1024,
      level: 'info'
    },
    onError: (error) => {
      log.error('Log cleaner error:', error);
    }
  });

  log.info('Application started');
});
```

## How It Works

1. **Setup**: When `setup()` is called, the cleaner:
   - Validates configuration options
   - Updates the electron-log file name to include current date
   - Performs initial cleanup of old log files
   - Schedules automatic rotation at midnight
   - Registers app quit handler for final cleanup

2. **Automatic Rotation**: At midnight every day:
   - Updates log file name with new date
   - Triggers cleanup to remove old files
   - Schedules next midnight check

3. **Cleanup**: During cleanup:
   - Scans log directory for dated log files (e.g., `app-YYYYMMDD.log`)
   - Checks `.old.log` files by modification time
   - Deletes files older than `maxAge` days
   - Preserves current log file
   - Returns statistics about deleted files

## Testing

Run tests with coverage:

```bash
npm test
npm run test:coverage
```

## Requirements

- Node.js >= 14
- electron-log >= 5.0.0 (peer dependency)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub repository](https://github.com/Sorin0404/electron-log-cleaner/issues).
