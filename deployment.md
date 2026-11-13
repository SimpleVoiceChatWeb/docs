---
title: Deployment
description: Produktionsreifes Deployment von SimpleVoiceChatWeb - Plugin, Webend und Dokumentation.
lead: Plugin bauen, Server starten, Ports freigeben - Schritt für Schritt für den eigenen Server.
---

## Self-Hosting

Diese Seite beschreibt, wie du SimpleVoiceChatWeb auf deinem eigenen Server betreibst: Plugin bauen, Ports freigeben, Web-Client ausliefern. Der Web-Client ist eine statische Seite und läuft hinter jedem beliebigen Webserver.

Die öffentliche Instanz des Projekts läuft auf GitHub Pages: Landing unter `/`, Web-Client unter `/app/` und diese Doku unter `/docs/`.

## Ports und Firewall

| Port | Protokoll | Zweck |
|------|-----------|-------|
| 25565 | TCP | Minecraft Game |
| 24454 | TCP | WebSocket-Signaling (`wss://`) |
| 24454 | UDP | SVC Voice |
| 443 | TCP (ausgehend) | PeerJS-Signalisierung |

```bash
# UFW Beispiel
ufw allow 25565/tcp   # Minecraft
ufw allow 24454/tcp   # WebSocket Signaling
ufw allow 24454/udp   # SVC Voice
ufw enable
```

> **Tipp:** Ports immer von einem **externen Netzwerk** testen
> (Handy-Hotspot), nicht vom Server selbst!

## Umgebungsvariablen

Jede Option lässt sich mit Präfix `SVCWEB_` und dem Großbuchstaben-Pfad überschreiben (Punkte werden zu Unterstrichen):

| Variable | Beschreibung |
|----------|--------------|
| `SVCWEB_WEB_PORT` | Beispiel: `web.port` |
| `SVCWEB_AUTH_JWT_SECRET` | Festes JWT-Secret statt Auto-Erzeugung |
| `SVCWEB_TLS_KEYSTORE_PASSWORD` | Keystore-Passwort, hat Vorrang vor der Datei |
