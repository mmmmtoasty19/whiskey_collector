# Testing Documentation for Whiskey Collection API

## Table of Contents
- [Overview](#overview)
- [Test Environment Setup](#test-environment-setup)
- [Test Categories](#test-categories)
- [Running Tests](#running-tests)
- [Test File Structure](#test-file-structure)
- [Test Data](#test-data)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

## Overview

This document outlines the testing strategy for the Whiskey Collection API. The application uses Jest and Supertest for automated testing, covering unit tests, integration tests, and end-to-end scenarios.

### Testing Philosophy

Our testing approach follows these principles:
- **Isolation**: Tests should not depend on each other's execution or state
- **Completeness**: All critical paths should be tested, including success and error cases
- **Clarity**: Tests should clearly show what functionality is being verified
- **Maintainability**: Tests should be easy to update when requirements change

## Test Environment Setup

### Prerequisites

- Node.js v16+ and npm
- PostgreSQL v13+
- Test database (as specified in `.env.test`)

### Environment Configuration

Create a `.env.test` file in the project root with the following variables:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whiskey_collection_test
DB_USER=whiskey_admin
DB_PASSWORD=your_password_here
JWT_SECRET=your_test_jwt_secret
```

### Database Setup

The test environment automatically sets up the required database tables during test execution. However, you need to ensure:

1. The specified PostgreSQL user exists and has permissions to create tables
2. The database exists and is accessible
3. The database is dedicated to testing (all data will be erased)

Command to manually create the test database:

```bash
createdb -U whiskey_admin whiskey_collection_test
```

## Test Categories

### Unit Tests

- **Purpose**: Test individual components in isolation
- **Location**: `__tests__/unit/`
- **Examples**: Middleware tests, model method tests

### Integration Tests

- **Purpose**: Test API endpoints and database interactions
- **Location**: `__tests__/integration/`
- **Examples**: Route tests, controller tests

### End-to-End Tests

- **Purpose**: Test complete user flows and scenarios
- **Location**: `__tests__/scenarios/`
- **Examples**: User registration → Add whiskey → Rate whiskey flow

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in sequence
npm run test:sequence
```

### Running Specific Tests

```bash
# Run a specific test file
npx jest __tests__/auth.test.js

# Run tests matching a pattern
npx jest -t "whiskey"

# Run tests with detailed output
npx jest --verbose
```

### Test Runner Script

The project includes a custom test runner (`scripts/run-tests.js`) that:
- Runs tests in a predefined order
- Ensures proper setup/teardown
- Provides colorized output
- Reports test results in a readable format

To use the test runner:

```bash
npm run test:sequence
```

## Test File Structure

### Directory Organization

```
backend/
├── __tests__/
│   ├── setup.js             # Global test setup
│   ├── auth.test.js         # Authentication tests
│   ├── whiskey.test.js      # Whiskey endpoint tests
│   ├── collection.test.js   # Collection endpoint tests
│   ├── rating.test.js       # Rating endpoint tests
│   ├── middleware.test.js   # Middleware tests
│   ├── scenarios/
│   │   └── userFlow.test.js # End-to-end scenarios
│   └── utils/
│       └── testUtils.js     # Test helper functions
├── scripts/
│   └── run-tests.js         # Test runner script
└── jest.config.js           # Jest configuration
```

### Naming Conventions

- Test files: `[feature].test.js` or `[feature].spec.js`
- Test utilities: `[purpose]Utils.js`
- Test directories: Descriptive of the test category

## Test Data

### Test User Credentials

The test suite uses these standard test users:
- Regular user: `testuser@example.com` / `Password123`
- Admin user: `admin@example.com` / `AdminPass123`

### Test Whiskey Data

Standard test whiskey objects include:
- Bourbon: "Test Bourbon" from "Test Distillery"
- Single Malt: "Test Scotch" from "Scottish Distillery"

### Test Data Factories

The `testUtils.js` file contains functions to create test data:

- `createTestUser()`: Creates a user and returns user object with token
- `createTestWhiskey()`: Creates a whiskey with default or custom data
- `addToCollection()`: Adds a whiskey to a user's collection
- `addRating()`: Creates a rating for a whiskey

## Troubleshooting

### Common Issues

#### Database Connection Issues

```
Error: SequelizeConnectionError: connection refused
```

- Check that PostgreSQL is running
- Verify credentials in `.env.test`
- Ensure database exists

#### Authentication Test Failures

```
Error: Authentication error: Invalid token
```

- Verify `JWT_SECRET` is set correctly in `.env.test`
- Check token generation and validation in tests

#### Timeout Issues

```
Error: Timeout - Async callback was not invoked within timeout
```

- Increase Jest timeout in `jest.config.js`
- Check for unresolved promises or hanging connections

### Debugging Techniques

- Add `console.log()` statements to trace execution
- Run tests with `--detectOpenHandles` to find unresolved promises
- Use `--runInBand` to run tests sequentially
- Inspect database state manually during test failures
