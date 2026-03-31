from sqlalchemy import func
from sqlalchemy.orm import Session
from .models import Image, ModelUsage, ModelPricing,UserCredits
from datetime import datetime
from .database import SessionLocal, engine
from datetime import datetime, timedelta


class DatabaseHandler:

    def __init__(self, db):
        self.db = db
    # 🔹 Insert Image
    # def create_image(self, user_id: int, image_name: str, image_path: str):
    #     new_image = Image(
    #         user_id=user_id,
    #         image_name=image_name,
    #         image_path=image_path,
    #         created_at=datetime.utcnow()
    #     )

    #     self.db.add(new_image)
    #     self.db.commit()
    #     self.db.refresh(new_image)

    #     return new_image
    def create_image(self, user_id: int, image_name: str, image_path: str, generation_id: str, prompt: str):
    
        new_image = Image(
            user_id=user_id,
            image_name=image_name,
            image_path=image_path,
            generation_id=generation_id,
            prompt=prompt,
            created_at=datetime.utcnow())
        self.db.add(new_image)
        self.db.commit()
        self.db.refresh(new_image)

        return new_image

    # 🔹 Get Images of Logged In User
    def get_images_by_user(self, user_id: int):
        return (
            self.db.query(Image)
            .filter(Image.user_id == user_id)
            .order_by(Image.created_at.desc())
            .all()
        )

    # 🔹 Optional: Delete Image
    def delete_image(self, image_id: int, user_id: int):
        image = (
            self.db.query(Image)
            .filter(Image.id == image_id, Image.user_id == user_id)
            .first()
        )

        if image:
            self.db.delete(image)
            self.db.commit()
            return True

        return False
    
    def create_model_usage(self, user_id, model_name, model_provider, request_type, tokens_input=0, tokens_output=0, images_generated=0, credits_used=0.0, total_tokens =0.0,request_id=None, status="success"):

        usage = ModelUsage(
            user_id=user_id,
            model_name=model_name,
            model_provider=model_provider,
            request_type=request_type,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            total_tokens=total_tokens,
            images_generated=images_generated,
            credits_used=credits_used,
            request_id=request_id,
            status=status
        )

        self.db.add(usage)
        self.db.commit()
        self.db.refresh(usage)
        return usage
    
    def get_model_pricing(self, model_name):
        return self.db.query(ModelPricing).filter_by(model_name=model_name).first()
    
    def get_model_usage(self, user_id):
        return self.db.query(ModelUsage).filter_by(user_id=user_id).order_by(ModelUsage.created_at.desc()).all()
    def get_user_credits(self, user_id):
        credits = (
        self.db.query(
            func.sum(ModelUsage.tokens_input).label("tokens_input"),
            func.sum(ModelUsage.tokens_output).label("tokens_output"),
            func.sum(ModelUsage.total_tokens).label("total_tokens"),
            func.sum(ModelUsage.credits_used).label("credits_used"),
            func.sum(ModelUsage.images_generated).label("images_generated"),
        )
        .filter(ModelUsage.user_id == user_id)
        .first()
    )
        return dict(credits._mapping)
    
    def get_usage_current_request(self, user_id, request_id):
        usage = (
            self.db.query(
                func.sum(ModelUsage.tokens_input).label("tokens_input"),
                func.sum(ModelUsage.tokens_output).label("tokens_output"),
                func.sum(ModelUsage.total_tokens).label("total_tokens"),
                func.sum(ModelUsage.credits_used).label("credits_used"),
                func.sum(ModelUsage.images_generated).label("images_generated"),  
            )
            .filter_by(user_id=user_id, request_id=request_id)
            .first()
        )
        return dict(usage._mapping)
    
    def fill_missing_dates(data, days):
        today = datetime.utcnow().date()
        date_map = {item["date"]: item["count"] for item in data}

        full_data = []

        for i in range(days):
            d = today - timedelta(days=i)
            d_str = str(d)

            full_data.append({
                "date": d_str,
                "count": date_map.get(d_str, 0)
            })

        return list(reversed(full_data))



    def get_icons_data(self, range, user_id):
        days = 7 if range == "weekly" else 30
        start_date = datetime.utcnow() - timedelta(days=days)

        results = (
            self.db.query(
                func.date(ModelUsage.created_at).label("date"),
                func.sum(ModelUsage.images_generated).label("count")
            )
            .filter(
                ModelUsage.status == "success",
                ModelUsage.created_at >= start_date,
                ModelUsage.images_generated > 0,
                ModelUsage.user_id == user_id
            )
            .group_by(func.date(ModelUsage.created_at))
            .order_by(func.date(ModelUsage.created_at))
            .all()
        )
        data = [
            {
                "date": str(row.date),
                "count": int(row.count or 0)
            }
            for row in results
        ]

        return DatabaseHandler.fill_missing_dates(data, days)


    # -------------------------------
    # 🥧 Usage Split
    # -------------------------------
    def get_usage_split_data(self,user_id):
        results = (
            self.db.query(
                ModelUsage.request_type,
                func.count().label("value")
            )
            .filter(ModelUsage.status == "success", ModelUsage.user_id == user_id)
            .group_by(ModelUsage.request_type)
            .all()
        )

        return [
            {
                "name": row.request_type.replace("_", " ").title(),
                "value": row.value
            }
            for row in results
        ]


    # -------------------------------
    # 💰 Credits Usage
    # -------------------------------
    def get_credits_usage_data(self,user_id):
        results = (
            self.db.query(
                ModelUsage.request_type,
                func.sum(ModelUsage.credits_used).label("value")
            )
            .filter(ModelUsage.status == "success", ModelUsage.user_id == user_id)
            .group_by(ModelUsage.request_type)
            .all()
        )

        return [
            {
                "name": row.request_type.replace("_", " ").title(),
                "value": float(row.value or 0)
            }
            for row in results
        ]
    
    def get_usage_summary(self, user_id):
        usage = (
            self.db.query(
                func.sum(ModelUsage.tokens_input).label("tokens_input"),
                func.sum(ModelUsage.tokens_output).label("tokens_output"),
                func.sum(ModelUsage.total_tokens).label("total_tokens"),
                func.sum(ModelUsage.credits_used).label("credits_used"),
                func.sum(ModelUsage.images_generated).label("images_generated"),
            )
            .filter(ModelUsage.user_id == user_id)
            .first()
        )

        return [
            {
                "name": key,
                "value": float(value or 0)
            }
            for key, value in usage._mapping.items()
        ]