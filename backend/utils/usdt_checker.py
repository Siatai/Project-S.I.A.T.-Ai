import os
import requests
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError

from db import SessionLocal
from models.user_model import User
from models.withdrawal_model import Investment
from models.referral_model import ReferralEarning

# Load env
load_dotenv()

# ✅ TRC20 USDT contract on TRON
TRC20_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
MONITORED_ADDRESS = os.getenv("MONITORED_ADDRESS")

last_tx_id = None  # prevent duplicates


def check_for_trc20_deposit() -> int:
    """
    Poll TronGrid API for incoming USDT(TRC20) transfers
    to the monitored wallet. Record as Investment if valid.

    Returns:
        int: number of new deposits recorded
    """
    global last_tx_id
    new_tx_count = 0

    url = f"https://api.trongrid.io/v1/accounts/{MONITORED_ADDRESS}/transactions/trc20"
    params = {
        "limit": 10,
        "contract_address": TRC20_USDT_CONTRACT,
        "only_confirmed": "true",
        "order_by": "block_timestamp,desc",
    }
    headers = {"Accept": "application/json", "User-Agent": "Mozilla/5.0"}

    try:
        res = requests.get(url, params=params, headers=headers, timeout=10)
        res.raise_for_status()
        data = res.json()

        txs = data.get("data", [])
        if not txs:
            return 0

        db: Session = SessionLocal()

        for tx in txs:
            tx_id = tx["transaction_id"]
            sender = tx["from"]
            receiver = tx["to"]
            decimals = int(tx["token_info"]["decimals"])
            amount = int(tx["value"]) / (10**decimals)

            # ✅ Only check deposits into our wallet
            if receiver.lower() != MONITORED_ADDRESS.lower():
                continue
            if tx_id == last_tx_id:
                continue

            last_tx_id = tx_id
            ts = datetime.fromtimestamp(tx["block_timestamp"] / 1000, tz=timezone.utc)

            # ✅ Prevent duplicate
            existing = db.query(Investment).filter_by(tx_hash=tx_id).first()
            if existing:
                continue

            # ✅ Match user by wallet
            user = db.query(User).filter(User.wallet.ilike(sender)).first()
            if not user:
                print(f"⚠️ Deposit ignored, no user with wallet: {sender}")
                continue

            # ✅ Insert investment
            inv = Investment(
                user_email=user.email,
                amount=amount,
                tx_hash=tx_id,
                timestamp=ts,
                is_associate=False,
            )
            db.add(inv)
            print(f"✅ Investment recorded: {user.email} | {amount} USDT")

            # ✅ Handle referral earning
            if user.referred_by:
                referrer = db.query(User).filter_by(referral_code=user.referred_by).first()
                if referrer:
                    earning = ReferralEarning(
                        referrer_email=referrer.email,
                        referred_email=user.email,
                        investment_amount=amount,
                        timestamp=ts,
                    )
                    db.add(earning)
                    print(f"💰 Referral earning credited to {referrer.email}")

            try:
                db.commit()
                new_tx_count += 1
            except IntegrityError:
                db.rollback()
                print(f"⛔ Duplicate TX skipped: {tx_id}")

        db.close()

    except Exception as e:
        print("❌ Error in check_for_trc20_deposit:", e)

    return new_tx_count


def start_trc20_polling(interval: int = 15):
    """
    Blocking loop to continuously poll TRC20 transactions.
    """
    print("🌀 TRC20 Polling started...")
    import time

    while True:
        new_tx = check_for_trc20_deposit()
        if new_tx > 0:
            print(f"🔎 {new_tx} new deposit(s) recorded")
        time.sleep(interval)


if __name__ == "__main__":
    start_trc20_polling()
