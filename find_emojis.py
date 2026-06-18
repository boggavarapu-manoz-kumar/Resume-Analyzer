import os
import re

emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]')

for root, dirs, files in os.walk('frontend'):
    for f in files:
        if f.endswith(('.js', '.jsx', '.css')):
            path = os.path.join(root, f)
            with open(path, 'r', errors='ignore') as file:
                for i, line in enumerate(file):
                    if emoji_pattern.search(line):
                        print(f"{path}:{i+1}: {line.strip()}")
