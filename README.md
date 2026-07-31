# 🚀 Buzzheavier Tools & Control Center

<div align="center">

![Buzzheavier Tools Banner](https://img.shields.io/badge/Buzzheavier-Control_Center_v3.3.0-00E676?style=for-the-badge&logo=rocket&logoColor=white)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Brennerofhell/buzzheavier-tools?style=for-the-badge&color=gold)](https://github.com/Brennerofhell/buzzheavier-tools/stargazers)

<br/>

## 📥 1-Click Direct Installation Buttons

Click any button below to install or try out the tools instantly:

[![⚡ 1-Click Userscript Install](https://img.shields.io/badge/⚡_1--Click_Userscript_Install-Tampermonkey_%2F_Violentmonkey-00E676?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githack.com/Brennerofhell/buzzheavier-tools/main/buzzheavier.user.js)
[![🧩 Chrome / Edge Extension](https://img.shields.io/badge/🧩_Download_Chrome_Extension-ZIP_Package-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/Brennerofhell/buzzheavier-tools/archive/refs/heads/main.zip)
[![🌐 Live Web GUI Preview](https://img.shields.io/badge/🌐_Live_Web_GUI_Preview-Interactive_Demo-7C4DFF?style=for-the-badge&logo=html5&logoColor=white)](https://raw.githack.com/Brennerofhell/buzzheavier-tools/main/userscript_gui_preview.html)
[![🐍 Python Web GUI & CLI](https://img.shields.io/badge/🐍_Python_CLI_%26_Web_GUI-app.py-FFD43B?style=for-the-badge&logo=python&logoColor=306998)](app.py)

---

</div>

## ⚙️ Installation & Setup Options

### 1️⃣ ⚡ Userscript Pro GUI v3.3.0 (Empfohlen für Browser)
Unterstützt **Tampermonkey**, **Violentmonkey** und **Greasemonkey** (Chrome, Firefox, Edge, Opera, Brave).

> [!TIP]
> Klicke auf einen der Buttons unten, um die automatische 1-Klick-Installation in deinem Userscript-Manager zu starten:

<div align="center">

[![⚡ Hier klicken für 1-Klick Installation (GitHack CDN)](https://img.shields.io/badge/👉_1--KLICK_INSTALLATION-STARTEN_(GITHACK)-00E676?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githack.com/Brennerofhell/buzzheavier-tools/main/buzzheavier.user.js)
[![⚡ Alternative 1-Klick Installation (jsDelivr CDN)](https://img.shields.io/badge/👉_1--KLICK_INSTALLATION-STARTEN_(JSDELIVR)-00b4d8?style=for-the-badge&logo=tampermonkey&logoColor=white)](https://cdn.jsdelivr.net/gh/Brennerofhell/buzzheavier-tools@main/buzzheavier.user.js)

*(Direktlink: `https://raw.githack.com/Brennerofhell/buzzheavier-tools/main/buzzheavier.user.js`)*

</div>

#### ✨ Userscript Features (`buzzheavier.user.js`)
- 🟢 **Automatic Highspeed Direct-Stream Resolver**: Automatische Auflösung der `ts.buzzheavier.com` Speicher-Links via HTMX Cloudflare Bypass.
- 🟢 **Floating Action Launcher**: Button unten rechts mit Live-Link-Zähler.
- ⌨️ **Tastenkombination**: `Alt + B` öffnet/schließt das Control Center überall auf Buzzheavier.
- 🔗 **5 Mirror-Varianten**: Generiert automatisch alle Download- und Mirror-URLs (`ts.buzzheavier.com/d/{id}`, `dd.buzzheavier.com/f/{id}`, `buzzheavier.com/f/{id}`, Token-URL, Alt-Mirror).
- 📋 **Batch-Scraper**: Durchsucht Ordner & Seiten nach Links mit Filter & Massen-Kopieren.
- 📦 **JDownloader 2 Export**: 1-Klick in die Zwischenablage oder als `.crawljob` / `.txt` Datei speichern.
- ⚙️ **Verschiebbares Glassmorphism GUI**: Frei positionierbar, speichert Einstellungen lokal.

---

### 2️⃣ 🧩 Chrome / Browser Extension (Unpacked)
Für Nutzer, die eine permanente Browser-Erweiterung bevorzugen:

1. Laden Sie das Repository als ZIP herunter:  
   [![ZIP herunterladen](https://img.shields.io/badge/📦_Download_Repo_ZIP-4285F4?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Brennerofhell/buzzheavier-tools/archive/refs/heads/main.zip)
2. Entpacken Sie die ZIP-Datei auf Ihrem PC.
3. Öffnen Sie in Chrome / Edge / Brave: `chrome://extensions/`
4. Aktivieren Sie oben rechts den **Entwicklermodus (Developer mode)**.
5. Klicken Sie auf **Entpackte Erweiterung laden (Load unpacked)** und wählen Sie den Ordner `extension/` aus.

---

### 3️⃣ 🐍 Python Web GUI (`app.py`) & CLI (`buzzheavier.py`)

#### Voraussetzungen
```bash
pip install requests
```

#### Starten

| Tool | Befehl | Beschreibung |
|---|---|---|
| 🌐 **Web GUI** | `python3 app.py` | Startet eine lokale Flask Web-Oberfläche |
| 📤 **CLI Upload** | `python3 buzzheavier.py upload datei.zip` | Lädt Dateien per Konsole hoch |
| 📥 **CLI Download** | `python3 buzzheavier.py download <URL>` | Lädt Dateien direkt per Konsole herunter |

---

### 4️⃣ 🐚 Bash Script (`buzzheavier.sh`)
```bash
chmod +x buzzheavier.sh

# Datei hochladen
./buzzheavier.sh upload datei.zip

# Datei herunterladen
./buzzheavier.sh download https://buzzheavier.com/f/abc123xyz
```

---

### 📡 cURL One-Liner (Keine Installation nötig)

```bash
# Hochladen via cURL
curl -#o - -T "datei.zip" "https://w.buzzheavier.com/datei.zip"

# Direktlink auslesen
curl -sI -A "Mozilla/5.0" -H "HX-Request: true" -H "Referer: https://buzzheavier.com/f/FILE_ID" "https://buzzheavier.com/FILE_ID/download" | grep -i "^hx-redirect:"
```

