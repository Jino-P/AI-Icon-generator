from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime, Float, func
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_verified = Column(Integer, default=0)  # 0 = False, 1 = True
    email_verification_token = Column(String, nullable=True)
    token_expiry = Column(DateTime, nullable=True)
    
    images = relationship("Image", back_populates="owner")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    image_name = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    prompt = Column(String)
    generation_id = Column(String, index=True)
    is_deleted = Column(Boolean, default=False)
    parent_image_id = Column(Integer, nullable=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="images")


class ModelUsage(Base):
    __tablename__ = "model_usage"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=True)  
    model_name = Column(String, nullable=False)  
    model_provider = Column(String)  
    request_type = Column(String)  
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    credits_used = Column(Float, default=0.0)
    images_generated = Column(Integer, default=0)
    request_id = Column(String)
    status = Column(String, default="success")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserCredits(Base):

    __tablename__ = "user_credits"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, unique=True)
    total_credits = Column(Float, default=0)
    used_credits = Column(Float, default=0)
    remaining_credits = Column(Float, default=0)

# class ModelPricing(Base):

#     __tablename__ = "model_pricing"

#     id = Column(Integer, primary_key=True)
#     model_name = Column(String, unique=True)
#     cost_per_1k_tokens = Column(Float, default=0)
#     cost_per_image = Column(Float, default=0)

class ModelPricing(Base):

    __tablename__ = "model_pricing"

    id = Column(Integer, primary_key=True)
    model_name = Column(String, unique=True)
    input_cost_per_1k_tokens = Column(Float, default=0)
    output_cost_per_1k_tokens = Column(Float, default=0)
    cost_per_image = Column(Float, default=0)