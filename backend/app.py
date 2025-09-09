from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from api.routes.auth_routes import router as auth_router

from api.routes.investment_router import router as investment_router


app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(auth_router)

app.include_router(investment_router, prefix="/api")

# Health check root
@app.get("/")
def root():
    return {"message": "AlgoM3 API is running"}
