from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.config import BASE_DIR
from app.database.models import Image

router = APIRouter(prefix="/api", tags=["Images"])


@router.get("/images")
def get_images(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    images = db.query(Image).filter(
        Image.user_id == current_user.id
    ).all()

    return [
        {
            "id": img.id,
            # "image_url": f"http://localhost:8000/images/{img.image_name}.png",
            "image_url":img.image_path,
            "name": img.image_name,
            "prompt": img.prompt,
            "generation_id": img.generation_id
        }
        for img in images
    ]

@router.get("/image/{image_id}")
async def get_image(
    image_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_record = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user.id
    ).first()

    if not image_record:
        return {"error": "Image not found or unauthorized"}

    # relative_path = image_record.image_path.lstrip("/")
    # full_path = BASE_DIR / relative_path
    full_path = image_record.image_path

    # if not full_path.exists():
    #     return {"error": "File not found on disk"}
    # return FileResponse(str(full_path))
    # return FileResponse(full_path)
    return {
        "image_url":full_path
    }