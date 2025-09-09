from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from random import randint
from sqlalchemy import func
from db import get_db
from models.user_model import User
from models.withdrawal_model import Investment, Withdrawal
from models.referral_model import ReferralEarning
from models.roi_model import ROIConfig
from models.commission_model import CommissionConfig
from utils.auth_middleware import verify_token
from utils.email_sender import send_email_otp
from utils.user_logic import store_otp, verify_otp, calculate_investor_roi
from utils.roi_creditor import credit_daily_roi, force_credit_daily_roi

router = APIRouter()

# ────────────────────────────────
# 📌 SCHEMAS
# ────────────────────────────────

class WalletPayload(BaseModel):
    email: str
    wallet: str

class CommitPayload(BaseModel):
    email: str
    amount: float

class AutoDeposit(BaseModel):
    wallet: str
    amount: float
    tx_hash: str

class WithdrawalRequestPayload(BaseModel):
    otp: str

class SettleRequest(BaseModel):
    tx_hash: str

class RoleUpdate(BaseModel):
    id: int
    role: str  # "admin", "associate", "investor"

class ROIConfigPayload(BaseModel):
    percentage: float


from typing import List

class CommissionLevel(BaseModel):
    level: int
    percentage: float

class CommissionPayload(BaseModel):
    levels: List[CommissionLevel]


# ────────────────────────────────
# 📌 WALLET MODULE
# ────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from db import get_db
from models.user_model import User
from utils.auth_middleware import verify_token

router = APIRouter()


