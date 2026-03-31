import replicate
from typing import BinaryIO


class ReplicateImageGenerator:

    def __init__(self):
        self.client = replicate.Client()
        self.model = "black-forest-labs/flux-2-dev"
    
    def generate_image(self, file_url: str, prompt: str, aspect_ratio: str = "match_input_image", output_format: str = "png"):
        
        output = self.client.run(
            self.model,
            input={
                "prompt": prompt,
                "aspect_ratio": aspect_ratio,
                "input_images": [file_url],
                "output_format": output_format
            }
        )
        return output
    
    def upload_file(self, file_path: str) -> str:
        with open(file_path, "rb") as f:
            uploaded_file = self.client.files.create(file=f)
        return uploaded_file.urls["get"]


# Example usage (kept for reference)
if __name__ == "__main__":
    file_path = r"C:\Users\ERS1327\Downloads\edited-image (3).png"
    
    # Initialize the generator
    generator = ReplicateImageGenerator()
    
    # Upload file and get URL
    file_url = generator.upload_file(file_path)
    
    # Generate image with custom prompt
    output = generator.generate_image(
        file_url=file_url,
        prompt="change the colour of this image to green and orange, and make it a flat minimal app icon, vector style"
    )
    
    # Save the output
    with open(r"C:\Users\ERS1327\Downloads\changed.png", "wb") as f:
        f.write(output.read())
    
    print("Image saved successfully ✅")