"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Service configuration.

    All fields can be overridden via environment variables of the same name
    (case-insensitive).  A ``.env`` file in the project root is loaded
    automatically when present.

    Example::

        PORT=9090 LOG_LEVEL=DEBUG uvicorn hello_todo_fastapi.main:app
    """

    port: int = 8000
    log_level: str = "INFO"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
