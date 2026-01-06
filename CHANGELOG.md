# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-06

### Added

#### Core Features

- Automatic log file cleanup based on configurable age (days)
- Date-based log file rotation with YYYYMMDD format (e.g., `app-20260106.log`)
- Automatic midnight rotation scheduling
- Cleanup on application exit (quit handler)
- Support for `.old.log` files based on modification time

#### API

- `setup(options)` - Initialize cleaner with configuration
- `cleanup()` - Manually trigger log cleanup
- `getStats()` - Get statistics about log files (count, size, oldest/newest dates)

#### Configuration

- `maxAge` - Required: Maximum age of log files in days
- `electronLog` - Optional: electron-log instance (auto-detected if not provided)
- `fileTransport` - Optional: Custom file transport options (maxSize, format, level)
- `onError` - Optional: Error callback function

#### Developer Experience

- Complete TypeScript type definitions (.d.ts)
- CommonJS module support
- Singleton pattern for easy integration
- Comprehensive error handling with optional callbacks

#### Testing & Quality

- Comprehensive test suite with 42 tests
- 90%+ code coverage across all metrics
- ESLint with Airbnb style guide
- Prettier code formatting
- Modern JavaScript features (optional chaining, for...of loops)
- Node.js built-in module protocol (`node:` prefix)

#### Documentation

- Detailed README with installation and usage examples
- Complete API reference documentation
- 5 practical example files demonstrating different use cases
- Contributing guidelines (CONTRIBUTING.md)
- Issue and PR templates
- Examples README with running instructions

#### CI/CD & Automation

- GitHub Actions workflow for testing across multiple Node.js versions (14.x, 16.x, 18.x, 20.x)
- Multi-OS testing (Ubuntu, Windows, macOS)
- Automated linting and formatting checks
- Code coverage reporting with Codecov integration
- Automated npm publishing on release
- CodeQL security analysis
- Dependabot for dependency updates
- PR checks (title validation, TODO detection, security audit)

#### Requirements

- Node.js >= 16.0.0
- electron-log >= 5.0.0 (peer dependency)
- dayjs for date manipulation

### Technical Details

- Zero dependencies (except dayjs and peer dependency electron-log)
- File size optimized with .npmignore
- Proper package.json configuration for npm publishing
- MIT License
