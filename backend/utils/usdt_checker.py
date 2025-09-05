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

BSC_API_KEY = os.getenv("BSC_API_KEY")
MONITORED_ADDRESS = os.getenv("MONITORED_ADDRESS").lower()
USDT_CONTRACT = "0x55d398326f99059fF775485246999027B3197955"

last_tx_hash = None

def check_for_deposit():
    global last_tx_hash

    url = "https://api.bscscan.com/api"
    params = {
        "module": "account",
        "action": "tokentx",
        "address": MONITORED_ADDRESS,
        "contractaddress": USDT_CONTRACT,
        "page": 1,
        "offset": 5,
        "sort": "desc",
        "apikey": BSC_API_KEY,
    }

    try:
        res = requests.get(url, params=params, timeout=10)
        data = res.json()
        txs = data.get("result", [])

        if not txs:
            return

        tx = txs[0]
        tx_to = tx.get("to", "").lower()
        tx_hash = tx.get("hash")
        sender = tx.get("from", "").lower()

        if tx_to != MONITORED_ADDRESS or tx_hash == last_tx_hash:
            return

        last_tx_hash = tx_hash
        amount = int(tx["value"]) / 1e18

        print(f"🔔 USDT received: {amount:.2f} from {sender} | TX: {tx_hash}")

        db: Session = SessionLocal()
        user = db.query(User).filter(User.wallet.ilike(sender)).first()

        if not user:
            print("⚠️ No user found with wallet:", sender)
            db.close()
            return

        existing = db.query(Investment).filter_by(tx_hash=tx_hash).first()
        if existing:
            print(f"⛔ Duplicate investment already recorded: {tx_hash}")
            db.close()
            return

        db.add(Investment(
            user_email=user.email,
            amount=amount,
            tx_hash=tx_hash,
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
        print("❌ Error in check_for_deposit:", e)

def start_polling():
    print("🌀 Polling started in background...")
    while True:
        check_for_deposit()
        time.sleep(10)
