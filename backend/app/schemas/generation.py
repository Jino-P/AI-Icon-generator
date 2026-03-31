from pydantic import BaseModel


class IconGenerateRequest(BaseModel):
    app_name: str
    description: str
    colours: str
    style: str
    keywords: str
    mood: str
    platform: str = "generic"
    website_url: str = None
    color_palette: str = None