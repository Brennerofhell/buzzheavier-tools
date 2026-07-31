# 🐛 Bug-Dokumentation: Buzzheavier Tools

> Session: 31. Juli 2026 | Autor: Antigravity AI

---

## Bug #1: Cloudflare Managed Challenge blockiert alle Python/CLI-Requests

### 🔴 Symptom
Alle automatisierten HTTP-Anfragen an `https://buzzheavier.com/f/{file_id}` (Python `requests`, `urllib`, `wget`, Headless-Browser) wurden mit **HTTP 403 Forbidden** abgefangen. Statt der Datei-Seite erhielt man die Cloudflare-Challenge-Seite:

```html
<title>Just a moment...</title>
<!-- Cloudflare Turnstile JS Challenge -->
```

Betroffen:
- `buzzheavier.py` → `download_file()` → **403 auf jeder Datei-Seite**
- `app.py` → `resolveDownload()` → lieferte falsche `dd.buzzheavier.com`-Links
- `buzzheavier.sh` → `download_file()` → konnte keinen direkten Download-Link auflösen

### 🔍 Ursache
Cloudflare ist auf `buzzheavier.com` so konfiguriert, dass es alle Requests ohne gültige Browser-Signatur (TLS-Fingerprint, JS-Challenge-Cookie `cf_clearance`) mit 403 blockiert. Standard-HTTP-Bibliotheken besitzen diese Merkmale nicht.

**Entdeckung:** Buzzheavier nutzt intern das Frontend-Framework **HTMX**. Cloudflare lässt HTMX-AJAX-Requests (erkennbar am Header `HX-Request: true`) durch, weil diese als legitime In-Page-Navigation gelten.

### ✅ Fix
**Zwei-Stufen HTMX-Bypass** ohne externe Abhängigkeiten (kein `curl_cffi`, kein Playwright):

```
Schritt 1: Seite abrufen MIT HTMX-Headern
  GET https://buzzheavier.com/{file_id}
  Header: HX-Request: true
  Header: Referer: https://buzzheavier.com/f/{file_id}
  → Cloudflare lässt durch (HTTP 200)
  → HTML enthält signierten Token: hx-get="/{file_id}/download?t=TOKEN..."

Schritt 2: Token-Endpunkt auflösen
  GET https://buzzheavier.com/{file_id}/download?t=TOKEN
  Header: HX-Request: true
  → HTTP 204 No Content
  → Header: Hx-Redirect: https://ts.buzzheavier.com/d/{file_id}?v=SIGNED_URL

Schritt 3: Datei direkt herunterladen
  GET https://ts.buzzheavier.com/d/{file_id}?v=SIGNED_URL
  → HTTP 200 → Dateiinhalt
```

**Geänderte Dateien:**
| Datei | Funktion | Änderung |
|---|---|---|
| `buzzheavier.py` | `get_direct_download_info()` | HTMX-Bypass statt direktem Download-Versuch |
| `buzzheavier.py` | `download_file()` | Nutzt resolved signed Storage-URL |
| `app.py` | `resolve_direct_link()` | Neue Backend-Funktion für HTMX-Bypass |
| `app.py` | `do_GET()` | Neuer `/api/resolve`-Endpunkt |
| `app.py` | `resolveDownload()` JS | Ruft `/api/resolve` statt statischer URL |
| `buzzheavier.sh` | `download_file()` | HTMX-Header zu allen `curl`-Aufrufen |

---

## Bug #2: Userscript-Header fehlerhafter Closing Tag

### 🔴 Symptom
Beim Aufruf von `buzzheavier.user.js` über einen Link öffnete Tampermonkey / Violentmonkey **keinen Installationsdialog**. Stattdessen wurde das Script als roher Klartext im Browser angezeigt.

### 🔍 Ursache
Im Metadaten-Header der Userscript-Datei war der **schließende Tag falsch**:

```javascript
// ==UserScript==       ← Öffnender Tag (korrekt)
// @name  ...
// ...
// ==UserScript==       ← ❌ FALSCH: Fehlender Slash '/'
```

Der korrekte schließende Tag muss lauten:
```javascript
// ==/UserScript==      ← ✅ KORREKT
```

Ohne den korrekten closing Tag kann Tampermonkey den Metadaten-Block nicht parsen und erkennt die Datei nicht als installierbare `.user.js`-Datei.

