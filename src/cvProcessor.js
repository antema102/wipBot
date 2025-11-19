const EmailFetcher = require('./emailFetcher');
const ApiClient = require('./apiClient');
const config = require('./config');

class CVProcessor {
  constructor() {
    this.emailFetcher = new EmailFetcher();
    this.apiClient = new ApiClient();
  }

  async processEmails() {
    try {
      console.log('\n=== Starting CV processing ===');
      
      // Connect to IMAP server
      await this.emailFetcher.connect();

      // Fetch unread emails with attachments
      const emails = await this.emailFetcher.fetchUnreadEmailsWithAttachments();

      if (emails.length === 0) {
        console.log('No emails with attachments to process');
        return;
      }

      // Process each email
      for (const email of emails) {
        await this.processEmail(email);
      }

      console.log('=== CV processing completed ===\n');
    } catch (error) {
      console.error('Error in CV processing:', error);
      throw error;
    } finally {
      this.emailFetcher.disconnect();
    }
  }

  async processEmail(email) {
    console.log(`\nProcessing email from: ${email.from?.text || 'Unknown'}`);
    console.log(`Subject: ${email.subject || 'No subject'}`);
    console.log(`Attachments: ${email.attachments.length}`);

    const emailMetadata = {
      from: email.from?.text || '',
      subject: email.subject || '',
      date: email.date ? email.date.toISOString() : new Date().toISOString(),
      messageId: email.messageId || ''
    };

    // Filter CV attachments (common CV file types)
    const cvAttachments = email.attachments.filter(attachment => {
      const filename = attachment.filename?.toLowerCase() || '';
      return (
        filename.endsWith('.pdf') ||
        filename.endsWith('.doc') ||
        filename.endsWith('.docx') ||
        filename.endsWith('.txt') ||
        filename.endsWith('.rtf') ||
        filename.endsWith('.odt')
      );
    });

    if (cvAttachments.length === 0) {
      console.log('No CV attachments found in this email');
      return;
    }

    console.log(`Found ${cvAttachments.length} CV attachment(s)`);

    // Send attachments to API
    const results = await this.apiClient.sendMultipleAttachments(cvAttachments, emailMetadata);

    // Log results
    results.forEach(result => {
      if (result.success) {
        console.log(`✓ ${result.filename} - Processed successfully`);
      } else {
        console.log(`✗ ${result.filename} - Failed: ${result.error}`);
      }
    });
  }

  async start() {
    console.log('CV Automation Bot started');
    console.log(`Checking for new emails every ${config.email.checkInterval / 1000} seconds`);
    console.log(`Monitoring: ${config.imap.user}`);
    console.log(`API endpoint: ${config.api.url || 'Not configured'}\n`);

    // Process emails immediately
    await this.processEmails();

    // Set up interval to check periodically
    setInterval(async () => {
      try {
        await this.processEmails();
      } catch (error) {
        console.error('Error in periodic processing:', error);
      }
    }, config.email.checkInterval);
  }
}

module.exports = CVProcessor;
