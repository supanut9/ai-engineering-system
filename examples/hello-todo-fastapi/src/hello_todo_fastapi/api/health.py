"""Health check router."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
async def health() -> dict[str, str]:
    """Return service health status.

    Does not check storage health — the in-memory store is always available
    while the process is running.
    """
    return {"status": "ok"}
