// ==UserScript==
// @name         Buzzheavier JDownloader 2 Batch Scraper & Link Copier Pro GUI
// @namespace    https://github.com/Brennerofhell/buzzheavier-tools
// @version      3.0.0
// @description  Modern Glassmorphic Control Center GUI for Buzzheavier file download link extraction, 5 mirror variants, batch scraping & JDownloader export.
// @author       Brennerofhell
// @match        https://buzzheavier.com/*
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @downloadURL  https://raw.githubusercontent.com/Brennerofhell/buzzheavier-tools/main/buzzheavier.user.js
// @updateURL    https://raw.githubusercontent.com/Brennerofhell/buzzheavier-tools/main/buzzheavier.user.js
// @homepageURL  https://github.com/Brennerofhell/buzzheavier-tools
// @supportURL   https://github.com/Brennerofhell/buzzheavier-tools/issues
// @run-at       document-idle
// @icon         https://buzzheavier.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    // --- DEFAULT CONFIGURATION & STORAGE ---
    const STORAGE_KEY_SETTINGS = 'bh_gui_settings_v3';
    const defaultSettings = {
        autoOpen: true,
        autoCopyOnLoad: false,
        showToasts: true,
        defaultTab: 'variants',
        theme: 'violet'
    };

    function loadSettings() {
        try {
            if (typeof GM_getValue !== 'undefined') {
                return JSON.parse(GM_getValue(STORAGE_KEY_SETTINGS, JSON.stringify(defaultSettings)));
            }
            const local = localStorage.getItem(STORAGE_KEY_SETTINGS);
            return local ? JSON.parse(local) : defaultSettings;
        } catch(e) {
            return defaultSettings;
        }
    }

    function saveSettings(settings) {
        try {
            const str = JSON.stringify(settings);
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(STORAGE_KEY_SETTINGS, str);
            } else {
                localStorage.setItem(STORAGE_KEY_SETTINGS, str);
            }
        } catch(e) {
            console.error('Buzzheavier GUI: Settings save error', e);
        }
    }

    let settings = loadSettings();

    // --- INJECT STYLES ---
    function injectStyles() {
        if (document.getElementById('bh-gui-styles')) return;

        const style = document.createElement('style');
        style.id = 'bh-gui-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

            :root {
                --bh-bg: rgba(13, 17, 30, 0.94);
                --bh-border: rgba(139, 92, 246, 0.35);
                --bh-border-hover: rgba(6, 182, 212, 0.5);
                --bh-card: rgba(255, 255, 255, 0.05);
                --bh-card-hover: rgba(255, 255, 255, 0.09);
                --bh-primary: #8b5cf6;
                --bh-primary-gradient: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
                --bh-secondary: #06b6d4;
                --bh-accent: #ec4899;
                --bh-text: #f3f4f6;
                --bh-text-muted: #9ca3af;
                --bh-success: #10b981;
                --bh-error: #ef4444;
                --bh-font: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            #bh-gui-launcher {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 999990;
                width: 54px;
                height: 54px;
                border-radius: 18px;
                background: var(--bh-primary-gradient);
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4), 0 0 20px rgba(6, 182, 212, 0.2);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
            }

            #bh-gui-launcher:hover {
                transform: translateY(-3px) scale(1.05);
                box-shadow: 0 15px 35px rgba(139, 92, 246, 0.6), 0 0 25px rgba(6, 182, 212, 0.4);
            }

            #bh-gui-launcher svg {
                width: 26px;
                height: 26px;
                fill: white;
            }

            #bh-gui-launcher .bh-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ef4444;
                color: white;
                font-family: var(--bh-font);
                font-size: 11px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 10px;
                border: 2px solid #0f1423;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            }

            #bh-gui-panel {
                position: fixed;
                bottom: 90px;
                right: 24px;
                z-index: 999991;
                width: 440px;
                max-width: calc(100vw - 32px);
                max-height: calc(100vh - 120px);
                background: var(--bh-bg);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid var(--bh-border);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(139, 92, 246, 0.25);
                font-family: var(--bh-font);
                color: var(--bh-text);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }

            #bh-gui-panel.bh-hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateY(20px) scale(0.96);
            }

            .bh-header {
                padding: 16px 20px;
                background: rgba(255, 255, 255, 0.03);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                align-items: center;
                justify-content: space-between;
                cursor: move;
                user-select: none;
            }

            .bh-title-group {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .bh-title-icon {
                width: 32px;
                height: 32px;
                border-radius: 10px;
                background: var(--bh-primary-gradient);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            }

            .bh-title-text {
                font-weight: 700;
                font-size: 15px;
                background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                letter-spacing: -0.2px;
            }

            .bh-header-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .bh-icon-btn {
                background: rgba(255, 255, 255, 0.07);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--bh-text-muted);
                width: 28px;
                height: 28px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }

            .bh-icon-btn:hover {
                background: rgba(255, 255, 255, 0.18);
                color: var(--bh-text);
            }

            .bh-nav {
                display: flex;
                background: rgba(0, 0, 0, 0.2);
                padding: 4px;
                margin: 12px 16px 0 16px;
                border-radius: 12px;
                gap: 4px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .bh-nav-btn {
                flex: 1;
                padding: 8px 10px;
                border: none;
                background: transparent;
                color: var(--bh-text-muted);
                font-family: var(--bh-font);
                font-size: 12px;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .bh-nav-btn.active {
                background: var(--bh-primary-gradient);
                color: white;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
            }

            .bh-content {
                padding: 16px;
                overflow-y: auto;
                max-height: 400px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .bh-content::-webkit-scrollbar {
                width: 6px;
            }
            .bh-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.15);
                border-radius: 3px;
            }

            .bh-tab-pane {
                display: none;
                flex-direction: column;
                gap: 12px;
            }

            .bh-tab-pane.active {
                display: flex;
            }

            /* LINK ITEM CARDS */
            .bh-link-card {
                background: var(--bh-card);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                transition: all 0.2s;
            }

            .bh-link-card:hover {
                background: var(--bh-card-hover);
                border-color: var(--bh-border-hover);
            }

            .bh-link-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .bh-tag {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                padding: 3px 8px;
                border-radius: 6px;
                letter-spacing: 0.5px;
            }

            .bh-tag-primary { background: rgba(139, 92, 246, 0.25); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.4); }
            .bh-tag-cdn { background: rgba(6, 182, 212, 0.25); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.4); }
            .bh-tag-direct { background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); }

            .bh-link-url {
                font-size: 11px;
                font-family: monospace;
                color: #d1d5db;
                word-break: break-all;
                background: rgba(0, 0, 0, 0.3);
                padding: 6px 8px;
                border-radius: 6px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .bh-btn-row {
                display: flex;
                gap: 8px;
            }

            .bh-btn {
                padding: 8px 14px;
                border: none;
                border-radius: 8px;
                font-family: var(--bh-font);
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .bh-btn-primary {
                background: var(--bh-primary-gradient);
                color: white;
                box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
            }

            .bh-btn-primary:hover {
                opacity: 0.95;
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
            }

            .bh-btn-secondary {
                background: rgba(255, 255, 255, 0.08);
                color: var(--bh-text);
                border: 1px solid rgba(255, 255, 255, 0.12);
            }

            .bh-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.16);
            }

            .bh-btn-sm {
                padding: 5px 10px;
                font-size: 11px;
            }

            /* SCRAPER & LISTS */
            .bh-scraper-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
                max-height: 220px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.25);
                padding: 8px;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .bh-scraper-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 11px;
                padding: 6px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.03);
            }

            .bh-scraper-item input {
                accent-color: var(--bh-primary);
            }

            .bh-input {
                width: 100%;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-family: var(--bh-font);
                font-size: 12px;
                outline: none;
                box-sizing: border-box;
            }

            .bh-input:focus {
                border-color: var(--bh-primary);
                box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
            }

            /* SETTINGS TOGGLES */
            .bh-setting-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px;
                background: var(--bh-card);
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .bh-setting-info {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .bh-setting-title {
                font-size: 13px;
                font-weight: 600;
            }

            .bh-setting-desc {
                font-size: 11px;
                color: var(--bh-text-muted);
            }

            .bh-switch {
                position: relative;
                display: inline-block;
                width: 40px;
                height: 22px;
            }

            .bh-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .bh-slider {
                position: absolute;
                cursor: pointer;
                top: 0; left: 0; right: 0; bottom: 0;
                background-color: rgba(255, 255, 255, 0.2);
                transition: .3s;
                border-radius: 20px;
            }

            .bh-slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: .3s;
                border-radius: 50%;
            }

            input:checked + .bh-slider {
                background: var(--bh-primary-gradient);
            }

            input:checked + .bh-slider:before {
                transform: translateX(18px);
            }

            /* TOAST CONTAINER */
            #bh-toast-container {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 999999;
                display: flex;
                flex-direction: column;
                gap: 8px;
                pointer-events: none;
            }

            .bh-toast {
                background: rgba(15, 20, 35, 0.95);
                border: 1px solid var(--bh-primary);
                color: white;
                padding: 10px 16px;
                border-radius: 12px;
                font-family: var(--bh-font);
                font-size: 13px;
                font-weight: 600;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(139, 92, 246, 0.3);
                backdrop-filter: blur(12px);
                animation: bhToastIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            @keyframes bhToastIn {
                from { opacity: 0; transform: translateY(-10px) scale(0.9); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // --- HELPER LOGIC ---
    function extractFileId() {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        return pathParts.filter(p => p !== 'f' && p !== 'download').pop() || '';
    }

    function extractToken() {
        // 1. Check URL search params
        let token = new URLSearchParams(window.location.search).get('t');
        if (token) return token;

        // 2. Check DOM elements (a, button, div) with href or HTMX hx-get/hx-post
        const tokenEl = document.querySelector('[href*="download?t="], [hx-get*="download?t="], [hx-post*="download?t="], [data-t]');
        if (tokenEl) {
            const targetUrl = tokenEl.getAttribute('href') || tokenEl.getAttribute('hx-get') || tokenEl.getAttribute('hx-post') || tokenEl.getAttribute('data-t') || '';
            const match = targetUrl.match(/t=([^&"'\s]+)/);
            if (match) return match[1];
        }

        // 3. Fallback: Full HTML regex search for download?t=...
        try {
            const html = document.documentElement.innerHTML;
            const match = html.match(/\/download\?t=([^&"'\s\>]+)/);
            if (match) return match[1];
        } catch(e) {}

        return '';
    }

    function getAllVariants() {
        const fileId = extractFileId();
        if (!fileId) return [];

        const token = extractToken();

        const list = [
            { title: 'Landing Page URL', tag: 'primary', url: `https://buzzheavier.com/${fileId}` },
            { title: 'CDN Direct Path', tag: 'cdn', url: `https://dd.buzzheavier.com/f/${fileId}` },
            { title: 'Short File Path', tag: 'primary', url: `https://buzzheavier.com/f/${fileId}` }
        ];

        if (token) {
            list.push({ title: 'Direct Token Link', tag: 'direct', url: `https://buzzheavier.com/${fileId}/download?t=${token}` });
            list.push({ title: 'Alternative Mirror Token', tag: 'direct', url: `https://buzzheavier.com/${fileId}/download?t=${token}&alt=true` });
        }

        return list;
    }

    function copyToClipboard(text, message = 'Links in Zwischenablage kopiert!') {
        if (typeof GM_setClipboard !== 'undefined') {
            GM_setClipboard(text);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        }
        if (settings.showToasts) showToast(message);
    }

    function showToast(msg, icon = '📋') {
        let container = document.getElementById('bh-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'bh-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'bh-toast';
        toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.25s';
            setTimeout(() => toast.remove(), 250);
        }, 2800);
    }

    function downloadFile(content, fileName, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    // --- GUI PANELS & EVENT HANDLERS ---
    function initGUI() {
        if (document.getElementById('bh-gui-launcher')) return;

        injectStyles();

        // 1. LAUNCHER WIDGET
        const launcher = document.createElement('div');
        launcher.id = 'bh-gui-launcher';
        launcher.title = 'Buzzheavier Control Center (Alt + B)';
        const variants = getAllVariants();
        launcher.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span class="bh-badge" id="bh-badge-count">${variants.length}</span>
        `;
        document.body.appendChild(launcher);

        // 2. MAIN PANEL CONTAINER
        const panel = document.createElement('div');
        panel.id = 'bh-gui-panel';
        panel.className = settings.autoOpen ? '' : 'bh-hidden';

        panel.innerHTML = `
            <div class="bh-header" id="bh-gui-header">
                <div class="bh-title-group">
                    <div class="bh-title-icon">🚀</div>
                    <span class="bh-title-text">Buzzheavier Pro GUI</span>
                </div>
                <div class="bh-header-actions">
                    <button class="bh-icon-btn" id="bh-btn-toggle" title="Minimieren">─</button>
                    <button class="bh-icon-btn" id="bh-btn-close" title="Schließen">✕</button>
                </div>
            </div>

            <div class="bh-nav">
                <button class="bh-nav-btn active" data-tab="variants">🔗 Varianten (${variants.length})</button>
                <button class="bh-nav-btn" data-tab="scraper">🔍 Scraper</button>
                <button class="bh-nav-btn" data-tab="export">⚡ Export</button>
                <button class="bh-nav-btn" data-tab="settings">⚙️ Options</button>
            </div>

            <div class="bh-content">
                <!-- TAB 1: VARIANTS -->
                <div class="bh-tab-pane active" id="bh-pane-variants">
                    <div style="font-size: 12px; color: var(--bh-text-muted);">
                        Gefundene Download- & Mirror-Links für diese Datei:
                    </div>
                    <div id="bh-variants-container"></div>
                    <button class="bh-btn bh-btn-primary" id="bh-copy-all-variants">
                        📋 Alle ${variants.length} Varianten für JDownloader 2 Kopieren
                    </button>
                </div>

                <!-- TAB 2: SCRAPER -->
                <div class="bh-tab-pane" id="bh-pane-scraper">
                    <input type="text" class="bh-input" id="bh-scraper-search" placeholder="Links auf Seite filtern...">
                    <div class="bh-scraper-list" id="bh-scraper-list"></div>
                    <div class="bh-btn-row">
                        <button class="bh-btn bh-btn-primary" id="bh-copy-scraped" style="flex: 1;">
                            📋 Ausgewählte Kopieren
                        </button>
                        <button class="bh-btn bh-btn-secondary" id="bh-rescan-page">
                            🔄 Neu Scannen
                        </button>
                    </div>
                </div>

                <!-- TAB 3: EXPORT -->
                <div class="bh-tab-pane" id="bh-pane-export">
                    <div style="font-size: 12px; color: var(--bh-text-muted);">
                        Exportiere Links für externe Download-Manager:
                    </div>
                    <button class="bh-btn bh-btn-secondary" id="bh-export-txt">
                        📄 Als Textdatei (.txt) herunterladen
                    </button>
                    <button class="bh-btn bh-btn-secondary" id="bh-export-crawljob">
                        📦 JDownloader 2 Crawljob (.crawljob) erstellen
                    </button>
                    <button class="bh-btn bh-btn-primary" id="bh-copy-direct-only">
                        ⚡ Nur Direct-Download Links Kopieren
                    </button>
                </div>

                <!-- TAB 4: SETTINGS -->
                <div class="bh-tab-pane" id="bh-pane-settings">
                    <div class="bh-setting-row">
                        <div class="bh-setting-info">
                            <span class="bh-setting-title">Auto-Open Panel</span>
                            <span class="bh-setting-desc">GUI beim Laden der Seite automatisch anzeigen</span>
                        </div>
                        <label class="bh-switch">
                            <input type="checkbox" id="bh-set-autoopen" ${settings.autoOpen ? 'checked' : ''}>
                            <span class="bh-slider"></span>
                        </label>
                    </div>

                    <div class="bh-setting-row">
                        <div class="bh-setting-info">
                            <span class="bh-setting-title">Auto-Copy Links</span>
                            <span class="bh-setting-desc">Links beim Seitenaufruf direkt in Zwischenablage</span>
                        </div>
                        <label class="bh-switch">
                            <input type="checkbox" id="bh-set-autocopy" ${settings.autoCopyOnLoad ? 'checked' : ''}>
                            <span class="bh-slider"></span>
                        </label>
                    </div>

                    <div class="bh-setting-row">
                        <div class="bh-setting-info">
                            <span class="bh-setting-title">Toast Benachrichtigungen</span>
                            <span class="bh-setting-desc">Visuelle Popups bei Aktionen anzeigen</span>
                        </div>
                        <label class="bh-switch">
                            <input type="checkbox" id="bh-set-toasts" ${settings.showToasts ? 'checked' : ''}>
                            <span class="bh-slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // --- RENDER VARIANTS TAB ---
        renderVariants();

        // --- RENDER SCRAPER TAB ---
        renderScraper();

        // --- BIND EVENT LISTENERS ---
        // Launcher toggle
        launcher.addEventListener('click', togglePanel);

        document.getElementById('bh-btn-close').addEventListener('click', togglePanel);
        document.getElementById('bh-btn-toggle').addEventListener('click', togglePanel);

        // Tab switching
        panel.querySelectorAll('.bh-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                panel.querySelectorAll('.bh-nav-btn').forEach(b => b.classList.remove('active'));
                panel.querySelectorAll('.bh-tab-pane').forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const pane = document.getElementById(`bh-pane-${targetTab}`);
                if (pane) pane.classList.add('active');
            });
        });

        // Copy All Variants
        document.getElementById('bh-copy-all-variants').addEventListener('click', () => {
            const vars = getAllVariants().map(v => v.url);
            if (vars.length > 0) {
                copyToClipboard(vars.join('\n'), `✅ ${vars.length} Link-Varianten kopiert!`);
            } else {
                showToast('Keine Datei-ID auf dieser Seite gefunden', '⚠️');
            }
        });

        // Scraper Actions
        document.getElementById('bh-rescan-page').addEventListener('click', renderScraper);
        document.getElementById('bh-copy-scraped').addEventListener('click', copyScrapedLinks);
        document.getElementById('bh-scraper-search').addEventListener('input', (e) => filterScraper(e.target.value));

        // Export Actions
        document.getElementById('bh-export-txt').addEventListener('click', () => {
            const vars = getAllVariants().map(v => v.url);
            if (vars.length > 0) {
                downloadFile(vars.join('\n'), `buzzheavier_${extractFileId() || 'links'}.txt`);
                showToast('Textdatei heruntergeladen', '📄');
            }
        });

        document.getElementById('bh-export-crawljob').addEventListener('click', () => {
            const vars = getAllVariants().map(v => v.url);
            if (vars.length > 0) {
                const crawljobContent = `text=${vars.join('\n')}\nautoStart=TRUE\nautoConfirm=TRUE`;
                downloadFile(crawljobContent, `buzzheavier_${extractFileId() || 'links'}.crawljob`);
                showToast('JDownloader Crawljob heruntergeladen', '📦');
            }
        });

        document.getElementById('bh-copy-direct-only').addEventListener('click', () => {
            const token = extractToken();
            const fileId = extractFileId();
            if (token && fileId) {
                const directLinks = [
                    `https://buzzheavier.com/${fileId}/download?t=${token}`,
                    `https://buzzheavier.com/${fileId}/download?t=${token}&alt=true`
                ].join('\n');
                copyToClipboard(directLinks, '⚡ Direct-Download Links kopiert!');
            } else {
                showToast('Kein Direct Token auf dieser Seite verfügbar', '⚠️');
            }
        });

        // Settings Toggles
        document.getElementById('bh-set-autoopen').addEventListener('change', (e) => {
            settings.autoOpen = e.target.checked;
            saveSettings(settings);
        });

        document.getElementById('bh-set-autocopy').addEventListener('change', (e) => {
            settings.autoCopyOnLoad = e.target.checked;
            saveSettings(settings);
        });

        document.getElementById('bh-set-toasts').addEventListener('change', (e) => {
            settings.showToasts = e.target.checked;
            saveSettings(settings);
        });

        // DRAGGABLE HEADER MECHANICS
        makeDraggable(panel, document.getElementById('bh-gui-header'));

        // KEYBOARD SHORTCUT (Alt + B)
        window.addEventListener('keydown', (e) => {
            if (e.altKey && (e.key === 'b' || e.key === 'B')) {
                togglePanel();
            }
        });

        // Auto copy on load if enabled
        if (settings.autoCopyOnLoad) {
            const vars = getAllVariants().map(v => v.url);
            if (vars.length > 0) copyToClipboard(vars.join('\n'), 'Auto-Copy: Links kopiert!');
        }
    }

    function togglePanel() {
        const panel = document.getElementById('bh-gui-panel');
        if (panel) {
            panel.classList.toggle('bh-hidden');
        }
    }

    function renderVariants() {
        const container = document.getElementById('bh-variants-container');
        if (!container) return;

        const variants = getAllVariants();
        if (variants.length === 0) {
            container.innerHTML = `<div style="font-size:12px; color:var(--bh-text-muted); text-align:center; padding:12px;">Keine Buzzheavier Datei-ID erkannt.</div>`;
            return;
        }

        container.innerHTML = variants.map(v => `
            <div class="bh-link-card">
                <div class="bh-link-header">
                    <span class="bh-setting-title" style="font-size:12px;">${v.title}</span>
                    <span class="bh-tag bh-tag-${v.tag}">${v.tag}</span>
                </div>
                <div class="bh-link-url">${v.url}</div>
                <div class="bh-btn-row">
                    <button class="bh-btn bh-btn-secondary bh-btn-sm bh-copy-single" data-url="${v.url}" style="flex:1;">
                        📋 Kopieren
                    </button>
                    <a href="${v.url}" target="_blank" class="bh-btn bh-btn-primary bh-btn-sm" style="text-decoration:none;">
                        🚀 Öffnen
                    </a>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.bh-copy-single').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                copyToClipboard(url, 'Link in Zwischenablage kopiert!');
            });
        });
    }

    let scrapedUrls = [];

    function renderScraper() {
        const list = document.getElementById('bh-scraper-list');
        if (!list) return;

        scrapedUrls = [];
        document.querySelectorAll('a').forEach(a => {
            const href = a.href;
            if (href && (href.includes('buzzheavier.com') || href.includes('/f/')) && !scrapedUrls.includes(href)) {
                scrapedUrls.push(href);
            }
        });

        if (scrapedUrls.length === 0) {
            list.innerHTML = `<div style="font-size:11px; color:var(--bh-text-muted); text-align:center; padding:8px;">Keine weiteren Links auf der Seite gefunden.</div>`;
            return;
        }

        list.innerHTML = scrapedUrls.map((url, idx) => `
            <div class="bh-scraper-item" data-url="${url}">
                <input type="checkbox" checked id="bh-chk-${idx}" value="${url}">
                <label for="bh-chk-${idx}" style="word-break:break-all; cursor:pointer;">${url}</label>
            </div>
        `).join('');
    }

    function filterScraper(query) {
        const q = query.toLowerCase();
        document.querySelectorAll('.bh-scraper-item').forEach(item => {
            const url = item.dataset.url.toLowerCase();
            item.style.display = url.includes(q) ? 'flex' : 'none';
        });
    }

    function copyScrapedLinks() {
        const selected = [];
        document.querySelectorAll('#bh-scraper-list input[type="checkbox"]:checked').forEach(chk => {
            selected.push(chk.value);
        });

        if (selected.length > 0) {
            copyToClipboard(selected.join('\n'), `✅ ${selected.length} gefundene Links kopiert!`);
        } else {
            showToast('Keine Links ausgewählt', '⚠️');
        }
    }

    function makeDraggable(element, handle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        handle.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    // Initialize GUI when DOM ready
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initGUI);
    } else {
        initGUI();
    }
})();
