from typing import Any, Dict, List


def compute_stockout_report(product: Dict[str, Any], target_cover_days: int = 21) -> Dict[str, Any]:
    """Calculate days until stockout per warehouse and recommended restock volume."""
    warehouses: List[Dict[str, Any]] = product.get("warehouses", [])
    total_qty = sum(int(w.get("qty", 0)) for w in warehouses)
    daily_total = sum(int(w.get("daily_sales", 0)) for w in warehouses)
    days_left = total_qty // daily_total if daily_total > 0 else 99

    critical_warehouses = []
    recommended_batch = 0
    for wh in warehouses:
        qty = int(wh.get("qty", 0))
        daily = int(wh.get("daily_sales", 0))
        wh_days = qty // daily if daily > 0 else 99
        if wh_days < 7:
            critical_warehouses.append({"name": wh["name"], "qty": qty, "days_left": wh_days})
        if wh_days < 14:
            recommended_batch += max(0, daily * target_cover_days - qty)

    return {
        "sku": product.get("sku"),
        "total_qty": total_qty,
        "days_left": days_left,
        "critical_warehouses": critical_warehouses,
        "recommended_batch": recommended_batch,
    }
