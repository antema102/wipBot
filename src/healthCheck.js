const Imap = require('imap');
const config = require('./config');

class HealthCheck {
  static async checkImapConnection() {
    return new Promise((resolve, reject) => {
      const imap = new Imap(config.imap);
      
      const timeout = setTimeout(() => {
        imap.end();
        reject(new Error('IMAP connection timeout'));
      }, 10000);

      imap.once('ready', () => {
        clearTimeout(timeout);
        imap.end();
        resolve({ status: 'ok', message: 'IMAP connection successful' });
      });

      imap.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      imap.connect();
    });
  }

  static async checkApiConnection() {
    if (!config.api.url) {
      return { status: 'warning', message: 'API URL not configured' };
    }

    try {
      const axios = require('axios');
      const url = new URL(config.api.url);
      const baseUrl = `${url.protocol}//${url.host}`;
      
      // Try to reach the base URL or a health endpoint
      const response = await axios.get(baseUrl, { 
        timeout: 5000,
        validateStatus: () => true // Accept any status
      });
      
      return { 
        status: 'ok', 
        message: `API reachable (HTTP ${response.status})` 
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: `API unreachable: ${error.message}` 
      };
    }
  }

  static async checkAll() {
    console.log('=================================');
    console.log('  Health Check');
    console.log('=================================\n');

    // Check IMAP
    console.log('📧 Checking IMAP connection...');
    try {
      const imapResult = await this.checkImapConnection();
      console.log(`   ✓ ${imapResult.message}`);
    } catch (error) {
      console.log(`   ✗ IMAP connection failed: ${error.message}`);
    }

    // Check API
    console.log('\n🔌 Checking API connection...');
    const apiResult = await this.checkApiConnection();
    if (apiResult.status === 'ok') {
      console.log(`   ✓ ${apiResult.message}`);
    } else if (apiResult.status === 'warning') {
      console.log(`   ⚠️  ${apiResult.message}`);
    } else {
      console.log(`   ✗ ${apiResult.message}`);
    }

    console.log('\n=================================\n');
  }
}

module.exports = HealthCheck;
