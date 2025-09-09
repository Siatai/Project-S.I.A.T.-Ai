from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from db import SessionLocal, get_db
from models.user_model import User
import secrets
import string
from fastapi import Depends, HTTPException
from utils.auth_middleware import verify_token
# ─────────────────────────────── OTP IN-MEMORY DB ─────────────────────────────── #
otps_db = {}

# ─────────────────────────────── REFERRAL CODE GENERATOR (UNIQUE) ─────────────────────────────── #
def generate_unique_referral_code(db: Session, length=6):
    characters = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(secrets.choice(characters) for _ in range(length))
        if not db.query(User).filter(User.referral_code == code).first():
            return code

# ─────────────────────────────── CREATE / UPDATE USER ─────────────────────────────── #
def create_or_update_user(email, name, referrer=None, wallet=None):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email == email).first()

    if not user:
        referral_code = generate_unique_referral_code(db)
        user = User(
            email=email.strip(),
            email_lower=email.lower().strip(),  
            name=name,
            referred_by=referrer,
            wallet=wallet,
            referral_code=referral_code,
            is_associate=False,
            pending_associate=False,
            is_admin=(email == "admin@algomcube.com")
        )
        db.add(user)
    else:
        user.name = name  # ✅ Ensure name is updated
        if wallet:
            user.wallet = wallet
        if user.pending_associate is None:
            user.pending_associate = False

    db.commit()
    db.close()

# ─────────────────────────────── STORE OTP ─────────────────────────────── #
def store_otp(email, otp):
    otps_db[email] = {
        "otp": otp,
        "expires_at": datetime.utcnow() + timedelta(minutes=10)
    }

# ─────────────────────────────── VERIFY OTP ─────────────────────────────── #
def verify_otp(email, otp):
    entry = otps_db.get(email)
    if not entry:
        return False
    if entry["otp"] != otp:
        return False
    if datetime.utcnow() > entry["expires_at"]:
        del otps_db[email]
        return False
    del otps_db[email]
    return True

# ─────────────────────────────── FETCH USER BY EMAIL ─────────────────────────────── #
def get_user(email):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    db.close()
    return user

# ─────────────────────────────── ADMIN: APPROVE USER ─────────────────────────────── #
def approve_user(email):
    db: Session = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.is_associate = True
        db.commit()
    db.close()

# ─────────────────────────────── ADMIN: LIST ALL USERS ─────────────────────────────── #
def get_all_users():
    db: Session = SessionLocal()
    users = db.query(User).all()
    db.close()
    return users

def get_current_user(
    token_data=Depends(verify_token), 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == token_data["email"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user