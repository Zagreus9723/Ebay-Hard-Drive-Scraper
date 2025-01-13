import asyncio
import math
import json
import time
from typing import List, TypedDict, Literal
from urllib.parse import urlencode

import httpx
from parsel import Selector

# HTTPX session setup
session = httpx.AsyncClient(
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.35",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
    },
    http2=True,
    follow_redirects=True,
)


# TypedDict for product preview
class ProductPreviewResult(TypedDict):
    url: str
    title: str
    price: str
    shipping: str
    condition: str
    photo: str
    size: float  # Parsed disk size in TB
    price_per_tb: float  # Calculated price per TB


# Utility function to parse disk size
def parse_disk_size(title: str) -> float:
    """Extract disk size in TB from the product title."""
    import re

    match = re.search(r"(\d+(?:\.\d+)?)\s?(TB|GB)", title, re.IGNORECASE)
    if match:
        size = float(match.group(1))
        unit = match.group(2).upper()
        if unit == "GB":
            size /= 1024  # Convert GB to TB
        return size
    return 0.0  # Default to 0 if no size found


# Parse search results
def parse_search(response: httpx.Response) -> List[ProductPreviewResult]:
    previews = []
    sel = Selector(response.text)
    listing_boxes = sel.css(".srp-results li.s-item")

    for box in listing_boxes:
        css = lambda css: box.css(css).get("").strip()  # Helper for single value
        title = css(".s-item__title>span::text")

        # Parse relevant fields
        price = css(".s-item__price::text").replace("$", "").replace(",", "")
        price = float(price) if price else 0.0
        shipping = css(".s-item__shipping::text")
        try:
            shipping = float(shipping.replace("$", "").split()[0]) if shipping else 0.0
        except:
            shipping = 0.0
        condition = css(".s-item__subtitle .SECONDARY_INFO::text") or "Unknown"
        url = css("a.s-item__link::attr(href)").split("?")[0]
        photo = css(".s-item__image img::attr(src)")

        # Parse size and calculate price per TB
        size = parse_disk_size(title)
        price_per_tb = round(price / size, 2) if size > 0 else 0.0

        previews.append(
            {
                "url": url + '?mkcid=1&mkrid=711-53200-19255-0&siteid=0&customid=link&campid=5339096616&toolid=20001&mkevt=1',
                "title": title,
                "price": price,
                "shipping": shipping,
                "condition": condition,
                "photo": photo,
                "size": size,
                "price_per_tb": price_per_tb,
            }
        )

    return previews


# Sorting map
SORTING_MAP = {
    "best_match": 12,
    "ending_soonest": 1,
    "newly_listed": 10,
}


# Scraping function
async def scrape_search(
    query,
    max_pages=25,
    category=0,
    items_per_page=240,
    sort: Literal["best_match", "ending_soonest", "newly_listed"] = "newly_listed",
) -> List[ProductPreviewResult]:
    def make_request(page):
        return "https://www.ebay.com/sch/i.html?" + urlencode(
            {
                "_nkw": query,
                "_sacat": category,
                "_ipg": items_per_page,
                "_sop": SORTING_MAP[sort],
                "_pgn": page,
                "LH_BIN": 1,  # "Buy It Now" filter
            }
        )

    # Fetch the first page
    first_page = await session.get(make_request(page=1))
    results = parse_search(first_page)

    # Handle pagination
    total_results_text = Selector(first_page.text).css(".srp-controls__count-heading>span::text").get()
    total_results = int(total_results_text.replace(",", "").replace('+', '')) if total_results_text else 0
    total_pages = 25

    # Fetch additional pages concurrently
    other_pages = [session.get(make_request(page=i)) for i in range(2, total_pages + 1)]
    for response in asyncio.as_completed(other_pages):
        try:
            page_response = await response
            results.extend(parse_search(page_response))
            print(page_response.status_code)
        except Exception as e:
            print(f"Failed to scrape page: {e}")

    return results


# Save results to JSON file
def save_to_json(data: List[ProductPreviewResult], filename: str):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


# Example usage
async def main():
    query = "hard drive"
    while True:
        results = await scrape_search(query=query, max_pages=2)
        save_to_json(results, "data.json")
        print(f"Saved {len(results)} results to ebay_results.json")
        time.sleep(900)


# Run the scraper
if __name__ == "__main__":
    asyncio.run(main())
