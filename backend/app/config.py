from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60000

    DATABASE_URL: str = "sqlite:///./igna_chat.db"
    CHROMA_PERSIST_DIR: str = "./chroma_data"

    # Azure OpenAI — only needed for chat (GPT-4). Embeddings run locally via sentence-transformers.
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_API_VERSION: str = "2024-02-01"
    AZURE_OPENAI_CHAT_DEPLOYMENT: str = "gpt-4"

    BACKEND_URL: str = "http://localhost:8000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
