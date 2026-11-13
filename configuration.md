---
title: Konfiguration
description: Vollständige Referenz aller Konfigurationsoptionen für Plugin und Webend.
lead: Alle Schalter an einem Ort - mit echten Defaults aus dem Code, nicht geraten.
---

## Plugin-Config (`config.yml`)

Datei: `plugins/SimpleVoiceChatWeb/config.yml` (HOCON). Fehlt sie, wird sie mit Defaults angelegt. Umgebungsvariablen mit Präfix `SVCWEB_` überschreiben Dateiwerte, z. B. `SVCWEB_WEB_PORT=24455` → `web.port`. Nach Änderungen neu starten - kein Hot-Reload.

Hier stehen nur Optionen, die das Plugin tatsächlich liest. Alles andere in einer älteren Datei wird ignoriert.

### Allgemein

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `debug` | `false` | Ausführliches WebRTC-Logging |
| `configDir` | `"."` | Basisverzeichnis für die Keystore-Suche |
| `development` | `true` | Selbstsigniertes Zertifikat erlauben, wenn kein Keystore existiert |

### Web und TLS

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `web.host` | `"0.0.0.0"` | Bind-Adresse des Signaling-Servers |
| `web.port` | `24454` | TCP-Signaling (Browser); der UDP-Sprachport gehört SVC |
| `web.tlsTerminatedExternally` | `false` | `true` = Reverse Proxy beendet TLS |
| `tls.keystorePassword` | `""` | Keystore-Passwort - besser `SVCWEB_TLS_KEYSTORE_PASSWORD` |

### Auth

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `auth.codeTtlSeconds` | `300` | Gültigkeit des Einladungscodes (Sekunden) |
| `auth.jwtTtlSeconds` | `86400` | Gültigkeit des JWT (Sekunden) |
| `auth.jwtSecret` | `""` | HS256-Secret - fester Wert erhält Sitzungen über Neustarts |

### PeerJS

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `peerjs.enabled` | `false` | Ausgehenden PeerJS-Client aktivieren (Invite-Pfad) |
| `peerjs.scheme` | `"wss"` | `wss` oder `ws` |
| `peerjs.host` | `"0.peerjs.com"` | PeerServer-Host |
| `peerjs.port` | `443` | PeerServer-Port |
| `peerjs.path` | `"/"` | PeerServer-Pfad |
| `peerjs.key` | `"peerjs"` | PeerServer-Key |
| `peerjs.token` | `""` | Leer = zufälliges Signaling-Token |

### TURN

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `turn.enabled` | `false` | TURN-Relay für restriktive Netze |
| `turn.urls` | leer | TURN-Server-URLs, z. B. `turn:turn.example.org:3478` |
| `turn.username` | `""` | TURN-Benutzername |
| `turn.credential` | `""` | TURN-Passwort |

Ältere Versionen schrieben Optionen wie `web.corsAllowedOrigins`, `webrtc.port`, `svc.*`, `audio.*`, `mode`, `webhooks.*`, `logging.*` und `resourcePack*`. Das Plugin ignoriert sie heute; der [Config-Editor](tools.html) entfernt sie beim Laden.

Secrets gehören in die Umgebung, nicht in die Datei. Für `tls.keystorePassword` die Env-Variante nutzen; `auth.jwtSecret` darf leer bleiben und wird beim Start erzeugt.

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

Die Einstellungsseite speichert alles. Wirklich verdrahtet sind
Echo-Unterdrückung, Rauschunterdrückung und automatische Verstärkung
(browser-nativ, ab dem **nächsten Verbinden**), die Ausgabe-Lautstärke am
Mixer und **Push-to-Talk**: Taste gedrückt halten, dann ist das Mikrofon
offen (Standard **V**, im Feld umstellbar; gespeichert wird die
Tastenposition). Der Mikrofon-Knopf schaltet zusätzlich stumm und gewinnt
immer. Nicht verdrahtet und deshalb als "Bald verfügbar" markiert sind
Mikrofon-Lautstärke, Rauschstärke, 3D-Audio und die
Sprachaktivierungs-Schwelle.
