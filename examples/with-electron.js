/**
 * Electron Integration Example
 *
 * This example shows how to integrate electron-log-cleaner
 * with an Electron application's main process.
 */

const { app, BrowserWindow } = require('electron');
const log = require('electron-log/main');
const cleaner = require('electron-log-cleaner');

// Setup log cleaner when app is ready
app.whenReady().then(() => {
  // Configure log cleaner
  cleaner.setup({
    maxAge: 30,
    electronLog: log,
    fileTransport: {
      maxSize: 10 * 1024 * 1024, // 10 MB per file
      format: '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}',
      level: 'info',
    },
    onError: (error) => {
      log.error('Log cleaner error:', error);
    },
  });

  log.info('Application started');
  log.info('Log cleaner initialized with 30-day retention');

  // Get and log statistics
  const stats = cleaner.getStats();
  log.info(
    `Log statistics: ${stats.totalFiles} files, ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`
  );

  // Create browser window
  createWindow();
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    log.info('Main window closed');
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    log.info('All windows closed, quitting app');
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app errors
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection at:', promise, 'reason:', reason);
});
