FROM python:3.12.8

# Install cron and clean up
RUN apt-get update && apt-get install -y cron && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY script.py .
COPY cronjob .

# Create processed_emails.txt if it doesn't exist
RUN touch processed_emails.txt

# Setup cron job
RUN chmod 0644 /app/cronjob && crontab /app/cronjob

# Create log file
RUN touch /var/log/cron.log

# Note: .env file should be mounted as a volume when running the container
# Example: docker run -v $(pwd)/.env:/app/.env wipbot

# Start cron and tail log file
CMD cron && tail -f /var/log/cron.log
