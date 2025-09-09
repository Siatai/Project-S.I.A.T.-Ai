from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from random import randint
from sqlalchemy import func
from typing import Dict
from db import get_db, SessionLocal
from models.user_model import User
from models.user_logic import (
    create_or_update_user,
    verify_otp,
    store_otp,
    get_user,
    approve_user,
    get_all_users,
)
from utils.token_utils import generate_token
from utils.email_sender import send_email_otp
from utils.auth_middleware import verify_token
from models.referral_model import ReferralEarning

router = APIRouter()

# ========== TEMP STORE FOR PENDING SIGNUPS ==========
PENDING_SIGNUPS: Dict[str, Dict[str, str]] = {}

# ========== SCHEMAS ==========
class SignUpOTPRequest(BaseModel):
    email: EmailStr
    name: str
    referrer: str

class SignInOTPRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class ApproveRequest(BaseModel):
    email: EmailStr

class UpdateNameRequest(BaseModel):
    email: EmailStr
    name: str

class ReferralsRequest(BaseModel):
    email: EmailStr
    referral_code: str


# ========== SEND OTP (SIGNUP) ==========
# ========== SEND OTP (SIGNUP) ==========
@router.post("/send-otp-signup")
def send_otp_signup(data: SignUpOTPRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    name = data.name.strip()
    referrer = data.referrer.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    if not referrer:
        raise HTTPException(status_code=400, detail="Referral code is required")

    existing_user = db.query(User).filter(User.email_lower == email).first()
    if existing_user:
        return JSONResponse(status_code=400, content={"message": "User already exists. Please sign in."})

    ref = db.query(User).filter(User.referral_code == referrer).first()
    if not ref:
        raise HTTPException(status_code=400, detail="Invalid referrer code")

    otp = str(randint(100000, 999999))
    # ✅ Pass purpose explicitly
    if not send_email_otp(email, otp, purpose="signup"):
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    store_otp(email, otp)
    PENDING_SIGNUPS[email] = {"name": name, "referrer": referrer}

    print(f"✅ Signup OTP for {email}: {otp}")
    return {"message": "OTP sent successfully"}


# ========== SEND OTP (SIGNIN) ==========
@router.post("/send-otp-signin")
def send_otp_signin(data: SignInOTPRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()

    existing_user = db.query(User).filter(User.email_lower == email).first()
    if not existing_user:
        return JSONResponse(status_code=404, content={"message": "User not found. Please sign up."})

    otp = str(randint(100000, 999999))
    # ✅ Pass purpose explicitly
    if not send_email_otp(email, otp, purpose="login"):
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    store_otp(email, otp)
    print(f"✅ Login OTP for {email}: {otp}")
    return {"message": "OTP sent successfully"}



# ========== VERIFY OTP ==========
@router.post("/verify-otp")
def verify(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()

    if not verify_otp(email, data.otp):
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email_lower == email).first()

    # SIGNIN: existing user
    if user:
        token = generate_token(user)
        return {
            "token": token,
            "user": {
                "email": user.email,
                "name": user.name,
                "referral_code": user.referral_code,
                "is_admin": user.is_admin,
                "is_associate": user.is_associate,
                "pending_associate": user.pending_associate,
                "wallet": user.wallet,
            },
        }

    # SIGNUP: create new user
    pending = PENDING_SIGNUPS.get(email)
    if not pending:
        raise HTTPException(status_code=400, detail="No pending signup found for this email")

    name = pending.get("name", "").strip()
    referrer = pending.get("referrer", "").strip()

    ref = db.query(User).filter(User.referral_code == referrer).first()
    if not ref:
        PENDING_SIGNUPS.pop(email, None)
        raise HTTPException(status_code=400, detail="Invalid referrer code")

    create_or_update_user(email=email, name=name, referrer=referrer)
    new_user = db.query(User).filter(User.email_lower == email).first()

    if not new_user:
        raise HTTPException(status_code=500, detail="Failed to create user")

    PENDING_SIGNUPS.pop(email, None)

    token = generate_token(new_user)
    return {
        "token": token,
        "user": {
            "email": new_user.email,
            "name": new_user.name,
            "referral_code": new_user.referral_code,
            "is_admin": new_user.is_admin,
            "is_associate": new_user.is_associate,
            "pending_associate": new_user.pending_associate,
            "wallet": new_user.wallet,
        },
    }


# ========== CURRENT USER ==========
@router.get("/me")
def get_me(token_user=Depends(verify_token), db: Session = Depends(get_db)):
    email = token_user["email"]
    user = db.query(User).filter(User.email_lower == email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "referral_code": user.referral_code,
        "is_admin": user.is_admin,
        "is_associate": user.is_associate,
        "pending_associate": user.pending_associate,
        "wallet": user.wallet,
    }


# ========== REQUEST ASSOCIATE ==========
@router.post("/request-associate")
def request_associate(user=Depends(verify_token), db: Session = Depends(get_db)):
    u = db.query(User).filter_by(email_lower=user["email"].lower()).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.pending_associate = True
    db.commit()
    return {"message": "Request submitted to admin"}


# ========== ADMIN: APPROVE ASSOCIATE ==========
@router.post("/approve-associate")
def approve_associate(data: ApproveRequest, token_user=Depends(verify_token), db: Session = Depends(get_db)):
    if not token_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access only")

    u = db.query(User).filter(User.email_lower == data.email.lower()).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    u.is_associate = True
    u.pending_associate = False
    db.commit()
    return {"message": f"{data.email} has been approved as an associate"}


# ========== ADMIN: GET ALL USERS ==========
@router.get("/all-users")
def all_users(token_user=Depends(verify_token)):
    if not token_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    users = get_all_users()
    return [
        {
            "id": u.id,
            "email": u.email,
            "name": u.name,
            "is_admin": u.is_admin,
            "is_associate": u.is_associate,
            "pending_associate": u.pending_associate,
        }
        for u in users
    ]


# ========== USER: UPDATE NAME ==========
@router.post("/update-name")
def update_name(data: UpdateNameRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email_lower == data.email.lower()).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.name = data.name.strip()
    db.commit()
    return {"message": "Name updated successfully"}


# ========== USER: GET MY REFERRALS ==========
@router.post("/my-referrals")
def get_my_referrals(data: ReferralsRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email_lower == data.email.lower(),
        User.referral_code == data.referral_code.strip()
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found or referral code mismatch")

    referred_users = db.query(User).filter(User.referred_by == data.referral_code.strip()).all()

    return [
        {
            "name": u.name,
            "email": u.email,
            "role": "Associate" if u.is_associate else "Investor",
        }
        for u in referred_users
    ]

@router.get("/admin/last-roi-credit")
def get_last_roi_credit(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    last_credit = db.query(func.max(ReferralEarning.timestamp)).scalar()
    if not last_credit:
        return {"last_credit": None, "message": "ROI has never been credited yet"}
    
    return {"last_credit": last_credit}