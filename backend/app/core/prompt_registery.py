import json
from pathlib import Path


class PromptRegistry:
    """
    Central registry for loading and retrieving system prompts.
    """

    def __init__(self, prompt_file: str):
        self.prompt_file = Path(prompt_file)
        self._prompts = self._load_prompts()

    def _load_prompts(self) -> dict:
        if not self.prompt_file.exists():
            raise FileNotFoundError(
                f"System prompt file not found: {self.prompt_file}"
            )

        with self.prompt_file.open("r", encoding="utf-8") as f:
            return json.load(f)

    def get_app_icon_prompt(self) -> str:
        try:
            return self._prompts["system_prompts"]["app_icon_prompt_generator"]["prompt"]
        except KeyError as e:
            raise KeyError(
                "app_icon_prompt_generator not found in system_prompts.json"
            ) from e

    def get_prompt(self, prompt_key: str) -> str:
        try:
            return self._prompts["system_prompts"][prompt_key]["prompt"]
        except KeyError as e:
            raise KeyError(
                f"Prompt '{prompt_key}' not found in system_prompts.json"
            ) from e
