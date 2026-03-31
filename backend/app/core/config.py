from dotenv import load_dotenv
from pathlib import Path
import os

# 👇 Get backend root
BASE_DIR = Path(__file__).resolve().parent.parent

# 👇 Explicitly load .env
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
HUGGINGFACE_BASE_URL = os.getenv("HUGGINGFACE_BASE_URL")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL")
BACKEND_URL = os.getenv("BACKEND_URL")
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")
SEND_GRID_API = os.getenv("SEND_GRID_API")
VERIFICATION_EMAIL_FROM = os.getenv("VERIFICATION_EMAIL_FROM")
FRONTEND_URL = os.getenv("FRONTEND_URL")