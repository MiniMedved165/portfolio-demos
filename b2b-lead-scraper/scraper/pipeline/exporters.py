import csv
import json
from pathlib import Path
from typing import Any, Dict, List
import httpx


def safe_csv_cell(value: Any) -> str:
    """Neutralize Excel Formula Injection (=, +, -, @) before CSV serialization."""
    text = str(value if value is not None else "").replace("\r", " ").replace("\n", " ")
    if text.startswith(("=", "+", "-", "@")):
        text = "'" + text
    return text


def export_csv_utf8_bom(leads: List[Dict[str, Any]], output_path: Path) -> None:
    """Write leads to a semicolon-delimited UTF-8 BOM CSV file for Excel."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ["name", "city", "rubric", "address", "phone", "website", "email", "rating", "sources"]
    with output_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        for lead in leads:
            writer.writerow({k: safe_csv_cell(lead.get(k, "")) for k in fieldnames})


def export_json(leads: List[Dict[str, Any]], output_path: Path) -> None:
    """Write leads to formatted JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(leads, ensure_ascii=False, indent=2), encoding="utf-8")


async def push_to_crm_webhook(leads: List[Dict[str, Any]], webhook_url: str) -> int:
    """Send collected lead batch to AmoCRM / Bitrix24 webhook endpoint."""
    if not webhook_url:
        return 0
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(webhook_url, json={"leads": leads, "count": len(leads)})
        return resp.status_code
