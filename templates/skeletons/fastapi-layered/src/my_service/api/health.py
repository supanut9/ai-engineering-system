"""Health check router."""

from fastapi import APIRouter

from my_service.services.health import get_health_status

router = APIRouter()


@router.get("/healthz")
async def health() -> dict[str, str]:
    """Return service health status."""
    return {"status": get_health_status()}
