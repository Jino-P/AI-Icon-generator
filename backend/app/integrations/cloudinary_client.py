import cloudinary
import cloudinary.uploader
from app.core.config import (
    CLOUDINARY_API_SECRET,
    CLOUDINARY_API_KEY,
    CLOUDINARY_CLOUD_NAME
)

class CloudinaryClient:
    def __init__(self):
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True
        )

    def upload(self, file_path, file_name):
        upload_result = cloudinary.uploader.upload(
            file_path,
            public_id=file_name
        )
        return upload_result["secure_url"]