FROM python:3.12.8

# Installer cron
RUN apt-get update && apt-get install -y cron

# Dossier de travail
WORKDIR /app

# Copier les fichiers
COPY requirements.txt .
COPY script.py .
COPY cronjob .
COPY processed_emails.txt .

# Installer les dépendances Python
RUN pip install -r requirements.txt

# Installer la tâche cron
RUN chmod 0644 /app/cronjob && crontab /app/cronjob

# Lancer cron au démarrage
CMD cron && tail -f /var/log/cron.log
