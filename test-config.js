/**
 * Script de test de configuration
 * Usage: node test-config.js
 */

require('dotenv').config();
const config = require('./src/config');

console.log('=================================');
console.log('  Configuration Test');
console.log('=================================\n');

console.log('📧 IMAP Configuration:');
console.log(`   Host: ${config.imap.host}`);
console.log(`   Port: ${config.imap.port}`);
console.log(`   User: ${config.imap.user}`);
console.log(`   Password: ${config.imap.password ? '***' + config.imap.password.slice(-4) : '❌ NOT SET'}`);
console.log(`   TLS: ${config.imap.tls ? '✓' : '✗'}`);

console.log('\n📮 Email Settings:');
console.log(`   Mailbox: ${config.email.mailbox}`);
console.log(`   Check interval: ${config.email.checkInterval / 1000}s`);
console.log(`   Mark as read: ${config.email.markAsRead ? '✓' : '✗'}`);
console.log(`   Delete after processing: ${config.email.deleteAfterProcessing ? '✓' : '✗'}`);

console.log('\n🔌 API Configuration:');
console.log(`   URL: ${config.api.url || '❌ NOT SET'}`);
console.log(`   API Key: ${config.api.key ? '***' + config.api.key.slice(-4) : '❌ NOT SET'}`);

console.log('\n=================================');

// Validation
const errors = [];

if (!config.imap.password) {
  errors.push('❌ IMAP_PASSWORD is not set');
}

if (!config.api.url) {
  errors.push('⚠️  API_URL is not set (optional but recommended)');
}

if (errors.length > 0) {
  console.log('\n⚠️  Configuration Issues:\n');
  errors.forEach(error => console.log(`   ${error}`));
  console.log('\n   Please update your .env file\n');
} else {
  console.log('\n✅ Configuration looks good!\n');
}
