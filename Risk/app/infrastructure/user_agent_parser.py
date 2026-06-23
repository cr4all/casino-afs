from dataclasses import dataclass

from ua_parser import user_agent_parser

from app.runtime_config import get_runtime_config


@dataclass
class ParsedUserAgent:
    browser_family: str | None = None
    os_family: str | None = None
    device_family: str | None = None
    device_brand: str | None = None
    is_mobile: bool = False
    is_tablet: bool = False
    is_emulator: bool = False
    is_bot: bool = False


def parse_user_agent(user_agent: str | None) -> ParsedUserAgent:
    if not user_agent or not user_agent.strip():
        return ParsedUserAgent()

    parsed = user_agent_parser.Parse(user_agent)
    ua_family = (parsed.get("user_agent") or {}).get("family") or ""
    os_family = (parsed.get("os") or {}).get("family") or ""
    device = parsed.get("device") or {}
    device_family = device.get("family") or ""
    device_brand = device.get("brand") or ""

    lowered = user_agent.lower()
    is_emulator = any(token in lowered for token in get_runtime_config().list_set("emulator_ua_tokens"))
    is_bot = ua_family.lower() in {"other", "spider", "crawler"} or "bot" in ua_family.lower()

    mobile_markers = ("mobile", "iphone", "android")
    is_mobile = any(marker in lowered for marker in mobile_markers) or "mobile" in device_family.lower()
    is_tablet = "ipad" in lowered or "tablet" in lowered

    return ParsedUserAgent(
        browser_family=ua_family or None,
        os_family=os_family or None,
        device_family=device_family or None,
        device_brand=device_brand or None,
        is_mobile=is_mobile,
        is_tablet=is_tablet,
        is_emulator=is_emulator,
        is_bot=is_bot,
    )
