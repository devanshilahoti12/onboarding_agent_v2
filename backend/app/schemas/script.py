from pydantic import BaseModel


class ScriptResponse(BaseModel):
    script_content: str
    filename: str
    site_identifier: str
    api_key: str
    kb_identifier: str
    pages_indexed: int
    website_url: str
