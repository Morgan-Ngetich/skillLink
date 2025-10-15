import re
import requests
from functools import lru_cache
from app.core.config import settings

CLEARBIT_BASE_URL = "https://logo.clearbit.com/"
LOGODEV_BASE_URL = "https://logo.dev/api/v1/logo/"


@lru_cache(maxsize=1024)
def fetch_logo_url(organization: str) -> str:
    """
    Try to get a logo URL for a given institution or company name.
    1. Attempt to construct a domain and use Clearbit
    2. Fallback to LogoDev API
    """

    if not organization:
        return None

    cleaned = re.sub(r"[^a-zA-Z0-9]", "", organization).lower()

    # Domains to test
    test_domains = [
        f"{cleaned}.com",
        f"{cleaned}.org",
        f"{cleaned}.edu",
        f"{cleaned}.io",
        f"{cleaned}.co",
        f"{cleaned}.net",
        f"{cleaned}.ac.ke",
        f"{cleaned}.ac.uk",
        f"{cleaned}.co.uk",
        f"{cleaned}.ac.ke",
    ]

    for domain in test_domains:
        clearbit_url = f"{CLEARBIT_BASE_URL}{domain}"
        try:
            response = requests.head(clearbit_url, timeout=2)
            if response.status_code == 200:
                return clearbit_url
        except requests.RequestException:
            continue

    return f"{LOGODEV_BASE_URL}{organization}?token={settings.LOGODEV_PUBLIC_TOKEN}"


def enrich_with_logos(data: dict) -> dict:
    """
    Add logo URLs to education and experience entries if missing.
    """
    if "education" in data and data["education"]:
        for edu in data["education"]:
            if not edu.get("logo") and edu.get("institution"):
                edu["logo"] = fetch_logo_url(edu["institution"])
                
    if "experience" in data and data["experience"]:
        for exp in data["experience"]:
            if not exp.get("logo") and exp.get("company"):
                exp["logo"] = fetch_logo_url(exp["company"])
    
    return data

