# WipBot - Automatic CV Processing Bot

WipBot is an automated email processing bot that monitors an IMAP mailbox for new emails containing CV attachments (PDF/DOCX files) and automatically uploads them to an API for processing.

## 🚀 Features

- **Automatic Email Monitoring**: Connects to IONOS IMAP server and monitors for new emails
- **CV Detection**: Automatically detects and extracts PDF and DOCX attachments
- **API Integration**: Uploads CVs to the WipWork API for processing
- **Duplicate Prevention**: Tracks processed emails to avoid reprocessing
- **Docker Support**: Runs in a containerized environment with cron scheduling
- **Secure Configuration**: Uses environment variables for sensitive data

## 📋 Prerequisites

- Python 3.12+
- Docker (for containerized deployment)
- IONOS email account or compatible IMAP server
- WipWork API access credentials

## 🔧 Installation

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/antema102/wipBot.git
cd wipBot
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Create your `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your credentials:
```bash
nano .env  # or use your preferred editor
```

### Docker Installation

1. Clone the repository (if not already done)

2. Create your `.env` file as described above

3. Build the Docker image:
```bash
docker build -t wipbot .
```

4. Run the container:
```bash
docker run -d --name wipbot -v $(pwd)/.env:/app/.env -v $(pwd)/processed_emails.txt:/app/processed_emails.txt wipbot
```

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
# IMAP Configuration (IONOS)
IMAP_HOST=imap.ionos.fr
IMAP_PORT=993
EMAIL=your-email@domain.com
PASSWORD=your-password-here

# API Configuration
API_URL=https://www.wipwork.fr/bot/parse/resume?use_test=true
API_KEY=your-api-key-here

# API Data Configuration
USER_ID=
COUNTRY_IDS=MDG
ENTERPRISE_IDS=WipWork

# File Processing
PROCESSED_FILE=processed_emails.txt
ALLOWED_EXTENSIONS=.pdf,.docx
```

### Configuration Details

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `IMAP_HOST` | IMAP server hostname | Yes | `imap.ionos.fr` |
| `IMAP_PORT` | IMAP server port | No | `993` |
| `EMAIL` | Email address for IMAP login | Yes | - |
| `PASSWORD` | Password for IMAP login | Yes | - |
| `API_URL` | WipWork API endpoint | Yes | - |
| `API_KEY` | API authentication key | Yes | - |
| `USER_ID` | User ID for API requests | No | `""` |
| `COUNTRY_IDS` | Comma-separated country IDs | No | `MDG` |
| `ENTERPRISE_IDS` | Comma-separated enterprise IDs | No | `WipWork` |
| `PROCESSED_FILE` | File to track processed emails | No | `processed_emails.txt` |
| `ALLOWED_EXTENSIONS` | Comma-separated file extensions | No | `.pdf,.docx` |

## 🎯 Usage

### Manual Execution

Run the script manually:
```bash
python script.py
```

### Automated Execution (Cron)

The bot is designed to run periodically using cron. When using Docker, it's configured to run every hour by default.

To modify the schedule, edit the `cronjob` file:
```
# Current: Run every hour
0 * * * * python3 /app/script.py >> /var/log/cron.log 2>&1

# Example: Run every 30 minutes
*/30 * * * * python3 /app/script.py >> /var/log/cron.log 2>&1
```

## 📊 How It Works

```
┌─────────────────────┐
│  Container Docker   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Cron (every hour)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Python Script     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Read new emails     │
│   (IONOS IMAP)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Extract PDF/DOCX   │
│    attachments      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Upload to API     │
│   (WipWork Bot)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Save email ID     │
│ (processed_emails)  │
└─────────────────────┘
```

## 🔒 Security

- **Never commit your `.env` file** - it contains sensitive credentials
- The `.gitignore` file is configured to exclude `.env` files
- All sensitive data is loaded from environment variables
- API keys and passwords are never hardcoded in the source code

## 📝 Logging

- The script outputs detailed logs to the console
- When running in Docker with cron, logs are written to `/var/log/cron.log`
- Each processed email is logged with its status

### Log Output Example

```
🚀 Starting WipBot CV Processing...
📧 Connecting to imap.ionos.fr...
✅ Successfully logged in as recrutement@wipwork.com
📬 Found 15 total message(s) in inbox
📋 Loaded 10 already processed email(s)

📩 Processing new email: ID 12345
   ✔ Found CV attachment: john_doe_cv.pdf
   ⬆ Uploading to API...
   ✔ Upload successful! API response:
     → {'status': 'success', 'id': '67890'}
   ✔ Email marked as processed

✨ Processed 5 new message(s)
🎉 WipBot completed successfully!
```

## 🛠️ Development

### Project Structure

```
wipBot/
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── Dockerfile           # Docker container configuration
├── README.md            # This file
├── cronjob              # Cron schedule configuration
├── processed_emails.txt # Tracking file for processed emails
├── requirements.txt     # Python dependencies
└── script.py           # Main bot script
```

### Adding New Features

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Troubleshooting

### Connection Issues

- Verify your IMAP credentials in the `.env` file
- Check that your email provider allows IMAP access
- Ensure SSL/TLS is enabled (port 993)

### API Upload Failures

- Verify your API key is correct
- Check the API URL is accessible
- Review API response errors in the logs

### Docker Issues

- Ensure `.env` file is properly mounted
- Check Docker logs: `docker logs wipbot`
- Verify cron is running: `docker exec wipbot ps aux | grep cron`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

Made with ❤️ for automated CV processing
