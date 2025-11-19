const axios = require('axios');
const FormData = require('form-data');
const config = require('./config');

class ApiClient {
  constructor() {
    this.apiUrl = config.api.url;
    this.apiKey = config.api.key;
  }

  async sendAttachment(attachment, emailMetadata) {
    try {
      const formData = new FormData();
      
      // Add the file to form data
      formData.append('file', attachment.content, {
        filename: attachment.filename,
        contentType: attachment.contentType
      });

      // Add metadata about the email
      formData.append('emailFrom', emailMetadata.from || '');
      formData.append('emailSubject', emailMetadata.subject || '');
      formData.append('emailDate', emailMetadata.date || '');
      formData.append('attachmentFilename', attachment.filename);
      formData.append('attachmentSize', attachment.size);
      formData.append('attachmentType', attachment.contentType);

      // Prepare headers
      const headers = {
        ...formData.getHeaders()
      };

      // Add API key if configured
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      // Send to API
      const response = await axios.post(this.apiUrl, formData, {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log(`✓ Successfully sent attachment "${attachment.filename}" to API`);
      return response.data;
    } catch (error) {
      console.error(`✗ Error sending attachment "${attachment.filename}":`, error.message);
      if (error.response) {
        console.error('API response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async sendMultipleAttachments(attachments, emailMetadata) {
    const results = [];
    
    for (const attachment of attachments) {
      try {
        const result = await this.sendAttachment(attachment, emailMetadata);
        results.push({ success: true, filename: attachment.filename, result });
      } catch (error) {
        results.push({ success: false, filename: attachment.filename, error: error.message });
      }
    }

    return results;
  }
}

module.exports = ApiClient;
