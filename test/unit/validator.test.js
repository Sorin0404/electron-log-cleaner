const { validateOptions, validateFileTransport } = require('../../src/utils/validator');

describe('validator', () => {
  describe('validateOptions', () => {
    it('should throw if options is not an object', () => {
      expect(() => validateOptions(null)).toThrow('Options must be an object');
      expect(() => validateOptions('string')).toThrow('Options must be an object');
      expect(() => validateOptions(123)).toThrow('Options must be an object');
      expect(() => validateOptions([])).toThrow('Options must be an object');
    });

    it('should throw if maxAge is missing', () => {
      expect(() => validateOptions({})).toThrow('maxAge is required and must be a number');
    });

    it('should throw if maxAge is not a number', () => {
      expect(() => validateOptions({ maxAge: '30' })).toThrow('must be a number');
      expect(() => validateOptions({ maxAge: true })).toThrow('must be a number');
      expect(() => validateOptions({ maxAge: null })).toThrow('must be a number');
    });

    it('should throw if maxAge is <= 0', () => {
      expect(() => validateOptions({ maxAge: 0 })).toThrow('greater than 0');
      expect(() => validateOptions({ maxAge: -1 })).toThrow('greater than 0');
      expect(() => validateOptions({ maxAge: -100 })).toThrow('greater than 0');
    });

    it('should throw if fileTransport is not an object', () => {
      expect(() => validateOptions({
        maxAge: 30,
        fileTransport: 'string',
      })).toThrow('fileTransport must be an object');

      expect(() => validateOptions({
        maxAge: 30,
        fileTransport: 123,
      })).toThrow('fileTransport must be an object');

      expect(() => validateOptions({
        maxAge: 30,
        fileTransport: [],
      })).toThrow('fileTransport must be an object');
    });

    it('should throw if onError is not a function', () => {
      expect(() => validateOptions({
        maxAge: 30,
        onError: 'string',
      })).toThrow('onError must be a function');

      expect(() => validateOptions({
        maxAge: 30,
        onError: 123,
      })).toThrow('onError must be a function');
    });

    it('should pass with valid minimal options', () => {
      expect(() => validateOptions({ maxAge: 30 })).not.toThrow();
      expect(() => validateOptions({ maxAge: 1 })).not.toThrow();
      expect(() => validateOptions({ maxAge: 365 })).not.toThrow();
    });

    it('should pass with all valid options', () => {
      expect(() => validateOptions({
        maxAge: 30,
        electronLog: {},
        fileTransport: { maxSize: 1000 },
        onError: () => {},
      })).not.toThrow();
    });
  });

  describe('validateFileTransport', () => {
    it('should throw if maxSize is not a number', () => {
      expect(() => validateFileTransport({ maxSize: '1000' }))
        .toThrow('maxSize must be a number');
      expect(() => validateFileTransport({ maxSize: true }))
        .toThrow('maxSize must be a number');
    });

    it('should throw if format is not a string', () => {
      expect(() => validateFileTransport({ format: 123 }))
        .toThrow('format must be a string');
      expect(() => validateFileTransport({ format: true }))
        .toThrow('format must be a string');
      expect(() => validateFileTransport({ format: {} }))
        .toThrow('format must be a string');
    });

    it('should throw if level is invalid', () => {
      expect(() => validateFileTransport({ level: 'invalid' }))
        .toThrow('level must be a valid log level');
      expect(() => validateFileTransport({ level: 123 }))
        .toThrow('level must be a valid log level');
      expect(() => validateFileTransport({ level: {} }))
        .toThrow('level must be a valid log level');
    });

    it('should pass with valid log levels', () => {
      expect(() => validateFileTransport({ level: 'error' })).not.toThrow();
      expect(() => validateFileTransport({ level: 'warn' })).not.toThrow();
      expect(() => validateFileTransport({ level: 'info' })).not.toThrow();
      expect(() => validateFileTransport({ level: 'verbose' })).not.toThrow();
      expect(() => validateFileTransport({ level: 'debug' })).not.toThrow();
      expect(() => validateFileTransport({ level: 'silly' })).not.toThrow();
      expect(() => validateFileTransport({ level: false })).not.toThrow();
    });

    it('should pass with valid maxSize', () => {
      expect(() => validateFileTransport({ maxSize: 1000 })).not.toThrow();
      expect(() => validateFileTransport({ maxSize: 1024 * 1024 })).not.toThrow();
    });

    it('should pass with valid format', () => {
      expect(() => validateFileTransport({ format: '[{text}]' })).not.toThrow();
      expect(() => validateFileTransport({ format: '{y}-{m}-{d}' })).not.toThrow();
    });

    it('should pass with all valid options', () => {
      expect(() => validateFileTransport({
        maxSize: 1000,
        format: '[{text}]',
        level: 'info',
      })).not.toThrow();
    });

    it('should pass with empty object', () => {
      expect(() => validateFileTransport({})).not.toThrow();
    });
  });
});
