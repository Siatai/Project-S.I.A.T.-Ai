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
def calculate_investor_roi(db, amount: float, start_date: datetime, now: datetime):
    from models.roi_model import ROIConfig  # import inside to avoid circular
    roi = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    if not roi:
        return 0.0

    monthly_percentage = roi.percentage
    daily_percentage = monthly_percentage / 30  # ✅ convert monthly → daily

    days = (now - start_date).days
    if days < 0:
        days = 0

    earned = amount * (daily_percentage / 100) * days
    return round(earned, 2)