#!/usr/bin/env node

// Test runner script to execute Vitest tests
const { spawn } = require('child_process');
const path = require('path');

// Run vitest with the config
const vitest = spawn('npx', ['vitest', 'run', '--reporter=verbose', '--coverage'], {
  cwd: path.resolve(__dirname, '../..'),
  stdio: 'inherit',
  shell: true
});

vitest.on('close', (code) => {
  console.log(`\nTests completed with exit code: ${code}`);
  process.exit(code);
});

vitest.on('error', (error) => {
  console.error('Error running tests:', error);
  process.exit(1);
});