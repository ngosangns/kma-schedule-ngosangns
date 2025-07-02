# KMA Schedule - Complete Testing Guide

This document provides a comprehensive guide to testing the KMA Schedule application, including unit tests, integration tests, and end-to-end tests with real KMA data.

## Overview

Our testing strategy follows the testing pyramid approach:

```
    /\
   /  \     E2E Tests (Few, High-level)
  /____\    
 /      \   Integration Tests (Some, Mid-level)
/________\  Unit Tests (Many, Low-level)
```

## Test Types

### 1. Unit Tests
- **Location**: `src/__tests__/`
- **Purpose**: Test individual components and functions in isolation
- **Framework**: Jest + React Testing Library
- **Coverage**: Components, hooks, utilities

### 2. Integration Tests
- **Location**: `src/__tests__/integration/`
- **Purpose**: Test component interactions and data flow
- **Framework**: Jest + React Testing Library
- **Coverage**: Login flow, calendar functionality

### 3. End-to-End Tests
- **Location**: `e2e/`
- **Purpose**: Test complete user journeys with real data
- **Framework**: Playwright
- **Coverage**: Full application workflows

## Quick Start

### Prerequisites

1. **Install dependencies**:
```bash
npm install
```

2. **Configure real test data** (for E2E tests):
```bash
cp .env.example .env
# Edit .env and add your KMA credentials:
# TEST_USERNAME=your_kma_username
# TEST_PASSWORD=your_kma_password
```

3. **Start development server**:
```bash
npm run dev
```

### Running Tests

#### All Tests (Recommended)
```bash
# Run complete test suite with reports
npm run test:all

# For CI environment
npm run test:all:ci
```

#### Individual Test Types
```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# Integration tests
npm test -- --testPathPattern=integration

# E2E tests (basic)
npm run test:e2e

# E2E tests with real KMA data
npm run test:e2e:real

# E2E tests with UI (interactive)
npm run test:e2e:ui
```

## Test Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Required for E2E tests with real data
TEST_USERNAME=your_kma_username
TEST_PASSWORD=your_kma_password

# Optional: Alternative credentials
TEST_USERNAME_2=another_username
TEST_PASSWORD_2=another_password

# Optional: Expected test data
TEST_SEMESTER=20241
TEST_EXPECTED_SUBJECTS=5

# Optional: Playwright settings
PLAYWRIGHT_BASE_URL=http://localhost:3000
PLAYWRIGHT_HEADLESS=false
PLAYWRIGHT_TIMEOUT=30000
```

### Test Data Security

- **Never commit real credentials** to version control
- Use `.env` file for local testing
- Use secure environment variables in CI/CD
- Consider using test-specific KMA accounts if available

## Test Structure

### Unit Tests

```
src/__tests__/
├── components/
│   ├── ui/
│   │   ├── button.test.tsx
│   │   └── input.test.tsx
│   └── layout/
├── hooks/
│   └── use-calendar-data.test.ts
├── utils/
└── mocks/
    └── data.ts
```

### Integration Tests

```
src/__tests__/integration/
├── login-flow.test.tsx
└── calendar-flow.test.tsx
```

### E2E Tests

```
e2e/
├── helpers/
│   └── test-config.ts
├── pages/
│   ├── LoginPage.ts
│   └── CalendarPage.ts
├── homepage.spec.ts
├── login-flow-real.spec.ts
└── complete-user-journey.spec.ts
```

## Writing Tests

### Unit Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'
import { getTestConfig } from './helpers/test-config'
import { LoginPage } from './pages/LoginPage'

test('should login with real credentials', async ({ page }) => {
  const config = getTestConfig()
  const loginPage = new LoginPage(page)
  
  await loginPage.goto()
  await loginPage.loginAndWaitForSuccess(config.credentials)
  
  // Verify successful login
  expect(await loginPage.isLoginSuccessful()).toBe(true)
})
```

## Best Practices

### General
- Write tests before or alongside code (TDD/BDD)
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies
- Test both happy path and edge cases

### Unit Tests
- Test one thing at a time
- Use `data-testid` for reliable element selection
- Mock API calls and external services
- Aim for >80% code coverage

### Integration Tests
- Test component interactions
- Use real data flow where possible
- Test error states and loading states
- Verify user workflows

### E2E Tests
- Test critical user journeys
- Use real data when possible
- Test on multiple browsers/devices
- Keep tests stable and maintainable

## Debugging Tests

### Unit/Integration Tests
```bash
# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- button.test.tsx

# Run tests with verbose output
npm test -- --verbose

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
# Run with browser visible
npm run test:e2e:headed

# Interactive debugging
npm run test:e2e:debug

# Run specific test
npx playwright test login-flow-real.spec.ts --debug
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in test configuration
   - Check for infinite loops or hanging promises
   - Ensure proper cleanup in afterEach/afterAll

2. **E2E tests failing**
   - Verify .env file is configured correctly
   - Check if development server is running
   - Ensure KMA credentials are valid

3. **Flaky tests**
   - Add proper waits for async operations
   - Use `waitFor` instead of fixed timeouts
   - Mock time-dependent functionality

4. **Coverage issues**
   - Exclude test files from coverage
   - Add tests for uncovered branches
   - Use `// istanbul ignore` for unreachable code

### Getting Help

1. Check test logs in `test-reports/` directory
2. Run tests with `--verbose` flag for detailed output
3. Use browser dev tools for E2E test debugging
4. Review Playwright traces for failed E2E tests

## Maintenance

### Regular Tasks

- **Weekly**: Review test coverage reports
- **Monthly**: Update test dependencies
- **Per Release**: Run full test suite with real data
- **Quarterly**: Review and update test strategy

### Test Data Management

- Keep test credentials secure and up-to-date
- Regularly verify E2E tests with fresh data
- Update expected test data when application changes
- Monitor for changes in KMA system that might affect tests

## Metrics and Reporting

### Coverage Targets
- **Unit Tests**: >80% line coverage
- **Integration Tests**: Cover all major user flows
- **E2E Tests**: Cover critical business paths

### Performance Targets
- **Unit Tests**: <5 seconds total runtime
- **Integration Tests**: <30 seconds total runtime
- **E2E Tests**: <5 minutes total runtime

### Quality Gates
- All tests must pass before merge
- Coverage must not decrease
- No new linting errors
- E2E tests must pass with real data
