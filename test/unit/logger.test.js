const { logInfo, logError, logWarning } = require('../../src/utils/logger');

describe('logger', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('logInfo', () => {
    it('should log info message with prefix', () => {
      logInfo('Test message');
      expect(consoleLogSpy).toHaveBeenCalledWith('[ElectronLogCleaner] Test message');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should log multiple messages', () => {
      logInfo('Message 1');
      logInfo('Message 2');
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '[ElectronLogCleaner] Message 1');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, '[ElectronLogCleaner] Message 2');
    });
  });

  describe('logError', () => {
    it('should log error message with prefix', () => {
      logError('Error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ElectronLogCleaner] Error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should log error message with error object', () => {
      const error = new Error('Test error');
      logError('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        '[ElectronLogCleaner] Error occurred',
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, error);
    });

    it('should log only message if error is not provided', () => {
      logError('Error message', undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ElectronLogCleaner] Error message');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('logWarning', () => {
    it('should log warning message with prefix', () => {
      logWarning('Warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[ElectronLogCleaner] Warning message');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it('should log multiple warnings', () => {
      logWarning('Warning 1');
      logWarning('Warning 2');
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenNthCalledWith(
        1,
        '[ElectronLogCleaner] Warning 1',
      );
      expect(consoleWarnSpy).toHaveBeenNthCalledWith(
        2,
        '[ElectronLogCleaner] Warning 2',
      );
    });
  });
});
