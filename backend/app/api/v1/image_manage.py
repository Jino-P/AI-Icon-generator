from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.database.models import Image, User
from app.services.file_service import FileService
from app.core.config import BACKEND_URL
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Image Management"])


# -------------------- SAVE (OVERWRITE EXISTING) --------------------
@router.post("/save-image")
async def save_image(
    image_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_record = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user.id,
        Image.is_deleted == False
    ).first()

    if not image_record:
        logger.error(f"Image with ID {image_id} not found for user {current_user.username}")
        raise HTTPException(status_code=404, detail="Image not found")

    file_bytes = await file.read()
    logger.info(f"Received file for saving: {file.filename}, size: {len(file_bytes)} bytes, for image ID: {image_id} by user: {current_user.username}")
    full_path = FileService.get_full_path(image_record.image_path)
    FileService.overwrite_file(full_path, file_bytes)
    logger.info(f"File saved successfully at {full_path} for image ID: {image_id}")
    return {"message": "Image updated successfully"}


# -------------------- SAVE AS NEW (VERSIONING) --------------------
@router.post("/save-as-new")
async def save_as_new(
    file: UploadFile = File(...),
    parent_image_id: int = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    logger.info(f"Received file for 'Save As New': {file.filename}, size: {len(file_bytes)} bytes, parent_image_id: {parent_image_id}, by user: {current_user.username}")
    filename = FileService.generate_filename()
    FileService.save_file(file_bytes, filename)

    version = 1

    if parent_image_id:
        logger.info(f"Parent image ID provided: {parent_image_id}, checking for existing versions")
        parent = db.query(Image).filter(
            Image.id == parent_image_id,
            Image.is_deleted == False
        ).first()

        if parent:
            logger.info(f"Parent image found: {parent.id}, calculating new version number")
            version = parent.version + 1

    new_image = Image(
        user_id=current_user.id,
        image_name=filename.replace(".png", ""),
        image_path=f"/generated_images/{filename}",
        parent_image_id=parent_image_id,
        version=version,
        is_deleted=False
    )
    logger.info(f"Creating new image record for user {current_user.username} with filename: {filename}, version: {version}, parent_image_id: {parent_image_id}")
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    logger.info(f"New image record created with ID: {new_image.id} for user {current_user.username}")
    return {
        "message": "New version saved",
        "image_id": new_image.id,
        "version": version
    }


# -------------------- SOFT DELETE --------------------
@router.delete("/image/{image_id}")
async def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_record = db.query(Image).filter(
        Image.id == image_id,
        Image.user_id == current_user.id,
        Image.is_deleted == False
    ).first()

    if not image_record:
        logger.error(f"Image with ID {image_id} not found for user {current_user.username} during delete operation")
        raise HTTPException(status_code=404, detail="Image not found")

    image_record.is_deleted = True  # ✅ Soft delete
    logger.info(f"Soft deleting image with ID {image_id} for user {current_user.username}")
    db.commit()
    logger.info(f"Image with ID {image_id} marked as deleted for user {current_user.username}")
    return {"message": "Image deleted successfully (soft delete)"}


# -------------------- GET IMAGE HISTORY --------------------
@router.get("/image-history/{image_id}")
def get_image_history(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    images = db.query(Image).filter(
        (
            (Image.id == image_id) |
            (Image.parent_image_id == image_id)
        ),
        Image.user_id == current_user.id,
        Image.is_deleted == False
    ).order_by(Image.version).all()

    return [
        {
            "id": img.id,
            "version": img.version,
            "image_url": f"{BACKEND_URL}/images/{img.image_name}.png"
        }
        for img in images
    ]