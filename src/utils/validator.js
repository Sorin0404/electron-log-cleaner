/**
 * Valid log levels for electron-log
 */
const VALID_LOG_LEVELS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly', false];

/**
 * Validate file transport options
 * @param {Object} fileTransport - File transport options
 * @throws {Error} If validation fails
 */
function validateFileTransport(fileTransport) {
  // Check maxSize if provided
  if ('maxSize' in fileTransport && fileTransport.maxSize !== undefined) {
    if (typeof fileTransport.maxSize !== 'number') {
      throw new Error('maxSize must be a number');
    }
  }

  // Check format if provided
  if ('format' in fileTransport && fileTransport.format !== undefined) {
    if (typeof fileTransport.format !== 'string') {
      throw new Error('format must be a string');
    }
  }

  // Check level if provided
  if ('level' in fileTransport && fileTransport.level !== undefined) {
    if (!VALID_LOG_LEVELS.includes(fileTransport.level)) {
      throw new Error('level must be a valid log level');
    }
  }
}

/**
 * Validate cleaner options
 * @param {Object} options - Options to validate
 * @throws {Error} If validation fails
 */
function validateOptions(options) {
  // Check if options is an object
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object');
  }

  // Check if maxAge exists and is a number
  if (!('maxAge' in options)) {
    throw new Error('maxAge is required and must be a number');
  }

  if (typeof options.maxAge !== 'number') {
    throw new Error('maxAge is required and must be a number');
  }

  // Check if maxAge is greater than 0
  if (options.maxAge <= 0) {
    throw new Error('maxAge must be greater than 0');
  }

  // Check fileTransport if provided
  if ('fileTransport' in options && options.fileTransport !== undefined) {
    if (typeof options.fileTransport !== 'object' || Array.isArray(options.fileTransport)) {
      throw new Error('fileTransport must be an object');
    }
    validateFileTransport(options.fileTransport);
  }

  // Check onError if provided
  if ('onError' in options && options.onError !== undefined) {
    if (typeof options.onError !== 'function') {
      throw new Error('onError must be a function');
    }
  }

  // electronLog validation is lenient - just check if it exists
  // The actual structure will be validated when used
}

module.exports = {
  validateOptions,
  validateFileTransport,
};
