# ------------------------------------------------------
# WipBot - Automatic CV Processing Bot
#
# This script monitors an IMAP mailbox for new emails with
# CV attachments (PDF/DOCX) and uploads them to an API
# for processing.
#
# Documentation connexion IONOS (référence officielle)
#
# IMAP (réception)
#   Serveur : imap.ionos.fr
#   Port    : 993
#   SSL/TLS : Oui
# ------------------------------------------------------

from imapclient import IMAPClient
import os
import requests
import email
from email import policy
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ----- CONFIG -----
IMAP_HOST = os.getenv("IMAP_HOST", "imap.ionos.fr")
IMAP_PORT = int(os.getenv("IMAP_PORT", "993"))
EMAIL = os.getenv("EMAIL")
PASSWORD = os.getenv("PASSWORD")

API_URL = os.getenv("API_URL")
API_KEY = os.getenv("API_KEY")

USER_ID = os.getenv("USER_ID", "")
COUNTRY_IDS = os.getenv("COUNTRY_IDS", "MDG").split(",")
ENTERPRISE_IDS = os.getenv("ENTERPRISE_IDS", "WipWork").split(",")

PROCESSED_FILE = os.getenv("PROCESSED_FILE", "processed_emails.txt")
ALLOWED_EXTENSIONS = os.getenv("ALLOWED_EXTENSIONS", ".pdf,.docx").split(",")

# --------------------

# Validate required environment variables
if not all([EMAIL, PASSWORD, API_URL, API_KEY]):
    raise ValueError(
        "Missing required environment variables. "
        "Please check your .env file and ensure EMAIL, PASSWORD, API_URL, and API_KEY are set."
    )


def load_processed_ids():
    """
    Load the set of already processed email IDs from the tracking file.
    
    Returns:
        set: A set of email IDs that have already been processed
    """
    if not os.path.exists(PROCESSED_FILE):
        return set()
    with open(PROCESSED_FILE, "r") as f:
        return set(line.strip() for line in f.readlines())


def save_processed_id(email_id):
    """
    Save an email ID to the tracking file to mark it as processed.
    
    Args:
        email_id: The email ID to save
    """
    with open(PROCESSED_FILE, "a") as f:
        f.write(str(email_id) + "\n")


def upload_to_api(filepath, headers=None):
    """
    Upload a resume file to the API for processing.
    
    Args:
        filepath (str): Path to the file to upload
        headers (dict, optional): Additional headers to include in the request
        
    Returns:
        requests.Response: The API response object
    """
    default_headers = {
        "X-API-Key": API_KEY,
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
            "user_id": USER_ID,
            "country_ids": COUNTRY_IDS,
            "enterprise_ids": ENTERPRISE_IDS,
        }

        response = requests.post(API_URL, files=files, data=data, headers=default_headers)
        return response


def main():
    """
    Main function to process emails with CV attachments.
    
    This function:
    1. Connects to the IMAP server
    2. Searches for all emails in the inbox
    3. Processes unprocessed emails with PDF/DOCX attachments
    4. Uploads the attachments to the API
    5. Marks emails as processed to avoid duplicates
    """
    print("🚀 Starting WipBot CV Processing...")
    print(f"📧 Connecting to {IMAP_HOST}...")
    
    processed_ids = load_processed_ids()
    print(f"📋 Loaded {len(processed_ids)} already processed email(s)")

    try:
        with IMAPClient(IMAP_HOST, ssl=True, port=IMAP_PORT) as server:
            server.login(EMAIL, PASSWORD)
            print(f"✅ Successfully logged in as {EMAIL}")
            
            server.select_folder("INBOX")
            messages = server.search(["ALL"])
            print(f"📬 Found {len(messages)} total message(s) in inbox")

            new_messages_count = 0
            for msg_id in messages:
                if str(msg_id) in processed_ids:
                    continue  # Already processed

                new_messages_count += 1
                print(f"\n📩 Processing new email: ID {msg_id}")

                # Fetch raw email
                raw_message = server.fetch(msg_id, ["RFC822"])[msg_id][b"RFC822"]

                if raw_message is None:
                    print("   ❌ Error: Empty message, skipping.")
                    save_processed_id(msg_id)
                    continue

                try:
                    msg = email.message_from_bytes(raw_message, policy=policy.default)
                except Exception as e:
                    print(f"   ❌ Error parsing email: {e}")
                    save_processed_id(msg_id)
                    continue

                # Extract attachments
                attachments = []
                for part in msg.iter_attachments():
                    filename = part.get_filename()
                    if filename:
                        filename_lower = filename.lower()
                        if any(filename_lower.endswith(ext) for ext in ALLOWED_EXTENSIONS):
                            attachments.append((filename, part.get_payload(decode=True)))
                        else:
                            print(f"   ⚠️  Skipped file (unsupported format): {filename}")

                if not attachments:
                    print("   → No PDF/DOCX attachments found, skipping.")
                    save_processed_id(msg_id)
                    continue

                # Process each attachment
                for filename, content in attachments:
                    temp_path = f"temp_{filename}"
                    try:
                        with open(temp_path, "wb") as f:
                            f.write(content)

                        print(f"   ✔ Found CV attachment: {filename}")

                        # Upload to API
                        print("   ⬆ Uploading to API...")
                        response = upload_to_api(temp_path)

                        if response.status_code == 200:
                            print("   ✔ Upload successful! API response:")
                            print("     →", response.json())
                        else:
                            print(f"   ❌ API Error (Status {response.status_code}):", response.text)

                    except Exception as e:
                        print(f"   ❌ Error processing attachment {filename}: {e}")
                    finally:
                        # Clean up temporary file
                        if os.path.exists(temp_path):
                            os.remove(temp_path)

                # Mark email as processed
                save_processed_id(msg_id)
                print("   ✔ Email marked as processed")

            if new_messages_count == 0:
                print("\n✨ No new messages to process")
            else:
                print(f"\n✨ Processed {new_messages_count} new message(s)")

    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        raise

    print("\n🎉 WipBot completed successfully!")


if __name__ == "__main__":
    main()
