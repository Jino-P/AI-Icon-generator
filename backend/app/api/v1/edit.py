from fastapi import APIRouter, Depends, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import os
import tempfile
import logging
from rembg import remove, new_session
from PIL import Image

from app.api.deps import get_db, get_current_user
from app.database.database_handler import DatabaseHandler
from app.database.models import User
from app.integrations.replicate_client import ReplicateImageGenerator

router = APIRouter(prefix="/api", tags=["Edit"])
logger = logging.getLogger(__name__)
session = new_session("u2netp")
# -------------------- REMOVE BACKGROUND --------------------
@router.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        logger.info(f"Received file for background removal: {file.filename}, size: {len(file_bytes)} bytes")
        output_image = remove(file_bytes, session=session)
        logger.info(f"Background removal successful for file: {file.filename}, output size: {len(output_image)} bytes")
        img = Image.open(io.BytesIO(output_image))
        if img.mode != "RGBA":
            img = img.convert("RGBA")

        logger.info(f"Image mode after conversion: {img.mode}, size: {img.size}")
        output_bytes = io.BytesIO()
        img.save(output_bytes, format="PNG", optimize=False)
        output_bytes.seek(0)
        logger.info(f"Final output image size: {output_bytes.getbuffer().nbytes} bytes")
        return StreamingResponse(
            output_bytes,
            media_type="image/png"
        )

    except Exception as e:
        logger.error(f"Error during background removal: {str(e)}")
        return {"error": str(e)}


# -------------------- HELPER --------------------
def _run_replicate_process(
    file_bytes: bytes,
    prompt: str,
    aspect_ratio: str = "match_input_image",
    output_format: str = "png",
) -> bytes:

    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    try:
        logger.info(f"Uploading file to Replicate for prompt: '{prompt}' with aspect_ratio: '{aspect_ratio}' and output_format: '{output_format}'")
        generator = ReplicateImageGenerator()
        file_url = generator.upload_file(tmp_path)
        logger.info(f"File uploaded to Replicate successfully, file URL: {file_url}")
        output = generator.generate_image(
            file_url=file_url,
            prompt=prompt,
            aspect_ratio=aspect_ratio,
            output_format=output_format,
        )

        if hasattr(output, "read"):
            logger.info(f"Output is a file-like object, reading content")
            return output.read()

        logger.info(f"Image generated successfully by Replicate, output size: {len(output)} bytes")
        return output

    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


# -------------------- EDIT WITH PROMPT --------------------
@router.post("/edit-with-prompt")
async def edit_with_prompt(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    aspect_ratio: str = Form("match_input_image"),
    output_format: str = Form("png"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_handler = DatabaseHandler(db)
    logger.info(f"Received edit request from user {current_user.username} with prompt: '{prompt}' and aspect_ratio: '{aspect_ratio}'")
    contents = await file.read()
    logger.info(f"Received file for editing: {file.filename}, size: {len(contents)} bytes")
    logger.info(f"Starting image editing process for user {current_user.username} using Replicate model 'black-forest-labs/flux-2-dev'")
    result_bytes = _run_replicate_process(
        contents,
        prompt,
        aspect_ratio,
        output_format
    )

    logger.info(f"Image editing completed for user {current_user.username}, output size: {len(result_bytes)} bytes")
    cost = db_handler.get_model_pricing("black-forest-labs/flux-2-dev").cost_per_image
    logger.info(f"Cost for editing operation: {cost} credits")
    db_handler.create_model_usage(
        user_id=current_user.id,
        model_name="black-forest-labs/flux-2-dev",
        model_provider="replicate",
        request_type="image_editing",
        images_generated=1,
        credits_used=cost
    )
    logger.info(f"Model usage recorded for user {current_user.username}: 1 image edited, {cost} credits used")
    return StreamingResponse(
        io.BytesIO(result_bytes),
        media_type=f"image/{output_format}",
        headers={"X-Credits-Used": str(cost)}
    )