import asyncio
import json
import time
from urllib.parse import urlencode
from typing import List
import re

import httpx
from parsel import Selector
from tqdm.asyncio import tqdm_asyncio

# HTTPX session setup
session = httpx.AsyncClient(
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.35",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
    },
    http2=True,
    follow_redirects=True,
)

# Utility function to parse disk size
def parse_disk_size(title: str) -> float:
    """Extract disk size in TB from the product title."""
    match = re.search(r"(?<!\w)(\d+(?:\.\d+)?)\s?(TB|GB)(?!\w)", title, re.IGNORECASE)
    if match:
        size = float(match.group(1))
        unit = match.group(2).upper()
        if unit == "GB":
            size /= 1024  # Convert GB to TB
        return size
    return 0.0  # Default to 0 if no size found

# Parse currency and value
def parse_currency(value: str):
    """Extract the numeric value and currency symbol."""
    match = re.search(r"([^\d\s.,]+)?\s*([\d,.]+)", value.strip())
    if match:
        currency = match.group(1) or ""
        numeric = float(match.group(2).replace(",", "").replace(".", ".", 1))
        return numeric, currency.strip()
    return 0.0, ""

# Parse search results
def parse_search(response: httpx.Response) -> List[dict]:
    previews = []
    sel = Selector(response.text)
    listing_boxes = sel.css(".srp-results li.s-item")

    for box in listing_boxes:
        css = lambda css: box.css(css).get("").strip()  # Helper for single value
        title = css(".s-item__title>span::text")

        try:
            price_text = css(".s-item__price::text")
            price, currency = parse_currency(price_text)

            shipping_text = css(".s-item__shipping::text")
            shipping, _ = parse_currency(shipping_text) if shipping_text else (0.0, currency)

            condition = css(".s-item__subtitle .SECONDARY_INFO::text") or "Unknown"
            url = css("a.s-item__link::attr(href)").split("?")[0]
            photo = css(".s-item__image img::attr(src)")

            size = parse_disk_size(title)
            price_per_tb = round((price + shipping) / size, 2) if size > 0 else 0.0

            interface = "Unknown"
            if "sas" in title.lower():
                interface = "SAS"
            if " sata " in title.lower():
                interface = "SATA"

            sizeIn = "Unknown"
            title = title.replace(',', '.')
            if ('3.5"' in title.lower()) or ("3.5'" in title.lower()) or ("3.5in" in title.lower()) or (
                    "3.5 inch" in title.lower()) or ("3.5-inch" in title.lower()) or (' 3.5 ' in title.lower()) or (
                    '3.5”' in title.lower()) or ('3.5 ' in title.lower()) or ('3.5 ' in title.lower()):
                sizeIn = '3.5"'

            if ('2.5"' in title.lower()) or ("2.5'" in title.lower()) or ("2.5in" in title.lower()) or (
                    "2.5 inch" in title.lower()) or ("2.5-inch" in title.lower()) or (' 2.5 ' in title.lower()) or (
                    '2.5”' in title.lower()) or ('2.5 ' in title.lower()) or ('2.5 ' in title.lower()):
                sizeIn = '2.5"'

            if price > 0 and size > 0:
                previews.append(
                    {
                        "url": url,
                        "title": title,
                        "price": price,
                        "currency": currency,
                        "shipping": shipping,
                        "condition": condition,
                        "photo": photo,
                        "size": size,
                        "physicalSize": sizeIn,
                        "interface": interface,
                        "price_per_tb": price_per_tb,
                    }
                )
        except Exception as e:
            print(f"Error parsing item: {e}")

    return previews

# Scraping function
async def scrape_site(url: str, term: str, max_pages=25) -> List[dict]:
    def make_request(page):
        return f"{url}/sch/i.html?" + urlencode(
            {
                "_nkw": term,
                "_ipg": 240,
                "_sop": 10,  # Sort by newly listed
                "_pgn": page,
                "LH_BIN": 1,  # "Buy It Now" filter
                "LH_PrefLoc": 1
            }
        )

    results = []

    # Use tqdm for a progress bar
    with tqdm_asyncio(total=max_pages, desc="Scraping Pages", unit="page") as progress_bar:
        for page in range(1, max_pages + 1):
            try:
                response = await session.get(make_request(page))
                results.extend(parse_search(response))
            except Exception as e:
                print(f"Error fetching results from {url} page {page}: {e}")
            finally:
                progress_bar.update(1)  # Increment the progress bar
    time.sleep(1)
    return results

# Main function to scrape all sites and save separate files
async def scrape_all_sites(json_file: str):
    with open(json_file, "r", encoding="utf-8") as f:
        sites = json.load(f)["sites"]
    while True:
        country = "United States"
        print(f"Scraping {country} (https://ebay.com) with term 'hard drive'...")
        time.sleep(1)
        results = await scrape_site(url="https://ebay.com", term="hard drive")

        # Save results to a separate file for each country
        output_file = f"static/json_data/United States.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4)

        print(f"Saved {len(results)} results to {output_file}.")
        time.sleep(900)

# Run the scraper
if __name__ == "__main__":
    # Run the scraper
    asyncio.run(scrape_all_sites("sites.json"))
