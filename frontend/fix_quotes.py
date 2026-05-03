import os
import glob
import re

src_dir = r"c:\Users\nusiy\OneDrive\Documents\projects\SAFECHATBOT\frontend\src"
files = glob.glob(os.path.join(src_dir, "**", "*.js"), recursive=True)

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Fix the trailing single quote or double quote after our replaced string
    # We replaced 'http... with `${process.env...
    # So now it looks like: `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/path/to/endpoint'
    # We want to change the trailing ' or " to a `
    
    # regex: \$\{process\.env\.REACT_APP_API_URL \|\| 'http://127\.0\.0\.1:8000'\}(.*?)['"]
    pattern = r"(\$\{process\.env\.REACT_APP_API_URL \|\| 'http://127\.0\.0\.1:8000'\}.*?)['\"]"
    
    # The replacement should be the matched group 1 followed by a backtick
    new_content = re.sub(pattern, r"\1`", content)
    
    if content != new_content:
        with open(file, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed quotes in {file}")
