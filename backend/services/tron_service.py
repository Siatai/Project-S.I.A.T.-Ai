import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timezone

load_dotenv()

TRC20_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"  # Official USDT TRC20
MONITORED_ADDRESS = os.getenv("MONITORED_ADDRESS")  # Your TRON address (Txxxx)

last_tx_id = None  # Store last processed tx so you don’t process twice

def check_for_trc20_deposit():
    global last_tx_id

    url = f"https://api.trongrid.io/v1/accounts/{MONITORED_ADDRESS}/transactions/trc20"
    params = {
        "limit": 5,
        "contract_address": TRC20_USDT_CONTRACT,
        "only_confirmed": "true",
        "order_by": "block_timestamp,desc"
    }
    headers = {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0"
    }

    try:
        res = requests.get(url, params=params, headers=headers, timeout=10)
        res.raise_for_status()  # throw error if bad response
        data = res.json()

        if "data" not in data:
            print("⚠️ No transaction data found:", data)
            return None

        for tx in data["data"]:
            tx_id = tx["transaction_id"]

            if tx_id == last_tx_id:
                break  # Already processed

            # Extract fields
            amount = int(tx["value"]) / (10 ** int(tx["token_info"]["decimals"]))
            sender = tx["from"]
            receiver = tx["to"]
            ts = datetime.fromtimestamp(tx["block_timestamp"] / 1000, tz=timezone.utc)

            print(f"✅ New deposit detected:")
            print(f"   TX ID: {tx_id}")
            print(f"   From: {sender}")
            print(f"   To: {receiver}")
            print(f"   Amount: {amount} {tx['token_info']['symbol']}")
            print(f"   Time: {ts}")

            # Update last_tx_id so we don’t re-process
            last_tx_id = tx_id
            return {
                "tx_id": tx_id,
                "from": sender,
                "to": receiver,
                "amount": amount,
                "symbol": tx["token_info"]["symbol"],
                "timestamp": ts
            }

    except Exception as e:
        print("❌ Error while fetching deposits:", e)
        return None


if __name__ == "__main__":
    deposit = check_for_trc20_deposit()
    if deposit:
        print("💰 Deposit details:", deposit)
    else:
        print("No new deposits yet.")
