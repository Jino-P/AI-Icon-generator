import requests
import io
import time
from pathlib import Path
from PIL import Image

BASE_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = BASE_DIR / "generated_images"


class HuggingFaceImageClient:
    """
    Client for generating images using Hugging Face Inference Router API.
    """

    def __init__(
        self,
        api_token: str,
        model_id: str ,
        output_filename: str ,
        output_dir: str | Path = OUTPUT_DIR,
        retry_delay: int = 20 ,        
    ):
        if not api_token:
            raise ValueError("Hugging Face API token is required")

        self.api_token = api_token
        self.model_id = model_id
        self.output_filename = output_filename
        self.retry_delay = retry_delay
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.api_url = (
            f"https://router.huggingface.co/hf-inference/models/{self.model_id}"
        )

        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }

    def generate_image(
        self,
        prompt: str,
        show_image: bool = True
    ) -> Path:
        """
        Generate an image from a text prompt.
        """

        print("🚀 Routing request to Hugging Face Free Tier...")

        payload = {"inputs": prompt}
        response = requests.post(self.api_url, headers=self.headers, json=payload)

        if response.status_code in (503, 504):
            print("Model busy or timed out, retrying...")
            time.sleep(20)
            return self.generate_image(prompt)

        # Model warm-up handling
        if response.status_code == 503:
            print(f"⏳ Model is warming up... retrying in {self.retry_delay} seconds.")
            time.sleep(self.retry_delay)
            return self.generate_image(prompt, f"{self.output_filename}.png", show_image)

        # Success
        if response.status_code == 200:
            image = Image.open(io.BytesIO(response.content))

            output_path = self.output_dir / f"{self.output_filename}.png"
            image.save(output_path)

            print(f"✅ Success! Image saved as {output_path}")

            # if show_image:
            #     image.show()

            return output_path

        # Failure
        raise RuntimeError(
            f"Hugging Face API error {response.status_code}: {response.text}"
        )
