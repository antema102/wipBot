#!/usr/bin/env node

/**
 * Health Check Script
 * Tests IMAP and API connectivity
 * 
 * Usage: node health-check.js
 */

require('dotenv').config();
const HealthCheck = require('./src/healthCheck');

HealthCheck.checkAll()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
