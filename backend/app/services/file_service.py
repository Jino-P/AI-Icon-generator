from pathlib import Path
import os
import time

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
IMAGE_DIR = BASE_DIR / "generated_images"
os.makedirs(IMAGE_DIR, exist_ok=True)


class FileService:

    @staticmethod
    def generate_filename(prefix: str = "edited") -> str:
        return f"{prefix}_{int(time.time())}.png"

    @staticmethod
    def save_file(file_bytes: bytes, filename: str) -> str:
        file_path = IMAGE_DIR / filename

        with open(file_path, "wb") as f:
            f.write(file_bytes)

        return str(file_path)

    @staticmethod
    def overwrite_file(file_path: Path, file_bytes: bytes):
        with open(file_path, "wb") as f:
            f.write(file_bytes)

    @staticmethod
    def delete_file(file_path: Path):
        if file_path.exists():
            os.remove(file_path)

    @staticmethod
    def get_full_path(relative_path: str) -> Path:
        return BASE_DIR / relative_path.lstrip("/")