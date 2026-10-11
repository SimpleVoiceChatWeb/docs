---
title: Konfiguration
nav: Konfiguration
description: Vollständige Referenz aller Konfigurationsoptionen für Plugin und Webend.
lead: Alle Schalter an einem Ort - mit echten Defaults aus dem Code, nicht geraten.
---
# Konfiguration

## Plugin Config (`config.yml`)

Datei: `plugins/SimpleVoiceChatWeb/config.yml` (HOCON). Fehlt sie, wird sie mit
Defaults angelegt. Umgebungsvariablen mit Prefix `SVCWEB_` überschreiben
Dateiwerte, z. B. `SVCWEB_WEB_PORT=24455` → `web.port`. Neustart nach Änderungen
nötig - Hot-Reload gibt es nicht.

### Web, Auth und PeerJS

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `web.enabled` | `true` | Web-Modul aktivieren |
| `web.host` | `"0.0.0.0"` | Bind-Adresse des Signaling-Servers |
| `web.port` | `24454` | Signaling-Port (TCP, `wss://`) |
| `web.corsAllowedOrigins` | Pages + `localhost:3000` | Erlaubte Origins, darf nicht leer sein |
| `web.portShareWithSvc` | `true` | Port mit SVC teilen |
| `web.tlsTerminatedExternally` | `false` | `true` = Reverse Proxy handhabt TLS |
| `web.maxParticipants` | `50` | Max Teilnehmer |
| `web.staticDir` | `"web"` | Statische Dateien |
| `auth.codeTtlSeconds` | `300` | Link-Code-Gültigkeit (Sekunden) |
| `auth.jwtTtlSeconds` | `86400` | JWT-Gültigkeit (Sekunden) |
| `auth.jwtSecret` | `""` | HS256-Secret - leer = wird beim Start auto-generiert |
| `auth.joinLinkBaseUrl` | Pages-URL | Basis für Invite-Links (`?code=...`) |
| `peerjs.enabled` | `false` | Ausgehenden PeerJS-Client einschalten (Invite-Pfad) |
| `peerjs.scheme/host/port/path/key` | `wss` / `0.peerjs.com` / `443` / `/` / `peerjs` | PeerServer-Anschluss |
| `peerjs.token` | `""` | Leer = zufälliges Signaling-Token |

### SVC, Audio, TURN

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `svc.enabled` | `true` | SVC-Integration |
| `svc.mirrorGroups` | `true` | Gruppen mit SVC spiegeln |
| `svc.positionalAudio` | `true` | Positions-Audio |
| `svc.showWebPlayersInSvc` | `true` | Browser in Mod-Listen zeigen |
| `svc.simulateMicrophone` | `false` | Nur für Tests |
| `audio.minDistance` | `1.0` | Volle Lautstärke bis Distanz (Blöcke) |
| `audio.maxDistance` | `50.0` | Stumm ab Distanz (Blöcke) |
| `turn.enabled` | `false` | TURN-Relay (siehe [PeerJS & TURN](peerjs.html)) |
| `turn.urls` / `turn.username` / `turn.credential` | leer | Pflicht, wenn `turn.enabled` |

### Betrieb

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `mode` | `"PUBLIC"` | `PUBLIC` oder `PRIVATE` |
| `private.enabled` | `false` | Privater Modus |
| `logging.level` | `"INFO"` | `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `logging.logSvcPackets` | `false` | SVC-Pakete mitschneiden (laut!) |
| `logging.logWebsocketMessages` | `false` | WebSocket-Nachrichten mitschneiden (laut!) |
| `webhooks.enabled/url/events/secret` | aus | Webhook-Benachrichtigungen |
| `distribution.bundleWebClient` | `false` | Web-Client mit ausliefern |
| `development` | `true` | Self-Signed-Zertifikate erlauben |
| `tls.keystorePassword` | `""` | Keystore-Passwort (besser per Env) |
| `debug` | `false` | Debug-Modus |
| `language` | `"de_DE"` | Sprache |

> **Hinweis:** `webrtc.port` (Default `24455`) steht in der Config, wird aber
> derzeit nicht benutzt - ein Überbleibsel. Der PeerJS-Medienpfad braucht
> keinen eingehenden Port.

Secrets gehören in die Umgebung, nicht in die Datei. `auth.jwtSecret` darf
leer bleiben (Auto-Generierung), für `tls.keystorePassword` die Env-Variante
nutzen.

## Webend Build-Variablen

Datei: `webend/.env` (nicht committen!). Öffentliche PeerServer-Werte für den
Pages-Build, siehe [Deployment](deployment.html):

```bash
VITE_PEERJS_HOST=0.peerjs.com
VITE_PEERJS_PORT=443
VITE_PEERJS_PATH=/
VITE_PEERJS_SECURE=true
VITE_PEERJS_KEY=peerjs
```

Ohne diese Variablen gelten die PeerJS-Cloud-Defaults. Es wird kein festes
Token in den Build geschrieben - die Ziel-Peer-ID steckt im Invite-Code.

## Browser-Einstellungen (Ehrlichkeit)

Die Einstellungsseite speichert alles, aber nur drei Schalter wirken wirklich
(browser-nativ, ab dem **nächsten Verbinden**): Echo-Unterdrückung,
Rauschunterdrückung, automatische Verstärkung. Der Rest (Mikrofon- und
Ausgabe-Lautstärke, Rauschstärke, 3D-Audio, Push-to-Talk, Schwelle) ist als
"Bald verfügbar" markiert, bis er verdrahtet ist. Die Lautstärke steht
derzeit am Mixer im Voice-Tab.
