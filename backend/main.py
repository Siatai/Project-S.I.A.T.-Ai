from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import os
import shutil
import subprocess
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy.exc import IntegrityError
import httpx

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


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
AUDIT_DIR = os.path.join(PROJECT_DIR, "audit_service")
AUDIT_PUBLIC_DIR = os.path.join(AUDIT_DIR, "public")
AUDIT_INDEX_FILE = os.path.join(AUDIT_PUBLIC_DIR, "index.html")
AUDIT_LOCAL_URL = "http://127.0.0.1:3010"
audit_process = None


def ensure_audit_dependencies():
    package_marker = os.path.join(AUDIT_DIR, "node_modules", "better-sqlite3", "package.json")
    if os.path.exists(package_marker):
        return True

    npm_executable = "npm.cmd" if os.name == "nt" else "npm"
    if not shutil.which(npm_executable):
        print("⚠️ npm not found, skipping /AUDIT dependency install")
        return False

    try:
        subprocess.run(
            [npm_executable, "install", "--omit=dev"],
            cwd=AUDIT_DIR,
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except (subprocess.CalledProcessError, OSError):
        print("⚠️ audit_service dependency install failed, skipping /AUDIT service startup")
        return False


def start_audit_process():
    global audit_process
    if audit_process and audit_process.poll() is None:
        return
    if not os.path.exists(os.path.join(AUDIT_DIR, "server.js")):
        print("⚠️ audit_service/server.js not found, skipping /AUDIT service startup")
        return
    if not ensure_audit_dependencies():
        return

    audit_env = os.environ.copy()
    audit_env.setdefault("PORT", "3010")
    audit_env.setdefault("DEPOSIT_WALLET_ADDRESS", "0xc2b65f40b8361F9eCf27FB03F2ce3992D1F0211c")
    audit_env.setdefault("WITHDRAWAL_WALLET_ADDRESS", "0x876F2A2EfE1B20E38018c8292823d814bf195216")
    audit_env.setdefault("USDT_CONTRACT", "0x55d398326f99059fF775485246999027B3197955")
    audit_env.setdefault("BSC_RPC_URL", "https://bsc-dataseed.bnbchain.org")
    audit_process = subprocess.Popen(
        ["node", "server.js"],
        cwd=AUDIT_DIR,
        env=audit_env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def stop_audit_process():
    global audit_process
    if audit_process and audit_process.poll() is None:
        audit_process.terminate()
        try:
            audit_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            audit_process.kill()
    audit_process = None


# ────────────────────────────────
# 📌 POLL LOGIC (Referral + Associate Bonus)
# ────────────────────────────────
def poll_deposit_auto():
    db: Session = SessionLocal()
    timestamp = datetime.utcnow()

    try:
        # Fetch all investor deposits (non-associate only)
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

            # ✅ Safe numeric conversions
            inv_amount = float(inv.amount or 0)
            percentage_val = float(config.percentage or 0)
            assoc_percent = float(assoc_cfg.referral_percent or 0)

            # Commission calc
            commission_amount = round(inv_amount * (percentage_val / 100), 2)

            # Referral earning (ledger) → prevent duplicate
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

            # Associate deposit → prevent duplicate
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

            # Direct referral bonus → prevent duplicate
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
    start_audit_process()

    async def poller():
        while True:
            try:
                # 1. Blockchain deposits
                print("🔎 Checking TRC20 deposits...")
                check_for_trc20_deposit()

                # 2. DB → referral/associate logic
                print("🔄 Running poll_deposit_auto...")
                poll_deposit_auto()

            except Exception as e:
                print(f"⚠️ Poller crash: {e}")

            await asyncio.sleep(10)  # every 10 sec

    asyncio.create_task(poller())

    yield
    stop_audit_process()
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
    allow_origins=["*"],  # ⚠️ restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.isdir(AUDIT_PUBLIC_DIR):
    app.mount("/audit-assets", StaticFiles(directory=AUDIT_PUBLIC_DIR), name="audit-assets")

# ✅ Register routers
app.include_router(auth_router)
app.include_router(investment_router)
app.include_router(associate_router)


@app.get("/AUDIT", include_in_schema=False)
@app.get("/AUDIT/", include_in_schema=False)
def hidden_audit_page():
    return FileResponse(AUDIT_INDEX_FILE)


@app.api_route("/audit-api/{path:path}", methods=["GET", "POST"], include_in_schema=False)
async def audit_api_proxy(path: str, request: Request):
    target_url = f"{AUDIT_LOCAL_URL}/api/{path}"
    headers = {
        key: value
        for key, value in request.headers.items()
        if key.lower() not in {"host", "content-length"}
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        if request.method == "GET":
            upstream = await client.get(target_url, headers=headers, params=dict(request.query_params))
        else:
            content_type = request.headers.get("content-type", "")
            if "multipart/form-data" in content_type:
                form = await request.form()
                files = []
                data = {}
                for key, value in form.multi_items():
                    filename = getattr(value, "filename", None)
                    if filename is not None:
                        files.append((key, (filename, await value.read(), value.content_type or "application/octet-stream")))
                    else:
                        data[key] = value
                upstream = await client.post(target_url, headers=headers, params=dict(request.query_params), data=data, files=files)
            else:
                body = await request.body()
                upstream = await client.post(target_url, headers=headers, params=dict(request.query_params), content=body)

    response_headers = {
        key: value
        for key, value in upstream.headers.items()
        if key.lower() not in {"content-encoding", "transfer-encoding", "connection"}
    }
    return Response(content=upstream.content, status_code=upstream.status_code, headers=response_headers, media_type=upstream.headers.get("content-type"))


@app.get("/audit-api/export.xlsx", include_in_schema=False)
async def audit_export_proxy(request: Request):
    async with httpx.AsyncClient(timeout=120.0) as client:
        upstream = await client.get(f"{AUDIT_LOCAL_URL}/api/export.xlsx", headers={
            key: value
            for key, value in request.headers.items()
            if key.lower() not in {"host", "content-length"}
        })
    response_headers = {
        key: value
        for key, value in upstream.headers.items()
        if key.lower() not in {"content-encoding", "transfer-encoding", "connection"}
    }
    return Response(content=upstream.content, status_code=upstream.status_code, headers=response_headers, media_type=upstream.headers.get("content-type"))


# ✅ Root endpoint
@app.get("/", tags=["Root"])
def root():
    return {"message": "Welcome to Project AlgoMcube API"}
