import requests
import time
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from backend.db import SessionLocal
from backend.models.user_model import User
from backend.models.withdrawal_model import Investment
from backend.models.referral_model import ReferralEarning
from datetime import datetime, timezone

load_dotenv()

TRC20_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
MONITORED_ADDRESS = os.getenv("MONITORED_ADDRESS").lower()  # must be base58 Tron address

last_tx_id = None

def check_for_trc20_deposit():
    global last_tx_id

    url = f"https://apilist.tronscanapi.com/api/transfer/trc20"
    params = {
        "limit": 5,
        "start": 0,
        "sort": "-timestamp",
        "count": True,
        "relatedAddress": MONITORED_ADDRESS,
        "contract_address": TRC20_USDT_CONTRACT
    }

    try:
        res = requests.get(url, params=params, timeout=10)
        data = res.json()
        txs = data.get("token_transfers", [])

        if not txs:
            return

        tx = txs[0]
        tx_to = tx.get("to_address", "").lower()
        tx_id = tx.get("transaction_id")
        sender = tx.get("from_address", "").lower()

        if tx_to != MONITORED_ADDRESS or tx_id == last_tx_id:
            return

        last_tx_id = tx_id
        amount = int(tx["quant"]) / 1e6  # USDT on TRON has 6 decimals

        print(f"🔔 USDT(TRC20) received: {amount:.2f} from {sender} | TX: {tx_id}")

        db: Session = SessionLocal()
        user = db.query(User).filter(User.wallet.ilike(sender)).first()

        if not user:
            print("⚠️ No user found with wallet:", sender)
            db.close()
            return

        existing = db.query(Investment).filter_by(tx_hash=tx_id).first()
        if existing:
            print(f"⛔ Duplicate investment already recorded: {tx_id}")
            db.close()
            return

        db.add(Investment(
            user_email=user.email,
            amount=amount,
            tx_hash=tx_id,
            timestamp=datetime.now(timezone.utc)
        ))
        print(f"✅ Investment recorded for {user.email}")

        if user.referred_by:
            referrer = db.query(User).filter_by(referral_code=user.referred_by).first()
            if referrer:
                db.add(ReferralEarning(
                    referrer_email=referrer.email,
                    referred_email=user.email,
                    investment_amount=amount,
                    timestamp=datetime.now(timezone.utc)
                ))
                print(f"💰 Referral earning credited to {referrer.email} from {user.email}")

        db.commit()
        db.close()

    except Exception as e:
        print("❌ Error in check_for_trc20_deposit:", e)


def start_trc20_polling():
    print("🌀 TRC20 Polling started in background...")
    while True:
        check_for_trc20_deposit()
        time.sleep(10)
