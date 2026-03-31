import re
import json
import uuid
import os
import logging
from sqlalchemy.orm import Session
from pathlib import Path

from app.database.models import Image
from app.database.database_handler import DatabaseHandler
from app.services.file_service import FileService
from app.core.prompt_registery import PromptRegistry
from app.integrations.groq_client import GroqClient
from app.integrations.huggingface_client import HuggingFaceImageClient
from app.services.web_color_extractor import WebsiteColorExtractor
from app.integrations.cloudinary_client import CloudinaryClient
from app.core.config import GROQ_API_KEY, HUGGINGFACE_API_KEY, HUGGINGFACE_BASE_URL,BACKEND_URL


BASE_DIR = Path(__file__).resolve().parent.parent  # points to app/
PROMPT_PATH = BASE_DIR / "core" / "system_prompts.json"
logger = logging.getLogger(__name__)
class IconGenerationService:

    def __init__(self, db: Session):
        self.db = db
        self.db_handler = DatabaseHandler(db)

        self.prompt_registry = PromptRegistry(str(PROMPT_PATH))

        self.groq_api_key = GROQ_API_KEY
        self.hf_api_key = HUGGINGFACE_API_KEY

        if not self.groq_api_key:
            logger.error("GROQ_API_KEY not found")
            raise ValueError("GROQ_API_KEY not found")

        if not self.hf_api_key:
            logger.error("HUGGINGFACE_API_KEY not found")
            raise ValueError("HUGGINGFACE_API_KEY not found")

    # ---------------- PROMPT GENERATION ----------------
    def _generate_prompts(self, data, user_id, request_id):

        def build_requirements():
            base = (
                f"app name = {data.app_name}, "
                f"description = {data.description}, "
                f"colours = {data.colours}, "
                f"platform = {data.platform}, "
                f"style = {data.style}, "
                f"keywords = {data.keywords}, "
                f"mood = {data.mood}"
            )

            if data.website_url or data.color_palette:
                brand_context = ""

                if data.website_url:
                    extractor = WebsiteColorExtractor(data.website_url)
                    colors = extractor.extract_colors()
                    brand_context += f"Inspired by {data.website_url}. Colors: {colors}. "

                if data.color_palette:
                    brand_context += f"Palette: {data.color_palette}"
                    logger.info(f"Using custom color palette: {data.color_palette}")

                return base + f", brand context = {brand_context}"

            return base

        requirements = build_requirements()

        # -------- Intent Detection --------
        logger.info(f"Detecting intent for requirements: {requirements}")
        intent_prompt = self.prompt_registry.get_prompt("intent_detection_prompt")
        logger.debug(f"Using intent detection prompt: {intent_prompt}")
        logger.info("Sending request to GROQ for intent detection")
        client = GroqClient(
            api_key=self.groq_api_key,
            system_prompt=intent_prompt
        )

        response1 = client.get_ai_response(requirements)
        logger.info(f"GROQ intent detection response: {response1['content']}")

        self.db_handler.create_model_usage(
            user_id=user_id,
            request_id=request_id,
            model_name="llama 3.3",
            model_provider="groq",
            request_type="intent_detection",
            tokens_input=response1["input_tokens"],
            tokens_output=response1["output_tokens"],
            total_tokens=response1["total_tokens"],
        )
        logger.info(f"Recorded intent detection usage: input tokens= {response1['input_tokens']}, output tokens={response1['output_tokens']}")
        intent = response1["content"].strip()

        # -------- Prompt Generation --------
        system_prompt = self.prompt_registry.get_prompt(intent)
        logger.info(f"Generating prompts with intent: {intent}")
        logger.debug(f"Using prompt: {system_prompt}")
        client = GroqClient(
            api_key=self.groq_api_key,
            system_prompt=system_prompt
        )

        response2 = client.get_ai_response(requirements)
        logger.info(f"GROQ prompt generation response: tokens used={response2['total_tokens']}")
        pricing = self.db_handler.get_model_pricing("llama3.3")

        cost = (
            pricing.input_cost_per_1k_tokens * (response2["input_tokens"] / 1000)
            + pricing.output_cost_per_1k_tokens * (response2["output_tokens"] / 1000)
        )

        self.db_handler.create_model_usage(
            user_id=user_id,
            request_id=request_id,
            model_name="llama 3.3",
            model_provider="groq",
            request_type="prompt_generation",
            tokens_input=response2["input_tokens"],
            tokens_output=response2["output_tokens"],
            total_tokens=response2["total_tokens"],
            credits_used=cost
        )
        logger.info(f"Recorded prompt generation usage: input tokens={response2['input_tokens']}, output tokens={response2['output_tokens']}, credits used={cost:.6f}")
        return response2["content"]

    # ---------------- IMAGE GENERATION ----------------
    def _generate_image(self, prompt, filename):
        logger.info(f"Generating image with prompt: {prompt}")
        client = HuggingFaceImageClient(
            api_token=self.hf_api_key,
            model_id="black-forest-labs/FLUX.1-schnell",
            output_filename=filename
        )

        output_path = client.generate_image(prompt=prompt)
        logger.info(f"Image generated at path: {output_path}")
        cloudinary_client = CloudinaryClient()
        secure_url = cloudinary_client.upload(file_path=output_path,file_name=filename)
        logger.info(f"Cloudinary secured url {secure_url}")
        if not output_path or not os.path.exists(output_path):
            raise RuntimeError("Image generation failed")
        else:
            os.remove(output_path)
        # return output_path
        return secure_url

    # ---------------- MAIN FLOW ----------------
    def generate_icons(self, data, current_user):

        try:
            generation_id = str(uuid.uuid4())

            # -------- PROMPTS --------
            raw_prompts = self._generate_prompts(
                data,
                current_user.id,
                generation_id
            )

            # Clean + safe JSON parsing
            cleaned = re.sub(r"```json|```", "", raw_prompts).strip()
            match = re.search(r'\{.*\}', cleaned, re.DOTALL)

            if not match:
                raise ValueError("Invalid prompt format from LLM")

            json_prompt = json.loads(match.group())

            created_images = []

            # -------- IMAGE GENERATION --------
            for icon in json_prompt.get("icons", []):
                filename = icon["icon_name"]

                img_url = self._generate_image(icon["prompt"], filename)

                new_image = Image(
                    user_id=current_user.id,
                    image_name=filename,
                    # image_path=f"/generated_images/{filename}.png",
                    image_path = img_url,
                    generation_id=generation_id,
                    prompt=data.app_name,
                    version=1,
                    parent_image_id=None,
                    is_deleted=False
                )

                self.db.add(new_image)
                created_images.append(new_image)

            self.db.commit()

            # -------- FETCH --------
            images = self.db.query(Image).filter(
                Image.generation_id == generation_id,
                Image.is_deleted == False
            ).all()

            # -------- CREDITS --------
            pricing = self.db_handler.get_model_pricing("black-forest-labs/FLUX.1")
            total_credits = pricing.cost_per_image * len(images)

            self.db_handler.create_model_usage(
                user_id=current_user.id,
                request_id=generation_id,
                model_name="black-forest-labs/FLUX.1",
                model_provider="huggingface",
                request_type="image_generation",
                images_generated=len(images),
                credits_used=total_credits
            )

            credits_used = self.db_handler.get_usage_current_request(
                user_id=current_user.id,
                request_id=generation_id
            )

            return {
                "generation_id": generation_id,
                "credits_used": credits_used,
                "images": [
                    {
                        "id": img.id,
                        # "image_url": f"{BACKEND_URL}/images/{img.image_name}.png",
                        "image_url":img.image_path,
                        "name": img.image_name,
                        "version": img.version
                    }
                    for img in images
                ]
            }

        except Exception as e:
            logger.error(f"Error occurred while generating icons: {str(e)}")
            raise