import json

import logging

from typing import Any



from pydantic import ValidationError



from app.messaging.platform_transform import (

    is_platform_envelope,

    normalize_event_type,

    platform_envelope_to_canonical,

)

from app.models import CanonicalEvent, is_scored_event_type



logger = logging.getLogger(__name__)





def _unwrap_legacy_wrapper(raw: dict[str, Any]) -> dict[str, Any]:

    """Legacy casino/AFS wrappers — not the platform contract `data` payload."""

    for key in ("event", "payload", "body"):

        nested = raw.get(key)

        if isinstance(nested, dict):

            return nested

    return raw





def parse_canonical_event(body: bytes, routing_key: str = "") -> CanonicalEvent | None:

    """

    Parse a broker message into a CanonicalEvent.



    Supports:

    - PlatformEventEnvelope (casino-api-contract): event_id, event_type, occurred_at, version, data

    - Legacy flat CanonicalEvent JSON (POST /evaluate shape)

    - Wrapped legacy payloads: { "payload": { ... } }



    Returns None for non-scored platform events (consumer should ack and skip).

    Raises ValueError for malformed scored messages.

    """

    try:

        raw = json.loads(body.decode())

    except json.JSONDecodeError as exc:

        raise ValueError("invalid JSON") from exc



    if not isinstance(raw, dict):

        raise ValueError("message body must be a JSON object")



    if is_platform_envelope(raw):

        payload = platform_envelope_to_canonical(raw)

    else:

        payload = _unwrap_legacy_wrapper(raw)



    if not isinstance(payload, dict):

        raise ValueError("event payload must be a JSON object")



    event_type = payload.get("event_type") or routing_key.strip()

    if not event_type:

        logger.debug("Skipping message without event_type (routing_key=%s)", routing_key or "-")

        return None



    event_type = normalize_event_type(str(event_type))



    if not is_scored_event_type(event_type):

        logger.debug(

            "Skipping non-scored platform event '%s' (routing_key=%s)",

            event_type,

            routing_key or "-",

        )

        return None



    payload = {**payload, "event_type": event_type}



    try:

        return CanonicalEvent.model_validate(payload)

    except ValidationError as exc:

        raise ValueError(f"invalid risk event: {exc}") from exc


