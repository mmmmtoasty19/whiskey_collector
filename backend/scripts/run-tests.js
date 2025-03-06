#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * A script to run tests in a specified order with proper setup/teardown
 */

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// The order in which we want to run our tests
const testOrder = [
  'middleware.test.js',
  'auth.test.js',
  'whiskey.test.js',
  'collection.test.js',
  'rating.test.js',
  'scenarios/userFlow.test.js'
];

// Keep track of what passes and fails
let passed = 0;
let failed = 0;

// Run a test file and return a promise
function runTest(testFile) {
  console.log(`\n${colors.bright}${colors.cyan}Running: ${testFile}${colors.reset}\n`);
  
  return new Promise((resolve, reject) => {
    // Run jest with the specific test file
    const child = spawn('npx', [
      'jest',
      path.join('__tests__', testFile),
      '--forceExit',
      '--detectOpenHandles'
    ], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${colors.green}✓ PASSED: ${testFile}${colors.reset}`);
        passed++;
        resolve();
      } else {
        console.log(`\n${colors.red}✗ FAILED: ${testFile}${colors.reset}`);
        failed++;
        resolve();  // Don't reject, we want to continue running tests
      }
    });
    
    child.on('error', (err) => {
      console.error(`\n${colors.red}Error running ${testFile}: ${err}${colors.reset}`);
      failed++;
      resolve();  // Don't reject, we want to continue running tests
    });
  });
}

// Main function to run all tests in order
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.yellow}=== Starting Whiskey Collection API Tests ===${colors.reset}\n`);
  
  // Make sure we're in test environment
  process.env.NODE_ENV = 'test';
  
  // Run each test in order
  for (const testFile of testOrder) {
    await runTest(testFile);
  }
  
  // Print summary
  console.log(`\n${colors.bright}${colors.yellow}=== Test Summary ===${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`${colors.yellow}Total: ${passed + failed}${colors.reset}\n`);
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run everything
runAllTests().catch(err => {
  console.error(`${colors.red}Test runner error: ${err}${colors.reset}`);
  process.exit(1);
});