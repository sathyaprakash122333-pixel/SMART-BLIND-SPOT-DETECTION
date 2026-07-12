from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analytics import router as analytics_router
from app.routes.telemetry import router as telemetry_router


app = FastAPI(
    title="Smart Blind Spot Detection System API",
    description="Local FastAPI backend for ESP32 blind spot telemetry and analytics.",
    version="1.0.0",
)

# These origins cover the local React app during development.
# If you open the dashboard from another device on the same Wi-Fi,
# allow that device origin here as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(telemetry_router)
app.include_router(analytics_router)


@app.get("/")
def read_root() -> dict:
    return {
        "message": "Smart Blind Spot Detection System API is running.",
        "docs": "/docs",
    }