### ✅ Fix
```diff
- // ==UserScript==
+ // ==/UserScript==
```

**Geänderte Datei:** `buzzheavier.user.js`, Zeile 19

---

## Bug #3: `raw.githubusercontent.com` liefert falschen MIME-Type

### 🔴 Symptom
1-Klick-Installationslinks via `raw.githubusercontent.com` öffnen das Userscript als Textdatei im Browser, anstatt den Tampermonkey-Installationsdialog auszulösen.

### 🔍 Ursache
GitHub's `raw.githubusercontent.com` liefert `.user.js`-Dateien mit dem Header:

```
Content-Type: text/plain; charset=utf-8
```

Tampermonkey / Violentmonkey erkennen Userscripts nur, wenn die Datei mit `Content-Type: application/javascript` ausgeliefert wird.

### ✅ Fix
Installation-Links auf CDN-Dienste umgestellt, die den korrekten MIME-Type liefern:

| CDN | Content-Type | Ergebnis |
|---|---|---|
| `raw.githubusercontent.com` | `text/plain` | ❌ Klartext |
| `raw.githack.com` | `application/javascript` | ✅ Installationsdialog |
| `cdn.jsdelivr.net` | `application/javascript` | ✅ Installationsdialog |

**Geänderte Dateien:**
- `buzzheavier.user.js`: `@downloadURL` und `@updateURL` → `raw.githack.com`
- `README.md`: Alle Installationsbuttons → `raw.githack.com` / `install-redirect.html`

---

## Bug #4: `#bypass=true` Fragment zerstört 1-Klick-Installation

### 🔴 Symptom
Wenn ein Nutzer auf den Installationslink **von der buzzheavier.com-Website aus** klickt, öffnet sich immer noch Klartext statt des Installationsdialogs, obwohl der CDN-Link an sich korrekt ist.

Browser-URL:
```
https://raw.githack.com/.../buzzheavier.user.js#bypass=true
```

### 🔍 Ursache
Buzzheavier.com setzt das Frontend-Framework **HTMX** ein. HTMX hängt automatisch **`#bypass=true`** als URL-Fragment an alle ausgehenden Links an, um seine clientseitige Navigation zu steuern.

Tampermonkey / Violentmonkey erkennen Userscripts nur, wenn die URL **exakt auf `.user.js` endet**. Durch das angehängte `#bypass=true` lautet das Ende der URL aber `...user.js#bypass=true` — der Browser-Prozess für den Tampermonkey-Interceptor wird nicht ausgelöst.

### ✅ Fix
Neue Zwischenseite `install-redirect.html` erstellt:

```html
<script>
    // Lädt unabhängig von URL-Fragmenten und navigiert
    // sofort sauber zur .user.js (ohne jegliche Hash-Fragmente)
    window.location.replace(
        'https://raw.githack.com/Brennerofhell/buzzheavier-tools/main/buzzheavier.user.js'
    );
</script>
```

**Wie es funktioniert:**
```
Nutzer klickt Link von buzzheavier.com
  → URL: install-redirect.html#bypass=true
  → Seite lädt (Fragment wird ignoriert)
  → JS: window.location.replace(saubere .user.js URL)
  → Browser navigiert zu: buzzheavier.user.js (kein Fragment!)
  → Tampermonkey erkennt .user.js → Installationsdialog ✅
```

**Geänderte Dateien:**
- `install-redirect.html` [NEU]: Redirect-Seite
- `README.md`: Alle Install-Buttons zeigen jetzt auf `install-redirect.html`

---

## Zusammenfassung der Änderungen

```
buzzheavier.py      → HTMX Cloudflare Bypass für Downloads
app.py              → HTMX Bypass API-Endpunkt + JS resolveDownload()
buzzheavier.sh      → HTMX-Header in curl-Aufrufen
buzzheavier.user.js → Closing-Tag-Fix + HTMX Highspeed Resolver + CDN URLs
install-redirect.html [NEU] → Fragment-Stripper für 1-Click Install
install.html [NEU]  → Schritt-für-Schritt Installationshilfe
README.md           → v3.3.0 Badges + korrekte Install-Links
```

> **Version:** `v3.3.0` | Commits: `46ffe8d → 1ac3e00`
