---
title: Deployment
description: Produktionsreifes Deployment von SimpleVoiceChatWeb - Plugin, Webend und Dokumentation.
lead: Plugin bauen, Server starten, Ports freigeben - Schritt für Schritt für den eigenen Server.
---

## Self-Hosting

Diese Seite beschreibt, wie du SimpleVoiceChatWeb auf deinem eigenen Server betreibst: Plugin bauen, Ports freigeben, Web-Client ausliefern. Der Web-Client ist eine statische Seite und läuft hinter jedem beliebigen Webserver.

Die öffentliche Instanz des Projekts läuft auf GitHub Pages: Landing unter `/`, Web-Client unter `/app/` und diese Doku unter `/docs/`.

Der Web-Client und diese Doku setzen voraus, dass sie im **Wurzelpfad** der Domain liegen (`/`, `/app/`, `/docs/`, `/tools/`). Ein Betrieb unter einem Unterpfad wie `/voice/` wird nicht unterstützt.

Für das Front-Modul gibt es ein Site-Bundle, das Landing, App, Doku und Tools in einem Verzeichnis bündelt; ohne gesetzte Site-URL entfallen Canonical- und OG-Tags.

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
ufw allow 24454/tcp   # WebSocket-Signaling (Browser)
ufw allow 24454/udp   # SVC-Sprache (nur Mod-Spieler)
ufw enable
```

> **Tipp:** Ports immer von einem **externen Netzwerk** testen
> (Handy-Hotspot), nicht vom Server selbst! `24454/tcp` ist Pflicht, sobald
> Browser mitsprechen; die UDP-Regel nur, wenn Mod-Spieler dabei sind.

### Direktmodus hinter Reverse Proxy

Beendet ein Reverse Proxy TLS, `web.tlsTerminatedExternally=true` setzen und
im Link `wss://…` verwenden (`web.signalingUrl`), damit eine HTTPS-Seite den
Endpunkt erreicht. Der Proxy muss `X-Forwarded-For` setzen und auf derselben
Maschine laufen (Verbindung über Loopback) - sonst greift das
`verify`-Rate-Limit pro Proxy-IP statt pro Client.

## Umgebungsvariablen

Jede Option lässt sich mit Präfix `SVCWEB_` und dem Großbuchstaben-Pfad überschreiben (Punkte werden zu Unterstrichen):

| Variable | Beschreibung |
|----------|--------------|
| `SVCWEB_WEB_PORT` | Beispiel: `web.port` |
| `SVCWEB_AUTH_JWT_SECRET` | Festes JWT-Secret statt Auto-Erzeugung |
| `SVCWEB_TLS_KEYSTORE_PASSWORD` | Keystore-Passwort, hat Vorrang vor der Datei |
