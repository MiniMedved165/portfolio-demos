import argparse
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

from collectors.twogis_client import TwoGisClient
from collectors.ymaps_collector import YandexMapsCollector
from pipeline.deduplicator import deduplicate_leads
from pipeline.exporters import export_csv_utf8_bom, export_json, push_to_crm_webhook
from pipeline.website_enricher import enrich_company_website


async def run_pipeline(city: str, rubric: str, sources: str, output: Path) -> None:
    """Execute full B2B geo-scraping pipeline: collect -> dedup -> enrich -> export."""
    load_dotenv()
    dgis_key = os.getenv("DGIS_API_KEY", "")
    proxy_url = os.getenv("PROXY_URL") or None
    crm_webhook = os.getenv("CRM_WEBHOOK_URL", "")

    raw_leads = []
    source_set = {s.strip().lower() for s in sources.split(",")}

    if "2gis" in source_set and dgis_key:
        raw_leads.extend(await TwoGisClient(dgis_key).fetch_rubric(city, rubric))
    if "ymaps" in source_set:
        raw_leads.extend(await YandexMapsCollector(proxy_url).collect(city, rubric))

    clean_leads, removed = deduplicate_leads(raw_leads)
    enriched = await asyncio.gather(*(enrich_company_website(item) for item in clean_leads))

    if output.suffix.lower() == ".json":
        export_json(list(enriched), output)
    else:
        export_csv_utf8_bom(list(enriched), output)

    if crm_webhook and enriched:
        await push_to_crm_webhook(list(enriched), crm_webhook)

    print(f"Collected: {len(enriched)} companies (duplicates removed: {removed}) -> {output}")


def main() -> None:
    parser = argparse.ArgumentParser(description="GEOLEAD B2B Geo-Scraper CLI")
    parser.add_argument("--city", default="Москва")
    parser.add_argument("--rubric", default="Кофейни и пекарни")
    parser.add_argument("--sources", default="2gis,ymaps")
    parser.add_argument("--output", default="output/leads.csv")
    args = parser.parse_args()

    asyncio.run(run_pipeline(args.city, args.rubric, args.sources, Path(args.output)))


if __name__ == "__main__":
    main()
