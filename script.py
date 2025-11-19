# ------------------------------------------------------
# Documentation connexion IONOS (référence officielle)
#
# IMAP (réception)
#   Serveur : imap.ionos.fr
#   Port    : 993
#   SSL/TLS : Oui
#
# SMTP (envoi)
#   Serveur : smtp.ionos.fr
#   Port    : 465
#   SSL/TLS : Oui
#
# POP3 (optionnel)
#   Serveur : pop.ionos.fr
#   Port    : 995
#   SSL/TLS : Oui
# ------------------------------------------------------

from imapclient import IMAPClient
import os
import requests
import email
from email import policy

# ----- CONFIG -----
IMAP_HOST = "imap.ionos.fr"
EMAIL = "recrutement@wipwork.com"
PASSWORD = r"Vvlp0rkmAD/\2O25"

API_URL = "https://www.wipwork.fr/bot/parse/resume?use_test=true"
PROCESSED_FILE = "processed_emails.txt"

ALLOWED_EXTENSIONS = [".pdf", ".docx"] 

# --------------------


def load_processed_ids():
    if not os.path.exists(PROCESSED_FILE):
        return set()
    with open(PROCESSED_FILE, "r") as f:
        return set(line.strip() for line in f.readlines())


def save_processed_id(email_id):
    with open(PROCESSED_FILE, "a") as f:
        f.write(str(email_id) + "\n")


def upload_to_api(filepath, headers=None):
    default_headers = {
        "X-API-Key": "bf80J843-1e70-1435-a8c1-14e1be58ddbe",
        "Accept": "application/json",
        "User-Agent": "wipBot/1.0"
    }
    if headers:
        default_headers.update(headers)

    with open(filepath, "rb") as file:
        files = {
            "file": (os.path.basename(filepath), file, "application/octet-stream")
        }
        data = {
            "user_id": "",
            "country_ids": ["MDG"],
            "enterprise_ids": ["WipWork"],
        }

        response = requests.post(API_URL, files=files, data=data, headers=default_headers)
        return response


def main():
    processed_ids = load_processed_ids()

    with IMAPClient(IMAP_HOST, ssl=True) as server:
        server.login(EMAIL, PASSWORD)
        server.select_folder("INBOX")

        messages = server.search(["ALL"])

        for msg_id in messages:
            if str(msg_id) in processed_ids:
                continue  # Déjà traité

            print(f"\n📩 Nouveau mail : ID {msg_id}")

            # Récupération brute du mail
            raw_message = server.fetch(msg_id, ["RFC822"])[msg_id][b"RFC822"]

            if raw_message is None:
                print("   ❌ Erreur : message vide, ignoré.")
                save_processed_id(msg_id)
                continue

            try:
                msg = email.message_from_bytes(raw_message, policy=policy.default)
            except Exception as e:
                print(f"   ❌ Erreur lors du parsing du mail (email module) : {e}")
                save_processed_id(msg_id)
                continue

            attachments = []
            for part in msg.iter_attachments():
                filename = part.get_filename()
                if filename:
                    filename = filename.lower()
                    if any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
                        attachments.append((filename, part.get_payload(decode=True)))
                    else:
                        print(f"   ❌ Fichier ignoré (format non autorisé) : {filename}")

            if not attachments:
                print("   → Aucun fichier joint PDF/DOCX, ignoré.")
                save_processed_id(msg_id)
                continue

            for filename, content in attachments:
                temp_path = f"temp_{filename}"
                with open(temp_path, "wb") as f:
                    f.write(content)

                print(f"   ✔ Pièce jointe (CV) : {filename}")

                # Upload vers ton API
                print("   ⬆ Upload vers API...")
                response = upload_to_api(temp_path)

                if response.status_code == 200:
                    print("   ✔ Upload OK – API a répondu :")
                    print("     →", response.json())
                else:
                    print("   ❌ Erreur API :", response.text)

                # Suppression fichier temporaire
                os.remove(temp_path)

            # Marquer email traité
            save_processed_id(msg_id)
            print("   ✔ Email marqué comme traité")

    print("\n🎉 Terminé !")


if __name__ == "__main__":
    main()
