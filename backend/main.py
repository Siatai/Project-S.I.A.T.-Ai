from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Import your routers
from api.routes.auth_routes import router as auth_router

from api.routes.investment_router import router as investment_router

from api.routes.associate import router as associate_router

# ✅ Initialize app
app = FastAPI(title="Project S-I-A-T-AI API", version="1.0.0")

# ✅ Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change this to your frontend domain later for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Register routers (order doesn’t matter)
app.include_router(auth_router, )

app.include_router(investment_router)

app.include_router(associate_router)

# ✅ Root endpoint
@app.get("/", tags=["Root"])
def root():
    return {"message": "Welcome to Project S-I-A-T-AI API"}
print(app.routes)

