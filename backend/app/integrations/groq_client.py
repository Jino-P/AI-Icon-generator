import os
from groq import Groq
from pathlib import Path
from app.core.config import GROQ_API_KEY, GROQ_BASE_URL


class GroqClient:

    DEFAULT_MODELS = {
        "llama3.3": "llama-3.3-70b-versatile",
        "llama4": "meta-llama/llama-4-scout-17b-16e-instruct"
    }

    def __init__(self, api_key: str | None = None, system_prompt: str | None = None):

        self.api_key = api_key or GROQ_API_KEY
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment variables")
        self.system_prompt = system_prompt
        self.base_url = GROQ_BASE_URL
        self.client = Groq(api_key=self.api_key, base_url=self.base_url)

    def get_ai_response(
        self,
        user_prompt: str,
        model_type: str = "llama3.3",
        temperature: float = 0.7,
        max_tokens: int = 1024
    ) -> str:
        """
        Generate a response from Groq LLM.
        """

        if model_type not in self.DEFAULT_MODELS:
            raise ValueError(f"Unsupported model type: {model_type}")

        completion = self.client.chat.completions.create(
            model=self.DEFAULT_MODELS[model_type],
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature,
            max_tokens=max_tokens,
            stream=False
        )
        content = completion.choices[0].message.content
        usage = completion.usage

        return {
            "content": content,
            "input_tokens": usage.prompt_tokens,
            "output_tokens": usage.completion_tokens,
            "total_tokens": usage.total_tokens
        }