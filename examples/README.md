# Examples

This directory contains practical examples demonstrating various use cases of electron-log-cleaner.

## Running the Examples

Each example is a standalone Node.js script. To run an example:

```bash
node examples/basic-usage.js
```

**Note**: Make sure you have installed the dependencies first:

```bash
npm install
```

## Available Examples

### 1. basic-usage.js

The simplest way to use electron-log-cleaner with minimal configuration.

**What you'll learn:**
- How to set up with just `maxAge` parameter
- How to get log statistics
- Automatic log rotation and cleanup

**Run:**
```bash
node examples/basic-usage.js
```

### 2. with-electron.js

Integration with an Electron application's main process.

**What you'll learn:**
- How to integrate with Electron's app lifecycle
- Setting up in `app.whenReady()`
- Configuring file transport options
- Error handling in production apps

**Note:** This example requires Electron to be installed:
```bash
npm install electron --save-dev
```

### 3. custom-config.js

Advanced configuration with custom file transport settings.

**What you'll learn:**
- Custom log file size limits
- Custom log format strings
- Log level configuration
- Environment-specific settings
- Error callbacks

**Run:**
```bash
node examples/custom-config.js
```

### 4. manual-cleanup.js

Manual cleanup triggers and working with statistics.

**What you'll learn:**
- How to manually trigger cleanup
- Working with `CleanupResult`
- Formatting and displaying statistics
- Calculating space saved
- Cleanup on application shutdown

**Run:**
```bash
node examples/manual-cleanup.js
```

### 5. error-handling.js

Comprehensive error handling strategies.

**What you'll learn:**
- Validating options before setup
- Handling setup errors
- Runtime error callbacks
- Production-ready error handling
- Graceful degradation

**Run:**
```bash
node examples/error-handling.js
```

## Common Patterns

### Development vs Production

```javascript
const isDev = process.env.NODE_ENV === 'development';

cleaner.setup({
  maxAge: isDev ? 7 : 30,  // Shorter retention in dev
  fileTransport: {
    level: isDev ? 'debug' : 'info',  // More verbose in dev
    maxSize: isDev ? 5 * 1024 * 1024 : 10 * 1024 * 1024
  }
});
```

### With Environment Variables

```javascript
cleaner.setup({
  maxAge: parseInt(process.env.LOG_RETENTION_DAYS) || 30,
  fileTransport: {
    maxSize: parseInt(process.env.LOG_MAX_SIZE) || 10 * 1024 * 1024,
    level: process.env.LOG_LEVEL || 'info'
  }
});
```

### With Monitoring Services

```javascript
cleaner.setup({
  maxAge: 30,
  onError: (error) => {
    // Sentry
    Sentry.captureException(error);

    // Or any other monitoring service
    monitoring.logError({
      component: 'log-cleaner',
      error: error.message,
      stack: error.stack
    });
  }
});
```

## Tips

1. **Always handle errors gracefully** - Don't let log cleaning errors crash your app
2. **Use appropriate retention periods** - 7-30 days is typical for most applications
3. **Configure log levels properly** - Use 'debug' in development, 'info' in production
4. **Monitor disk usage** - Use `getStats()` to track log file sizes
5. **Test in development** - Run examples to understand behavior before production use

## Need Help?

- Check the main [README.md](../README.md) for API documentation
- Review the [TypeScript definitions](../src/index.d.ts) for type information
- Open an issue on [GitHub](https://github.com/Sorin0404/electron-log-cleaner/issues) for support
