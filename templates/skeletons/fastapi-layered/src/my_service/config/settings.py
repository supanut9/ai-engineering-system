"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Service configuration.

    All fields can be overridden via environment variables of the same name
    (case-insensitive). A `.env` file in the project root is loaded
    automatically when present.
    """

    port: int = 8000
    env: str = "development"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
