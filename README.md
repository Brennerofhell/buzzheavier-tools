# 🚀 Buzzheavier Tools & Control Center

[![Tampermonkey 1-Click Install](https://img.shields.io/badge/Tampermonkey-1--Click%20Install-brightgreen?style=for-the-badge&logo=tampermonkey&logoColor=white)](buzzheavier.user.js)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-v3.0.0-purple.svg?style=for-the-badge)](buzzheavier.user.js)

CLI tools, Web GUI, Chrome Extension & Tampermonkey Userscript to upload, download and extract links from [Buzzheavier](https://buzzheavier.com).

---

## ⚡ 1-Click Userscript Installation (Tampermonkey / Violentmonkey)

Click the green badge below to install the standalone **Userscript Pro GUI** with a single click:

👉 **[⚡ Klick hier für 1-Klick Installation (Tampermonkey / Violentmonkey)](buzzheavier.user.js)**

*(Wenn du GitHub aufrufst, nutze diesen Raw-Link: `https://raw.githubusercontent.com/Brennerofhell/buzzheavier-tools/main/buzzheavier.user.js`)*

---

## 🎨 Userscript Pro GUI Features (`buzzheavier.user.js`)

A 100% standalone, modern glassmorphic Control Center UI overlay injected directly into `buzzheavier.com` pages.

### 🌟 Features:
- **Floating Action Launcher Widget**: Bottom-right glowing trigger with live link counter.
- **Keyboard Shortcut**: Press `Alt + B` anywhere on Buzzheavier to toggle the control center.
- **5-Variant Link Generator**: Automatically generates all 5 mirror & download link variants (`buzzheavier.com/{id}`, `dd.buzzheavier.com/f/{id}`, `buzzheavier.com/f/{id}`, token URL, `alt=true` mirror URL).
- **Batch Scraper**: Scrapes directory listings or pages for all Buzzheavier links with search filter and mass copy.
- **JDownloader & File Export**: 1-Click copy to clipboard, export as `.txt` or `.crawljob` file.
- **Draggable & Persisted Settings**: Move panel anywhere on screen, configure auto-copy on load, auto-open panel & toast popups.

### 🌐 Standalone Browser Test (No Tampermonkey Required):
Open [`userscript_gui_preview.html`](file:///home/daniel/Dokumente/Buzz%20heavier%20projekt/userscript_gui_preview.html) in your browser for a live interactive preview!

---

## 🐍 Python CLI (`buzzheavier.py`) & Web GUI (`app.py`)

### Requirements
- Python 3.6+
- `requests` (`pip install requests`)

### Usage

#### 1. Launch Local Web GUI App
```bash
python3 app.py
```

#### 2. CLI Upload File
```bash
# Anonymous upload
python3 buzzheavier.py upload myfile.zip

# Authenticated upload
python3 buzzheavier.py upload myfile.zip --token YOUR_ACCOUNT_TOKEN
```

#### 3. CLI Download File
```bash
python3 buzzheavier.py download https://buzzheavier.com/f/abc123xyz
```

---

## 🐚 Bash Script (`buzzheavier.sh`)

```bash
chmod +x buzzheavier.sh

# Upload file
./buzzheavier.sh upload myfile.zip

# Download file
./buzzheavier.sh download https://buzzheavier.com/f/abc123xyz
```

---

## 📡 cURL One-Liners

```bash
# Uploading
curl -#o - -T "file.zip" "https://w.buzzheavier.com/file.zip"

# Direct Link Retrieval
curl -sI -A "Mozilla/5.0" -H "HX-Request: true" -H "Referer: https://buzzheavier.com/f/FILE_ID" "https://buzzheavier.com/FILE_ID/download" | grep -i "^hx-redirect:"
```
