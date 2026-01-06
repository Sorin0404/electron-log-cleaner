const fs = require('node:fs');
const path = require('node:path');
const dayjs = require('dayjs');
const { ElectronLogCleaner } = require('../../src/index');

describe('ElectronLogCleaner', () => {
  let cleaner;
  let mockLog;
  let testDir;

  beforeEach(() => {
    // Create test directory
    testDir = path.join(__dirname, '../fixtures/test-logs');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Mock electron-log
    mockLog = {
      transports: {
        file: {
          fileName: 'test.log',
          getFile: jest.fn(() => ({ path: path.join(testDir, 'current.log') })),
          maxSize: 1048576,
          format: '[{text}]',
          level: 'silly',
        },
      },
    };

    // Create a new cleaner instance for each test
    cleaner = new ElectronLogCleaner();
  });

  afterEach(() => {
    // Clean up scheduler
    if (cleaner.schedulerId) {
      clearTimeout(cleaner.schedulerId);
    }

    // Clean up test directory
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testDir, file));
      }
      fs.rmdirSync(testDir);
    }
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(cleaner.maxAge).toBe(30);
      expect(cleaner.log).toBeNull();
      expect(cleaner.logDir).toBeNull();
      expect(cleaner.schedulerId).toBeNull();
      expect(cleaner.options).toBeNull();
      expect(cleaner.currentDate).toMatch(/^\d{8}$/);
    });
  });

  describe('setup', () => {
    it('should throw on invalid options', () => {
      expect(() => cleaner.setup()).toThrow();
      expect(() => cleaner.setup({})).toThrow('maxAge is required');
      expect(() => cleaner.setup({ maxAge: -1 })).toThrow('greater than 0');
    });

    it('should setup with minimal options', () => {
      expect(() => cleaner.setup({
        maxAge: 30,
        electronLog: mockLog,
      })).not.toThrow();

      expect(cleaner.maxAge).toBe(30);
      expect(cleaner.log).toBe(mockLog);
      expect(cleaner.logDir).toBe(testDir);
    });

    it('should apply fileTransport options', () => {
      cleaner.setup({
        maxAge: 30,
        electronLog: mockLog,
        fileTransport: {
          maxSize: 5242880,
          format: '{text}',
          level: 'info',
        },
      });

      expect(mockLog.transports.file.maxSize).toBe(5242880);
      expect(mockLog.transports.file.format).toBe('{text}');
      expect(mockLog.transports.file.level).toBe('info');
    });

    it('should update fileName on setup', () => {
      cleaner.setup({ maxAge: 30, electronLog: mockLog });
      expect(mockLog.transports.file.fileName).toMatch(/app-\d{8}\.log/);
    });

    it('should call onError callback on error', () => {
      const onError = jest.fn();

      // Create invalid mock that will cause error
      const invalidMock = {
        transports: {
          file: {
            getFile: () => {
              throw new Error('Test error');
            },
          },
        },
      };

      expect(() => cleaner.setup({
        maxAge: 30,
        electronLog: invalidMock,
        onError,
      })).toThrow();

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('updateFileName', () => {
    beforeEach(() => {
      cleaner.setup({ maxAge: 30, electronLog: mockLog });
    });

    it('should update fileName with current date', () => {
      cleaner.updateFileName();
      const expectedDate = dayjs().format('YYYYMMDD');
      expect(mockLog.transports.file.fileName).toBe(`app-${expectedDate}.log`);
      expect(cleaner.currentDate).toBe(expectedDate);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      // Create current log file
      fs.writeFileSync(path.join(testDir, 'current.log'), 'current log');

      cleaner.setup({ maxAge: 30, electronLog: mockLog });
    });

    it('should delete files older than maxAge', () => {
      // Create old file (35 days ago)
      const oldDate = dayjs().subtract(35, 'day').format('YYYYMMDD');
      const oldFile = path.join(testDir, `app-${oldDate}.log`);
      fs.writeFileSync(oldFile, 'old log');

      // Create recent file (today)
      const recentDate = dayjs().format('YYYYMMDD');
      const recentFile = path.join(testDir, `app-${recentDate}.log`);
      fs.writeFileSync(recentFile, 'recent log');

      const result = cleaner.cleanup();

      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toContain(`app-${oldDate}.log`);
      expect(fs.existsSync(oldFile)).toBe(false);
      expect(fs.existsSync(recentFile)).toBe(true);
    });

    it('should preserve current log file', () => {
      const currentFile = path.join(testDir, 'current.log');
      cleaner.cleanup();
      expect(fs.existsSync(currentFile)).toBe(true);
    });

    it('should handle .old.log files', () => {
      const oldLogFile = path.join(testDir, 'test.old.log');
      fs.writeFileSync(oldLogFile, 'old log');

      // Change file modification time to 35 days ago
      const oldTime = dayjs().subtract(35, 'day').toDate();
      fs.utimesSync(oldLogFile, oldTime, oldTime);

      const result = cleaner.cleanup();

      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toContain('test.old.log');
      expect(fs.existsSync(oldLogFile)).toBe(false);
    });

    it('should return empty result when no old files', () => {
      const result = cleaner.cleanup();
      expect(result.deletedCount).toBe(0);
      expect(result.deletedFiles).toEqual([]);
    });

    it('should handle errors gracefully', () => {
      // Remove test directory to cause error
      fs.rmSync(testDir, { recursive: true, force: true });

      const result = cleaner.cleanup();
      expect(result.error).toBeDefined();
      expect(result.deletedCount).toBe(0);
    });
  });

  describe('getStats', () => {
    beforeEach(() => {
      cleaner.setup({ maxAge: 30, electronLog: mockLog });
    });

    it('should return correct statistics', () => {
      // Create test files
      const file1 = path.join(testDir, 'file1.log');
      const file2 = path.join(testDir, 'file2.log');
      fs.writeFileSync(file1, 'test1');
      fs.writeFileSync(file2, 'test22');

      const stats = cleaner.getStats();

      expect(stats.totalFiles).toBe(2); // file1 + file2
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.logDir).toBe(testDir);
      expect(stats.currentDate).toMatch(/^\d{8}$/);
      expect(stats.oldestFile).toBeDefined();
      expect(stats.newestFile).toBeDefined();
    });

    it('should handle empty directory', () => {
      // Remove all files
      const files = fs.readdirSync(testDir);
      for (const file of files) {
        fs.unlinkSync(path.join(testDir, file));
      }

      const stats = cleaner.getStats();
      expect(stats.totalFiles).toBe(0);
      expect(stats.totalSize).toBe(0);
    });

    it('should handle errors gracefully', () => {
      cleaner.logDir = '/nonexistent/directory';
      const stats = cleaner.getStats();
      expect(stats.error).toBeDefined();
    });
  });

  describe('getElectronLog', () => {
    it('should throw error when electron-log is not found', () => {
      // Create a new cleaner without mocked electron-log
      const newCleaner = new ElectronLogCleaner();

      expect(() => newCleaner.setup({ maxAge: 30 })).toThrow('electron-log not found');
    });
  });

  describe('scheduleMidnightCheck', () => {
    it('should schedule midnight rotation', () => {
      jest.useFakeTimers();
      const newCleaner = new ElectronLogCleaner();
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      newCleaner.setup({ maxAge: 30, electronLog: mockLog });

      // Check setTimeout was called for scheduling
      expect(setTimeoutSpy).toHaveBeenCalled();

      setTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });

    it('should call updateFileName and cleanup at midnight', () => {
      jest.useFakeTimers();
      const newCleaner = new ElectronLogCleaner();

      newCleaner.setup({ maxAge: 30, electronLog: mockLog });

      const updateFileNameSpy = jest.spyOn(newCleaner, 'updateFileName');
      const cleanupSpy = jest.spyOn(newCleaner, 'cleanup');

      // Fast-forward time to next midnight (up to 24 hours)
      jest.advanceTimersByTime(24 * 60 * 60 * 1000);

      expect(updateFileNameSpy).toHaveBeenCalled();
      expect(cleanupSpy).toHaveBeenCalled();

      updateFileNameSpy.mockRestore();
      cleanupSpy.mockRestore();
      jest.useRealTimers();
    });
  });

  describe('registerQuitHandler', () => {
    it('should log warning when electron is not available', () => {
      // Test that registerQuitHandler is called during setup
      // and it logs a warning because electron is not available in test environment
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const newCleaner = new ElectronLogCleaner();
      newCleaner.setup({ maxAge: 30, electronLog: mockLog });

      // Should log warning about electron not being available
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not register quit handler'),
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
