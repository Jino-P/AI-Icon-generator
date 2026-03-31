from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.database.database_handler import DatabaseHandler
import logging
router = APIRouter(prefix="/api", tags=["Credits"])
logger = logging.getLogger(__name__)

@router.get("/usage-summary")
async def get_credits(current_user = Depends(get_current_user), db= Depends(get_db)):
    logger.info(f"Fetching credit usage summary for user {current_user.username}")
    db_handler = DatabaseHandler(db)
    user_credits = db_handler.get_user_credits(current_user.id)
    logger.info(f"Retrieved credit usage for user {current_user.username}: {user_credits}")
    if not user_credits:
        return {"credits": 0}
    return {"credits": user_credits}

@router.get("/dashboard/icons")
def get_icons_dashboard(range: str = "weekly", db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    db_handler = DatabaseHandler(db)
    return db_handler.get_icons_data(range, current_user.id)

@router.get("/dashboard/usage-split")
def get_usage_split(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_handler = DatabaseHandler(db)
    return db_handler.get_usage_split_data(current_user.id)

@router.get("/dashboard/credits-usage")
def get_credits_usage(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_handler = DatabaseHandler(db)
    return db_handler.get_credits_usage_data(current_user.id)

@router.get("/dashboard/usage-summary")
def get_credits_over_time(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_handler = DatabaseHandler(db)
    return db_handler.get_usage_summary(current_user.id)