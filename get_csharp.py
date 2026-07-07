import urllib.request
import re
import os

url = 'https://cdn.simpleicons.org/csharp'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    data = urllib.request.urlopen(req).read().decode('utf-8')
    data = re.sub(r'fill="[^"]+"', 'fill="#ffffff"', data)
    out_path = os.path.join('resources', 'skills', 'csharp.svg')
    with open(out_path, 'w') as f:
        f.write(data)
    print("Downloaded and recolored csharp.svg")
except Exception as e:
    print(f"Error: {e}")
