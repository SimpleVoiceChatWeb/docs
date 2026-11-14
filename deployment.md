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

## Front-Modul

`SimpleVoiceChatWebFront` ist ein optionales Paper-Plugin, das das Site-Bundle selbst ausliefert und TLS beendet. Es ist ein eigenes Jar, damit der Core klein bleibt und ohne das Modul läuft.

### Installation

1. `SimpleVoiceChatWebFront-<version>.jar` nach `plugins/` kopieren.
2. In `plugins/SimpleVoiceChatWeb/config.yml` den Namen `front` zu `modules.enabled` hinzufügen:

```yaml
modules {
  enabled = ["front"]
}
```

3. Server neu starten. Beim ersten Start legt das Modul `plugins/SimpleVoiceChatWebFront/config.yml` mit Defaults an.

Zum Deaktivieren `front` aus `modules.enabled` entfernen und neu starten. Das Jar darf in `plugins/` bleiben: Das Plugin wird geladen, bindet aber keine Ports. Erst das Löschen des Jars entfernt es vollständig.

### Site-Bundle

Das Modul liefert das Site-Bundle aus dem Jar: Landing unter `/`, Web-Client unter `/app/`, Doku unter `/docs/`, Tools unter `/tools/`. Das Bundle wird beim Build mit `SVCWEB_WEB_ASSETS_ZIP=<Pfad>` (oder `-PwebAssetsZip=<Pfad>`) eingebettet. Ohne eingebettete Assets antwortet das Modul mit `503`; alternativ ein entpacktes Bundle nach `plugins/SimpleVoiceChatWebFront/web/` legen und `static.bundle` auf dieses Verzeichnis setzen.

Das Bundle setzt den Wurzelpfad der Domain voraus (`/`, `/app/`, `/docs/`, `/tools/`). Ein Unterpfad wie `/voice/` wird nicht unterstützt.

### TLS

Browser geben das Mikrofon nur in einem Secure Context frei; selbstsignierte Zertifikate reichen nicht. Verwende ein Zertifikat einer öffentlichen CA, zum Beispiel von deinem Hosting-Anbieter.

- Keystore: PKCS12 unter `plugins/SimpleVoiceChatWebFront/tls/keystore.p12` (oder `https.keystore`, relativ zum Datenordner des Moduls).
- Passwort: `SVCWEB_FRONT_KEYSTORE_PASSWORD` hat Vorrang vor `https.keystorePassword`.
- Erneuerung: Keystore-Datei ersetzen. Das Modul lädt sie beim nächsten Handshake neu, ohne Neustart.
- Ports: `https.port` (Default `443`) und, mit `https.redirectHttp`, `acme.httpPort` (Default `80`) für die HTTP→HTTPS-Weiterleitung.

Mit `https.enabled=false` liefert das Modul normales HTTP auf `https.port`, etwa hinter einem externen TLS-Terminator in einem privaten Netz.

`GET /healthz` liefert JSON mit `status`, `static`, `https`, `cert` (Ablauf des Zertifikats) und `bundle` (Bundle-Commit, wenn bekannt).

### Konfiguration

Datei: `plugins/SimpleVoiceChatWebFront/config.yml` (HOCON). Aufgeführt sind nur Optionen, die das Modul liest.

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `enabled` | `true` | Modul überhaupt starten |
| `https.enabled` | `true` | TLS im Modul beenden |
| `https.host` | `"0.0.0.0"` | Bind-Adresse |
| `https.port` | `443` | HTTPS-Port (normaler HTTP-Port, wenn TLS aus ist) |
| `https.keystore` | `"tls/keystore.p12"` | PKCS12-Keystore, relativ zum Datenordner |
| `https.keystorePassword` | `""` | Keystore-Passwort - besser die Umgebungsvariable |
| `https.redirectHttp` | `true` | HTTP auf dem zweiten Listener auf HTTPS umleiten |
| `https.hsts` | `true` | `Strict-Transport-Security` senden |
| `acme.httpPort` | `80` | HTTP-Listener für die Weiterleitung (später auch ACME-Challenge-Port) |
| `static.enabled` | `true` | Site-Bundle ausliefern |
| `static.bundle` | `"classpath"` | `classpath` oder ein Verzeichnis mit dem Bundle |
| `static.root` | `"web"` | Unterverzeichnis im Bundle (Classpath-Präfix oder Pfad unter `static.bundle`) |
| `static.landingRedirect` | `"/app/"` | Weiterleitung für `/`; leer liefert `index.html` |
| `static.spaFallback` | `true` | `/app/*` und `/tools/*` fallen auf ihre `index.html` zurück |

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
