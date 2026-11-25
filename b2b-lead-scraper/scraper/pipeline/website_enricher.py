import re
from typing import Any, Dict
import httpx

EMAIL_RE = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")


async def enrich_company_website(lead: Dict[str, Any], timeout: float = 8.0) -> Dict[str, Any]:
    """Check website availability and extract email, Telegram, and WhatsApp links."""
    website = (lead.get("website") or "").strip()
    if not website:
        return lead

    url = website if website.startswith("http") else f"https://{website}"
    try:
        async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code < 400:
                html = resp.text
                if not lead.get("email"):
                    match = EMAIL_RE.search(html)
                    if match:
                        lead["email"] = match.group(0)
                lead["telegram"] = "t.me/" in html
                lead["whatsapp"] = "wa.me/" in html or "api.whatsapp.com" in html
    except httpx.HTTPError:
        pass
    return lead
