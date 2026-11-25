import re
from typing import Any, Dict, List, Tuple


def normalize_phone(raw_phone: str) -> str:
    """Normalize Russian phone numbers to canonical 7XXXXXXXXXX form for dedup."""
    digits = re.sub(r"\D", "", raw_phone or "")
    if len(digits) == 11 and digits.startswith("8"):
        digits = "7" + digits[1:]
    return digits


def deduplicate_leads(records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], int]:
    """Merge duplicate organization cards across 2GIS and Yandex Maps."""
    merged: Dict[str, Dict[str, Any]] = {}
    duplicates = 0

    for rec in records:
        phone_key = normalize_phone(rec.get("phone", ""))
        name_addr_key = f"{rec.get('name', '').strip().lower()}|{rec.get('address', '').strip().lower()}"
        key = phone_key or name_addr_key

        if key not in merged:
            entry = dict(rec)
            entry["sources"] = [rec.get("source", "2ГИС")]
            merged[key] = entry
        else:
            duplicates += 1
            existing = merged[key]
            src = rec.get("source")
            if src and src not in existing["sources"]:
                existing["sources"].append(src)
            if not existing.get("website") and rec.get("website"):
                existing["website"] = rec["website"]
            if not existing.get("email") and rec.get("email"):
                existing["email"] = rec["email"]
            existing["rating"] = max(float(existing.get("rating") or 0), float(rec.get("rating") or 0))

    return list(merged.values()), duplicates
