# Contributing to electron-log-cleaner

Thank you for your interest in contributing to electron-log-cleaner! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the existing issues to avoid duplicates. When creating a bug report, include:

- A clear and descriptive title
- Detailed steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (OS, Node.js version, package versions)
- Code samples and error messages
- Screenshots if applicable

Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Features

Feature suggestions are welcome! Please:

- Check existing feature requests first
- Provide a clear use case
- Explain why this feature would be useful
- Include code examples of how it would work

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Pull Requests

1. **Fork the repository** and create your branch from `main`

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Run tests and checks**

   ```bash
   # Run all tests
   npm test

   # Run with coverage
   npm run test:coverage

   # Run linter
   npm run lint

   # Format code
   npm run format
   ```

5. **Commit your changes**
   - Use conventional commit messages:
     - `feat: add new feature`
     - `fix: resolve bug`
     - `docs: update documentation`
     - `test: add tests`
     - `refactor: code refactoring`
     - `chore: maintenance tasks`

6. **Push to your fork** and submit a pull request

7. **Wait for review**
   - Address any feedback
   - Keep your PR up to date with main branch

## Development Setup

### Prerequisites

- Node.js >= 14
- npm >= 6

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/electron-log-cleaner.git
cd electron-log-cleaner

# Install dependencies
npm install

# Run tests
npm test
```

### Project Structure

```
electron-log-cleaner/
├── src/
│   ├── ElectronLogCleaner.js  # Main class
│   ├── index.js                # Entry point
│   ├── index.d.ts              # TypeScript definitions
│   └── utils/
│       ├── logger.js           # Logging utilities
│       └── validator.js        # Validation functions
├── test/
│   └── unit/                   # Unit tests
├── examples/                   # Usage examples
└── .github/                    # GitHub configuration
```

## Coding Standards

### JavaScript Style

- Use ESLint configuration (Airbnase style guide)
- Use Prettier for formatting
- Prefer `const` over `let`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Example

```javascript
/**
 * Clean up old log files
 * @returns {CleanupResult} Result with deleted file information
 */
cleanup() {
  // Implementation
}
```

### Testing

- Write tests for all new features
- Maintain 90%+ code coverage
- Use descriptive test names
- Group related tests in `describe` blocks

```javascript
describe('cleanup', () => {
  it('should delete files older than maxAge', () => {
    // Test implementation
  });
});
```

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- test/unit/ElectronLogCleaner.test.js

# Run with coverage
npm run test:coverage
```

### Writing Tests

- Test happy paths and edge cases
- Mock external dependencies (electron-log, file system)
- Clean up test artifacts in `afterEach`
- Use Jest's fake timers for time-based tests

### Coverage Requirements

All pull requests must maintain:

- **90%+** statement coverage
- **90%+** branch coverage
- **90%+** function coverage
- **90%+** line coverage

## Documentation

When adding features or making changes:

1. Update README.md if public API changes
2. Update TypeScript definitions in index.d.ts
3. Add examples in `examples/` directory
4. Update CHANGELOG.md with your changes

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

**Examples:**

```
feat: add getStats() method to retrieve log statistics

Implement getStats() method that returns information about log files
including total count, size, oldest and newest file dates.

Closes #42
```

```
fix: prevent cleanup from deleting current log file

Add check to preserve the current active log file during cleanup.

Fixes #56
```

## Release Process

Releases are managed by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. GitHub Actions will automatically publish to npm

## Questions?

Feel free to:

- Open an issue for questions
- Join discussions in existing issues
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions help make electron-log-cleaner better for everyone. We appreciate your time and effort!
