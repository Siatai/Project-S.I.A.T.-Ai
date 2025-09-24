from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

# ✅ Import routers
from api.routes.auth_routes import router as auth_router
from api.routes.investment_router import router as investment_router
from api.routes.associate import router as associate_router

# ✅ Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 App starting...")

    # Background poller example (every 10s)
    async def poller():
        while True:
            try:
                print("🔄 Running poll-deposits...")
                # TODO: call your poll_deposit logic here
                # from services.poller import poll_deposits
                # await poll_deposits()
            except Exception as e:
                print(f"⚠️ Poller error: {e}")
            await asyncio.sleep(10)

    # Start background task
    asyncio.create_task(poller())

    yield   # ⬅️ App runs here

    print("🛑 App shutting down...")


# ✅ Initialize app with lifespan
app = FastAPI(title="Project S-I-A-T-AI API", version="1.0.0", lifespan=lifespan)

# ✅ Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, )

app.include_router(investment_router)

app.include_router(associate_router)


# ✅ Root endpoint
@app.get("/", tags=["Root"])
def root():
    return {"message": "Welcome to Project S-I-A-T-AI API"}
