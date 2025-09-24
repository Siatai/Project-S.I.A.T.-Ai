from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError

# ✅ Import routers
from api.routes.auth_routes import router as auth_router
from api.routes.investment_router import router as investment_router
from api.routes.associate import router as associate_router

# ✅ Import models
from db import SessionLocal
from models.user_model import User
from models.withdrawal_model import Investment
from models.referral_model import ReferralEarning
from models.associate_config_model import AssociateConfig
from models.commission_model import CommissionConfig
from models.DirectReferralBonus import DirectReferralBonus

# ✅ Import blockchain checker
from utils.usdt_checker import check_for_trc20_deposit


# ────────────────────────────────
# 📌 POLL LOGIC (Referral + Associate Bonus)
# ────────────────────────────────
def poll_deposit_auto():
    db: Session = SessionLocal()
    timestamp = datetime.utcnow()

    try:
        # Fetch all investor deposits (non-associate)
        all_investments = db.query(Investment).filter_by(is_associate=False).all()

        for inv in all_investments:
            user = db.query(User).filter_by(email=inv.user_email).first()
            if not user or not user.referred_by:
                continue

            referrer = db.query(User).filter_by(referral_code=user.referred_by).first()
            config = db.query(CommissionConfig).first()
            assoc_cfg = db.query(AssociateConfig).order_by(AssociateConfig.id.desc()).first()

            if not referrer or not config or not assoc_cfg:
                continue

            # ✅ Safe casting for Decimal values
            inv_amount = float(inv.amount)
            percentage_val = float(config.percentage)
            assoc_percent = float(assoc_cfg.referral_percent)

            # Commission calc
            commission_amount = round(inv_amount * (percentage_val / 100), 2)

            # Referral earning (if not exists)
            exists_ref = db.query(ReferralEarning).filter_by(
                referrer_email=referrer.email,
                referred_email=user.email,
                investment_amount=inv.amount
            ).first()
            if not exists_ref:
                earning = ReferralEarning(
                    referrer_email=referrer.email,
                    referred_email=user.email,
                    investment_amount=inv_amount,
                    percentage=percentage_val,
                    commission_amount=commission_amount,
                    timestamp=timestamp,
                )
                db.add(earning)

            # Associate deposit (if not exists)
            exists_assoc = db.query(Investment).filter(
                Investment.is_associate == True,
                Investment.source_investor == user.email,
                Investment.tx_hash == inv.tx_hash
            ).first()
            if not exists_assoc:
                assoc_amount = round(inv_amount * (assoc_percent / 100), 2)
                assoc_dep = Investment(
                    user_email=referrer.email,
                    amount=assoc_amount,
                    is_associate=True,
                    source_investor=user.email,
                    lock_days=assoc_cfg.lock_days,
                    tx_hash=inv.tx_hash,
                    matured_at=inv.timestamp + timedelta(days=assoc_cfg.lock_days),
                )
                db.add(assoc_dep)

            # Direct referral bonus (if not exists)
            bonus_tx_hash = f"{referrer.email}-{user.email}-{inv.tx_hash}"
            exists_bonus = db.query(DirectReferralBonus).filter_by(tx_hash=bonus_tx_hash).first()
            if not exists_bonus:
                direct_bonus = DirectReferralBonus(
                    referrer_email=referrer.email,
                    referee_email=user.email,
                    amount=inv_amount,
                    percentage=percentage_val,
                    bonus_amount=commission_amount,
                    tx_hash=bonus_tx_hash,
                    lock_days=assoc_cfg.lock_days,
                    matured_at=inv.timestamp + timedelta(days=assoc_cfg.lock_days),
                )
                db.add(direct_bonus)

        db.commit()
        print("✅ poll_deposit_auto executed successfully")

    except IntegrityError:
        db.rollback()
        print("⚠️ Integrity error while polling deposits")

    except Exception as e:
        db.rollback()
        print(f"⚠️ Poller error: {e}")

    finally:
        db.close()


# ────────────────────────────────
# 📌 Lifespan context manager
# ────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 App starting...")

    async def poller():
        while True:
            try:
                # 1. Check blockchain (TRC20 deposits)
                print("🔎 Checking TRC20 deposits...")
                check_for_trc20_deposit()

                # 2. Process referral/associate bonuses
                print("🔄 Running poll_deposit_auto...")
                poll_deposit_auto()

            except Exception as e:
                print(f"⚠️ Poller crash: {e}")

            await asyncio.sleep(10)  # run every 10 sec

    asyncio.create_task(poller())

    yield
    print("🛑 App shutting down...")


# ────────────────────────────────
# 📌 FastAPI APP
# ────────────────────────────────
app = FastAPI(
    title="Project AlgoMcube API",
    version="1.0.0",
    lifespan=lifespan
)

# ✅ Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ change to frontend domain in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routers
app.include_router(auth_router)
app.include_router(investment_router)
app.include_router(associate_router)


# ✅ Root endpoint
@app.get("/", tags=["Root"])
def root():
    return {"message": "Welcome to Project AlgoMcube API"}
