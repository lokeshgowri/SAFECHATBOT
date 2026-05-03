import os
import glob
import re

src_dir = r"c:\Users\nusiy\OneDrive\Documents\projects\SAFECHATBOT\frontend\src"
files = glob.glob(os.path.join(src_dir, "**", "*.js"), recursive=True)

for file in files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace the fetch URLs
    new_content = content.replace("'http://127.0.0.1:8000/", "`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/")
    new_content = new_content.replace("\"http://127.0.0.1:8000/", "`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/")
    
    # Clean up console.error, except where it might be caught
    new_content = re.sub(r'console\.error\([^)]*\);?', '', new_content)
    
    if content != new_content:
        with open(file, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated {file}")
