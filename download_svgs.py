import urllib.request
import os
import sys

def download_svg(query, filename):
    url = f"https://cdn.simpleicons.org/{query}"
    out_path = os.path.join("resources", "skills", f"{filename}.svg")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        svg_data = urllib.request.urlopen(req).read()
        with open(out_path, 'wb') as f:
            f.write(svg_data)
        print(f"Downloaded {filename}.svg from {url}")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

skills = {
    "mysql": "mysql",
    "dotnet": "dotnet",
    "micropython": "micropython",
    "selenium": "selenium",
    "automation": "automation",
    "api": "api",
    "telegram": "telegram",
    "discord": "discord",
    "webscraping": "web-scraping",
    "shopee": "shopee"
}

os.makedirs(os.path.join("resources", "skills"), exist_ok=True)

for query, filename in skills.items():
    success = download_svg(query, filename)

print("Finished downloading SVGs.")
