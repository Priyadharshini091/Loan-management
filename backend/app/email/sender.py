import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Optional, List, Tuple
from app.config import settings

def send_email_with_attachments(
    subject: str,
    body: str,
    to_email: str,
    attachments: List[Tuple[str, bytes]] = []  # List of (filename, file_bytes)
) -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        # SMTP credentials not configured, return fallback success response log
        print(f"[EMAIL MOCK] Email would be sent to {to_email} with subject '{subject}' and {len(attachments)} attachments.")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html'))

        for fname, fbytes in attachments:
            part = MIMEApplication(fbytes, Name=fname)
            part['Content-Disposition'] = f'attachment; filename="{fname}"'
            msg.attach(part)

        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
