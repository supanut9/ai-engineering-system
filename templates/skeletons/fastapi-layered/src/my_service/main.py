"""FastAPI application factory."""

from fastapi import FastAPI

from my_service.api.health import router as health_router

app = FastAPI(title="my-service")

app.include_router(health_router)
