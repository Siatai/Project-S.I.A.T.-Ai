from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import threading

# 🧱 DB and Base
from db import Base, engine, SessionLocal

# 🔗 Routers
from api.routes.auth_routes import router as auth_router
from api.routes.investment_router import router as investment_router
from api.routes.associate import router as associate_router  # ✅ NEW

# 🔁 Polling
from utils.usdt_checker import start_trc20_polling

# ⏰ ROI Creditor
from apscheduler.schedulers.background import BackgroundScheduler
from utils.roi_creditor import credit_daily_roi


# ─────────────────────────────── Background Polling + ROI Scheduler ─────────────────────────────── #
scheduler = BackgroundScheduler()

def run_daily_roi():
    """Background job to credit ROI daily (Mon–Fri only)."""
    db = SessionLocal()
    try:
        result = credit_daily_roi(db)
        print("✅ ROI Job:", result)
    except Exception as e:
        print("❌ ROI Job Error:", str(e))
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start USDT polling thread
    threading.Thread(target=start_trc20_polling, daemon=True).start()

    # Start ROI scheduler (runs daily Mon–Fri at 09:00 UTC)
    scheduler.add_job(run_daily_roi, "cron", day_of_week="mon-fri", hour=9, minute=0)
    scheduler.start()

    yield

    # On shutdown stop scheduler
    scheduler.shutdown()


# ─────────────────────────────── App Setup ─────────────────────────────── #
app = FastAPI(lifespan=lifespan)

# ✅ Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.algomcube.com",
        "https://algomcube.com",
        "http://localhost:3000"
    ],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register Routers
app.include_router(auth_router)
app.include_router(investment_router)
app.include_router(associate_router)  # ✅ NEW
