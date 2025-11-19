const Imap = require('imap');
const { simpleParser } = require('mailparser');
const config = require('./config');

class EmailFetcher {
  constructor() {
    this.imap = null;
    this.isConnected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.imap = new Imap(config.imap);

      this.imap.once('ready', () => {
        console.log('✓ Connected to IMAP server');
        this.isConnected = true;
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('✗ IMAP connection error:', err);
        this.isConnected = false;
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('Connection ended');
        this.isConnected = false;
      });

      this.imap.connect();
    });
  }

  openMailbox(mailboxName) {
    return new Promise((resolve, reject) => {
      this.imap.openBox(mailboxName, false, (err, box) => {
        if (err) {
          reject(err);
        } else {
          resolve(box);
        }
      });
    });
  }

  searchUnreadEmails() {
    return new Promise((resolve, reject) => {
      this.imap.search(['UNSEEN'], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  fetchEmail(uid) {
    return new Promise((resolve, reject) => {
      const fetch = this.imap.fetch(uid, { bodies: '', markSeen: config.email.markAsRead });
      const emails = [];

      fetch.on('message', (msg) => {
        let buffer = '';

        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
        });

        msg.once('end', () => {
          simpleParser(buffer)
            .then((parsed) => {
              emails.push(parsed);
            })
            .catch(reject);
        });
      });

      fetch.once('error', reject);

      fetch.once('end', () => {
        resolve(emails);
      });
    });
  }

  async fetchUnreadEmailsWithAttachments() {
    try {
      await this.openMailbox(config.email.mailbox);
      const uids = await this.searchUnreadEmails();

      if (uids.length === 0) {
        console.log('No unread emails found');
        return [];
      }

      console.log(`Found ${uids.length} unread email(s)`);
      const emails = await this.fetchEmail(uids);

      // Filter emails that have attachments
      const emailsWithAttachments = emails.filter(email => 
        email.attachments && email.attachments.length > 0
      );

      console.log(`${emailsWithAttachments.length} email(s) with attachments`);
      return emailsWithAttachments;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  markAsRead(uid) {
    return new Promise((resolve, reject) => {
      this.imap.addFlags(uid, ['\\Seen'], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  deleteEmail(uid) {
    return new Promise((resolve, reject) => {
      this.imap.addFlags(uid, ['\\Deleted'], (err) => {
        if (err) {
          reject(err);
        } else {
          this.imap.expunge((expungeErr) => {
            if (expungeErr) {
              reject(expungeErr);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  disconnect() {
    if (this.imap && this.isConnected) {
      this.imap.end();
    }
  }
}

module.exports = EmailFetcher;
