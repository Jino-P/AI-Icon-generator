from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.services.icon_generation_service import IconGenerationService
from app.schemas.generation import IconGenerateRequest
from app.database.models import User
import logging

router = APIRouter(prefix="/api", tags=["Generation"])
logger = logging.getLogger(__name__)

# -------------------- GENERATE ICONS --------------------
@router.post("/generate-icons")
def generate_icons(
    data: IconGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Generating icons for user: {current_user.username}")
        service = IconGenerationService(db)
        return service.generate_icons(data, current_user)

    except Exception as e:
        logger.error(f"Error occurred while generating icons: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))