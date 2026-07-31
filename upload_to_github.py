#!/usr/bin/env python3
"""
Automatic GitHub Repository Creator & File Uploader
----------------------------------------------------
Uploads the Buzzheavier project directly to GitHub using the GitHub REST API.
No git binary required!
"""

import os
import json
import base64
import urllib.request
import urllib.error

FILES_TO_UPLOAD = [
    'README.md',
    'buzzheavier.user.js',
    'userscript_gui_preview.html',
    'app.py',
    'buzzheavier.py',
    'buzzheavier.sh',
    'jdownloader_scraper.py',
    'extension/manifest.json',
    'extension/content.js',
    'extension/popup.html',
    'extension/popup.js'
]

def make_request(url, method='GET', data=None, token=None):
    headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Buzzheavier-Uploader'
    }
    if token:
        headers['Authorization'] = f'token {token}'
    
    encoded_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"❌ API Error ({e.code}): {error_body}")
        return None

def main():
    print("🚀 Buzzheavier 1-Click GitHub Uploader\n")
    token = input("Bitte gib deinen GitHub Personal Access Token (PAT) ein: ").strip()
    if not token:
        print("⚠️ Kein Token angegeben. Abbruch.")
        return

    repo_name = input("Repository Name (Standard: buzzheavier-tools): ").strip() or "buzzheavier-tools"

    # 1. Check user info
    user_info = make_request("https://api.github.com/user", token=token)
    if not user_info:
        print("❌ Ungültiger Token!")
        return

    username = user_info['login']
    print(f"✅ Angemeldet als GitHub-User: '{username}'")

    # 2. Create repo if not exists
    print(f"📦 Erstelle Repository '{repo_name}'...")
    create_data = {
        "name": repo_name,
        "description": "Buzzheavier Tools, Userscript Pro GUI & Link Extractor",
        "private": False,
        "auto_init": False
    }
    repo_info = make_request("https://api.github.com/user/repos", method="POST", data=create_data, token=token)
    if repo_info:
        print(f"✅ Repository erfolgreich auf GitHub erstellt: {repo_info['html_url']}")
    else:
        print("ℹ️ Repository existiert möglicherweise bereits. Fahre mit Datei-Upload fort...")

    # 3. Upload files
    for file_path in FILES_TO_UPLOAD:
        if not os.path.exists(file_path):
            continue

        with open(file_path, "rb") as f:
            content_bytes = f.read()

        b64_content = base64.b64encode(content_bytes).decode('utf-8')

        api_url = f"https://api.github.com/repos/{username}/{repo_name}/contents/{file_path}"
        
        # Check if file exists to get SHA
        existing = make_request(api_url, token=token)
        sha = existing['sha'] if existing and 'sha' in existing else None

        put_data = {
            "message": f"Add/Update {file_path}",
            "content": b64_content
        }
        if sha:
            put_data["sha"] = sha

        res = make_request(api_url, method="PUT", data=put_data, token=token)
        if res:
            print(f"  ✓ Hochgeladen: {file_path}")
        else:
            print(f"  ❌ Fehler beim Hochladen: {file_path}")

    raw_url = f"https://raw.githubusercontent.com/{username}/{repo_name}/main/buzzheavier.user.js"
    print("\n🎉 UPLOAD ERFOLGREICH ABGESCHLOSSEN!")
    print(f"🔗 Dein Repository: https://github.com/{username}/{repo_name}")
    print(f"⚡ 1-Click Install URL für Nutzer: {raw_url}")

if __name__ == "__main__":
    main()
