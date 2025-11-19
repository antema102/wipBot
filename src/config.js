require('dotenv').config();

module.exports = {
  imap: {
    user: process.env.IMAP_USER || 'recrutement@wipwork.com',
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST || 'imap.ionos.fr',
    port: parseInt(process.env.IMAP_PORT) || 993,
    tls: process.env.IMAP_TLS === 'true' || true,
    tlsOptions: { 
      rejectUnauthorized: false 
    }
  },
  email: {
    mailbox: process.env.MAILBOX || 'INBOX',
    checkInterval: parseInt(process.env.CHECK_INTERVAL) || 60000,
    markAsRead: process.env.MARK_AS_READ === 'true' || true,
    deleteAfterProcessing: process.env.DELETE_AFTER_PROCESSING === 'true' || false
  },
  api: {
    url: process.env.API_URL,
    key: process.env.API_KEY
  }
};
