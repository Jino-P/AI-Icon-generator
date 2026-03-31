from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.database.database import engine, Base
from app.core.logger import setup_logger
from app.core.config import FRONTEND_URL

# Load environment variables
# -------------------- INIT --------------------
app = FastAPI(title="AI Icon Generator API")
logger = setup_logger()
# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
     expose_headers=[
        "X-Tokens-Used",
        "X-Images-Generated",
        "X-Credits-Used"
    ],
)

# -------------------- STATIC FILES --------------------
BASE_DIR = Path(__file__).resolve().parent
IMAGE_DIR = BASE_DIR / "generated_images"

IMAGE_DIR.mkdir(exist_ok=True)

app.mount("/images", StaticFiles(directory=IMAGE_DIR), name="images")



@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    logger.info("Backend started successfully")

# -------------------- ROUTERS --------------------
from app.api.v1.auth import router as auth_router
from app.api.v1.images import router as images_router
from app.api.v1.edit import router as edit_router
from app.api.v1.image_manage import router as image_manage_router
from app.api.v1.generation import router as generation_router
from app.api.v1.credits import router as credits_router

app.include_router(auth_router)
app.include_router(images_router)
app.include_router(edit_router)
app.include_router(image_manage_router)
app.include_router(credits_router)
app.include_router(generation_router)

# -------------------- STARTUP EVENTS --------------------
@app.on_event("startup")
def startup():
    logger.info("Backend started successfully")

# -------------------- HEALTH CHECK --------------------
@app.get("/")
def health():
    return {
        "status": "running",
        "service": "AI Icon Generator API"
    }