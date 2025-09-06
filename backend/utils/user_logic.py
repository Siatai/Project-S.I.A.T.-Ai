from datetime import datetime, timedelta
from models.roi_model import ROIConfig

# ─────────────────────────────
# 📌 OTP Management (in-memory)
# ─────────────────────────────
# ⚠️ Production ke liye Redis/DB use karo, abhi ke liye dict chal jayega
otp_storage = {}

def store_otp(email: str, otp: str):
    """Store OTP for a user with 5 min expiry"""
    otp_storage[email] = {
        "otp": otp,
        "expires": datetime.utcnow() + timedelta(minutes=5)
    }

def verify_otp(email: str, otp: str) -> bool:
    """Verify OTP and delete if valid"""
    record = otp_storage.get(email)
    if not record:
        return False
    if record["otp"] != otp:
        return False
    if datetime.utcnow() > record["expires"]:
        return False

    # ✅ OTP used once
    del otp_storage[email]
    return True


# ─────────────────────────────
# 📌 ROI Calculation
# ─────────────────────────────
def calculate_investor_roi(db, investment_amount: float, start_date: datetime, end_date: datetime):
    """
    Calculate ROI earnings between two dates.
    - ROI% is per month
    - Split into weekdays only (Mon–Fri)
    - Skips Sat/Sun
    """
    roi = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    percentage = roi.percentage if roi else 0.0

    # Daily ROI % = Monthly % / 22 working days
    daily_percentage = percentage / 22  

    total_earned = 0.0
    current = start_date

    while current <= end_date:
        if current.weekday() < 5:  # Mon=0 ... Fri=4
            total_earned += investment_amount * (daily_percentage / 100)
        current += timedelta(days=1)

    return round(total_earned, 2)
