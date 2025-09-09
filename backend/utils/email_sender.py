import smtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")


def send_email_otp(to_email: str, otp: str, purpose: str = "signup"):
    # ✅ Different subject lines
    if purpose == "withdrawal":
        subject = "Your OTP for AlgoMcube Withdrawal"
    elif purpose == "login":
        subject = "Your OTP for AlgoMcube Login"
    else:
        subject = "Your OTP for AlgoMcube Signup"

    body = f"""
    Hello,

    Your OTP for {purpose} is: {otp}
    This OTP will expire in 10 minutes.

    Thanks,
    Team Mcube
    """

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = to_email

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
        print(f"✅ OTP ({purpose}) sent to {to_email}")
        return True
    except Exception as e:
        print("❌ Failed to send email:", e)
        return False