@router.post("/save-wallet")
def save_wallet(payload: WalletPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ check if wallet is already bound to another user
    existing = db.query(User).filter(User.wallet == payload.wallet).first()
    if existing and existing.id != user.id:
        raise HTTPException(
            status_code=400,
            detail="⚠️ This wallet is already bound to another account."
        )

    try:
        user.wallet = payload.wallet
        db.commit()
        db.refresh(user)
        return {"message": "✅ Wallet saved successfully"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="⚠️ This wallet is already bound to another account."
        )



@router.get("/user-info")
def get_user_info(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"wallet": user.wallet}


# ────────────────────────────────
# 📌 INVESTMENT MODULE
# ────────────────────────────────

@router.post("/commit-investment")
def commit_investment(data: CommitPayload):
    return {"message": f"🧾 Committed to invest {data.amount} USDT. Awaiting blockchain confirmation."}


@router.post("/poll-deposits")
def poll_deposit(data: AutoDeposit, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(wallet=data.wallet).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user with this wallet")

    existing = db.query(Investment).filter_by(tx_hash=data.tx_hash).first()
    if existing:
        return {"message": "Transaction already recorded."}

    timestamp = datetime.utcnow()
    inv = Investment(user_email=user.email, amount=data.amount, timestamp=timestamp, tx_hash=data.tx_hash)
    db.add(inv)

    # ───── One-Level Commission Logic ─────
    if user.referred_by:
        referrer = db.query(User).filter_by(referral_code=user.referred_by).first()
        config = db.query(CommissionConfig).first()

        if referrer and config:
            percentage = config.percentage
            commission_amount = round(data.amount * (percentage / 100), 2)

            earning = ReferralEarning(
                referrer_email=referrer.email,
                referred_email=user.email,
                investment_amount=data.amount,
                percentage=percentage,
                commission_amount=commission_amount,
                timestamp=timestamp,
            )
            db.add(earning)

    try:
        db.commit()
        return {"message": f"Investment recorded for {user.email}"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Duplicate transaction hash")


@router.get("/check-deposit")
def check_deposit(email: str, db: Session = Depends(get_db)):
    inv = (
        db.query(Investment)
        .filter_by(user_email=email)
        .order_by(Investment.timestamp.desc())
        .first()
    )
    if inv:
        return {"found": True, "amount": inv.amount, "timestamp": inv.timestamp}
    return {"found": False}


@router.get("/investments")
def get_investments(email: str, db: Session = Depends(get_db)):
    investments = (
        db.query(Investment)
        .filter_by(user_email=email)
        .order_by(Investment.timestamp.desc())
        .all()
    )

    return [
        {
            "amount": inv.amount,
            "timestamp": inv.timestamp,
            "tx_hash": inv.tx_hash
        }
        for inv in investments
    ]


@router.get("/admin/investments")
def get_all_investments_with_users(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    investments = db.query(Investment).order_by(Investment.timestamp.desc()).all()
    result = []
    for inv in investments:
        u = db.query(User).filter_by(email=inv.user_email).first()
        result.append({
            "email": inv.user_email,
            "name": u.name if u else "-",
            "amount": inv.amount,
            "timestamp": inv.timestamp,
            "tx_hash": inv.tx_hash,
        })
    return result


# ────────────────────────────────
# 📌 ROI CONFIG + CREDIT
# ────────────────────────────────

@router.get("/admin/roi")
def get_roi_config(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    roi = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    return {"percentage": roi.percentage if roi else 0.0}


@router.post("/admin/roi")
def set_roi_config(data: ROIConfigPayload, db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    roi = ROIConfig(percentage=data.percentage)
    db.add(roi)
    db.commit()
    db.refresh(roi)
    return {"message": "ROI updated", "percentage": roi.percentage}





# ────────────────────────────────
# 📌 COMMISSION CONFIG
# ────────────────────────────────

@router.get("/admin/commission")
def get_commission_config(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    config = db.query(CommissionConfig).first()
    return {"percentage": config.percentage if config else 0.0}


@router.post("/admin/commission")
def set_commission_config(payload: CommissionPayload, db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    db.query(CommissionConfig).delete()

    for entry in payload.levels:
        db.add(CommissionConfig(level=entry.level, percentage=entry.percentage))

    db.commit()
    return {"message": "Commission structure updated"}



# ────────────────────────────────
# 📌 ROLE MANAGEMENT
# ────────────────────────────────

@router.post("/admin/update-role")
def update_role(payload: RoleUpdate, db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")

    db_user = db.query(User).filter(User.id == payload.id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_user.is_admin = False
    db_user.is_associate = False

    if payload.role == "admin":
        db_user.is_admin = True
    elif payload.role == "associate":
        db_user.is_associate = True
    elif payload.role == "investor":
        pass
    else:
        raise HTTPException(status_code=400, detail="Invalid role")

    db.commit()
    db.refresh(db_user)
    return {"message": f"User role updated to {payload.role}", "user": {
        "id": db_user.id,
        "email": db_user.email,
        "is_admin": db_user.is_admin,
        "is_associate": db_user.is_associate
    }}


# ────────────────────────────────
# 📌 WITHDRAWAL MODULE
# ────────────────────────────────

@router.post("/send-otp-withdrawal")
def send_withdrawal_otp(user=Depends(verify_token)):
    otp = str(randint(100000, 999999))   # generate 6-digit OTP
    if not send_email_otp(user["email"], otp):  # try sending email
        raise HTTPException(status_code=500, detail="Failed to send OTP")
    store_otp(user["email"], otp)        # save OTP temporarily (DB/Redis/cache)
    return {"message": "OTP sent"}



@router.post("/request-withdrawal")
def request_withdrawal(data: WithdrawalRequestPayload, user=Depends(verify_token), db: Session = Depends(get_db)):
    today = datetime.utcnow().weekday()
    if today not in [5, 6]:
        raise HTTPException(status_code=400, detail="Withdrawals allowed only on Saturday and Sunday")

    db_user = db.query(User).filter_by(email=user["email"]).first()
    if not db_user or not db_user.wallet:
        raise HTTPException(status_code=400, detail="Wallet not bound")

    if db_user.wallet_balance <= 0:
        raise HTTPException(status_code=400, detail="No withdrawable balance")

    fee = db_user.wallet_balance * 0.05
    final_amount = db_user.wallet_balance - fee

    withdrawal = Withdrawal(
        email=db_user.email,
        amount=db_user.wallet_balance,
        fee=fee,
        final_amount=final_amount,
        wallet=db_user.wallet,
        status="pending",
        timestamp=datetime.utcnow(),
    )
    db.add(withdrawal)

    db_user.wallet_balance = 0.0
    db.commit()

    return {
        "message": "Withdrawal request submitted",
        "amount": withdrawal.amount,
        "fee": withdrawal.fee,
        "final_amount": withdrawal.final_amount,
    }


@router.get("/withdrawals")
def list_withdrawals(user=Depends(verify_token), db: Session = Depends(get_db)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(Withdrawal).order_by(Withdrawal.timestamp.desc()).all()


@router.get("/withdrawals/user")
def get_user_withdrawals(user=Depends(verify_token), db: Session = Depends(get_db)):
    return db.query(Withdrawal).filter_by(email=user["email"]).order_by(Withdrawal.timestamp.desc()).all()


@router.post("/withdrawals/approve/{withdrawal_id}")
def approve_withdrawal(withdrawal_id: int, data: SettleRequest, user=Depends(verify_token), db: Session = Depends(get_db)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    w = db.query(Withdrawal).filter_by(id=withdrawal_id, status="pending").first()
    if not w:
        raise HTTPException(status_code=404, detail="Withdrawal not found or already processed")

    # ✅ Mark withdrawal as settled
    w.status = "settled"
    w.tx_hash = data.tx_hash
    w.settled_at = datetime.utcnow()

    db.commit()
    return {
        "message": f"Withdrawal {withdrawal_id} settled successfully",
        "tx_hash": w.tx_hash,
        "final_amount": w.final_amount
    }


@router.post("/withdrawals/reject/{withdrawal_id}")
def reject_withdrawal(withdrawal_id: int, user=Depends(verify_token), db: Session = Depends(get_db)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    w = db.query(Withdrawal).filter_by(id=withdrawal_id, status="pending").first()
    if not w:
        raise HTTPException(status_code=404, detail="Withdrawal not found or already processed")

    # ✅ Return funds back to user wallet
    user_obj = db.query(User).filter_by(email=w.email).first()
    if user_obj:
        user_obj.wallet_balance += w.amount

    w.status = "rejected"
    w.settled_at = datetime.utcnow()

    db.commit()
    return {"message": f"Withdrawal {withdrawal_id} rejected & funds returned"}



# ────────────────────────────────
# 📌 ROI EARNINGS CHECK
# ────────────────────────────────

@router.get("/roi/earnings")
def get_investor_earnings(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    roi = db.query(ROIConfig).order_by(ROIConfig.id.desc()).first()
    percentage = roi.percentage if roi else 0.0

    investments = db.query(Investment).filter_by(user_email=email).all()
    now = datetime.utcnow()

    total = 0
    details = []
    for inv in investments:
        earned = calculate_investor_roi(db, inv.amount, inv.timestamp, now)
        total += earned
        details.append({
            "amount": inv.amount,
            "earned": earned,
            "timestamp": inv.timestamp
        })

    return {"percentage": percentage, "total": total, "details": details}
@router.get("/wallet/summary")
def wallet_summary(user=Depends(verify_token), db: Session = Depends(get_db)):
    db_user = db.query(User).filter_by(email=user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    withdrawals = db.query(Withdrawal).filter_by(email=db_user.email).order_by(Withdrawal.timestamp.desc()).all()

    return {
        "wallet": db_user.wallet,
        "wallet_balance": round(db_user.wallet_balance, 2),
        "withdrawals": [
            {
                "id": w.id,
                "amount": w.amount,
                "fee": w.fee,
                "final_amount": w.final_amount,
                "status": w.status,
                "timestamp": w.timestamp
            }
            for w in withdrawals
        ]
    }
@router.get("/get-referral-income")
def get_referral_income(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch referral earnings (already recorded daily in credit_daily_roi)
    earnings = db.query(ReferralEarning).filter_by(referrer_email=email).all()

    total = sum(e.commission_amount for e in earnings)

    withdrawn = db.query(Withdrawal).filter_by(email=email).with_entities(
        Withdrawal.final_amount
    ).all()
    withdrawn_sum = sum(w.final_amount for w in withdrawn)

    return {
        "total": round(total, 2),            # total referral commission earned
        "withdrawn": round(withdrawn_sum, 2), # withdrawals already made
        "withdrawable": round(user.wallet_balance, 2), # live wallet balance
        "details": [
            {
                "investor": e.referred_email,   # who generated this earning
                "roi_source": round(e.investment_amount, 2),  # original deposit (context)
                "commission": round(e.commission_amount, 2),  # actual commission earned from ROI
                "date": e.timestamp.strftime("%Y-%m-%d"),
            }
            for e in earnings
        ],
    }


@router.get("/associate/deposits")
def get_associate_deposits(user=Depends(verify_token), db: Session = Depends(get_db)):
    # find current user
    db_user = db.query(User).filter_by(email=user["email"]).first()
    if not db_user or not db_user.is_associate:
        raise HTTPException(status_code=403, detail="Associate access required")

    # get all referrals of this associate
    referrals = db.query(User).filter(User.referred_by == db_user.referral_code).all()
    referred_emails = [r.email for r in referrals]

    if not referred_emails:
        return []

    # fetch deposits by referred users
    deposits = (
        db.query(Investment)
        .filter(Investment.user_email.in_(referred_emails))
        .order_by(Investment.timestamp.desc())
        .all()
    )

    result = []
    for inv in deposits:
        u = db.query(User).filter_by(email=inv.user_email).first()
        result.append({
            "name": u.name if u else inv.user_email,  # fallback to email if no name
            "amount": inv.amount,
            "timestamp": inv.timestamp,
            "tx_hash": inv.tx_hash,
        })

    return result


@router.get("/admin/financial-summary")
def get_financial_summary(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    # Total Deposits
    total_deposits = db.query(func.sum(Investment.amount)).scalar() or 0

    # Total Commission Paid
    total_commissions = db.query(func.sum(ReferralEarning.commission_amount)).scalar() or 0

    # Total Withdrawals
    total_withdrawals = db.query(func.sum(Withdrawal.final_amount)).scalar() or 0

    # Total Wallet Balances (handle NULLs safely)
    total_wallet_balances = db.query(func.sum(User.wallet_balance)).scalar() or 0

    # ROI Distributed = balances + withdrawals - commissions
    total_roi = total_wallet_balances + total_withdrawals - total_commissions

    # User payout list
    users = db.query(User).all()
    user_payouts = [
        {
            "name": u.name,
            "email": u.email,
            "wallet": u.wallet,
            "wallet_balance": round(u.wallet_balance or 0.0, 2)  # ✅ fix
        }
        for u in users
    ]

    return {
        "total_deposits": round(total_deposits, 2),
        "total_commissions": round(total_commissions, 2),
        "total_roi_distributed": round(total_roi, 2),
        "user_payouts": user_payouts
    }

    
@router.get("/admin/stats")
def get_admin_stats(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_deposits = db.query(func.sum(Investment.amount)).scalar() or 0
    total_withdrawals = db.query(func.sum(Withdrawal.final_amount)).scalar() or 0
    total_commissions = db.query(func.sum(ReferralEarning.commission_amount)).scalar() or 0

    return {
        "total_users": total_users,
        "total_deposits": round(total_deposits, 2),
        "total_withdrawals": round(total_withdrawals, 2),
        "total_commissions": round(total_commissions, 2),
    }
    

@router.post("/admin/force-credit-roi")
def run_force_daily_roi(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return force_credit_daily_roi(db)

@router.post("/admin/credit-daily-roi")
def run_daily_roi(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")
    return credit_daily_roi(db)

@router.post("/admin/reset-roi-dates")
def reset_roi_dates(db: Session = Depends(get_db), user=Depends(verify_token)):
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin only")

    investments = db.query(Investment).all()
    for inv in investments:
        inv.last_roi_date = None  # reset to uncredited

    db.commit()
    return {"message": "✅ All ROI dates reset successfully. You can re-run ROI crediting now."}
