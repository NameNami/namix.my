import os
import re

svgs = ['mysql.svg', 'dotnet.svg', 'micropython.svg', 'selenium.svg', 'telegram.svg', 'discord.svg', 'shopee.svg']
skill_dir = os.path.join('resources', 'skills')

for svg in svgs:
    path = os.path.join(skill_dir, svg)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the fill attribute to white
        new_content = re.sub(r'fill="[^"]+"', 'fill="#ffffff"', content)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {svg}")
    else:
        print(f"Not found: {svg}")
