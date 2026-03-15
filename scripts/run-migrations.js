#!/usr/bin/env node

const { runMigrations } = require('../src/electron/migrations.js');

console.log('Starting migration process...');

runMigrations()
  .then(() => {
    console.log('Migration process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });
