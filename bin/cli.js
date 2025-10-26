#!/usr/bin/env node

// ==================== bin/cli.js ====================

const { init } = require('../lib/index');

init().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});