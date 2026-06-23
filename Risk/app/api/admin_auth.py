import secrets

from fastapi import Header, HTTPException, status

from app.settings import settings


def _extract_admin_key(
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
    authorization: str | None = Header(default=None),
) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    if x_admin_key:
        return x_admin_key.strip()
    return None


def require_admin_key(
    x_admin_key: str | None = Header(default=None, alias="X-Admin-Key"),
    authorization: str | None = Header(default=None),
) -> str:
    configured = settings.admin_api_key.strip()
    if not configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin API is disabled. Set ADMIN_API_KEY in the environment.",
        )

    provided = _extract_admin_key(x_admin_key, authorization)
    if not provided or not secrets.compare_digest(provided, configured):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin API key.",
        )
    return provided
