---
title: Configuration
description: Complete reference of all configuration options for plugin and webend.
lead: Every switch in one place - with real defaults from the code, not guessed.
---

## Plugin config (`config.yml`)

File: `plugins/SimpleVoiceChatWeb/config.yml` (HOCON). If missing, it is
created with defaults. Environment variables with the `SVCWEB_` prefix
override file values, e.g. `SVCWEB_WEB_PORT=24455` → `web.port`. Restart after
changes - there is no hot-reload.

### Web, auth and PeerJS

| Option | Default | Description |
|--------|---------|--------------|
| `web.enabled` | `true` | Enable web module |
| `web.host` | `"0.0.0.0"` | Signaling server bind address |
| `web.port` | `24454` | Signaling port (TCP, `wss://`) |
| `web.corsAllowedOrigins` | Pages + `localhost:3000` | Allowed origins, must not be empty |
| `web.portShareWithSvc` | `true` | Share port with SVC |
| `web.tlsTerminatedExternally` | `false` | `true` = reverse proxy handles TLS |
| `web.maxParticipants` | `50` | Max participants |
| `web.staticDir` | `"web"` | Static files |
| `auth.codeTtlSeconds` | `300` | Link code validity (seconds) |
| `auth.jwtTtlSeconds` | `86400` | JWT validity (seconds) |
| `auth.jwtSecret` | `""` | HS256 secret - empty = auto-generated on startup |
| `auth.joinLinkBaseUrl` | Pages URL | Base for invite links (`?code=...`) |
| `peerjs.enabled` | `false` | Enable outbound PeerJS client (invite path) |
| `peerjs.scheme/host/port/path/key` | `wss` / `0.peerjs.com` / `443` / `/` / `peerjs` | PeerServer connection |
| `peerjs.token` | `""` | Empty = random signaling token |

### SVC, audio, TURN

| Option | Default | Description |
|--------|---------|--------------|
| `svc.enabled` | `true` | SVC integration |
| `svc.mirrorGroups` | `true` | Mirror groups with SVC |
| `svc.positionalAudio` | `true` | Positional audio |
| `svc.showWebPlayersInSvc` | `true` | Show browser in mod lists |
| `svc.simulateMicrophone` | `false` | Tests only |
| `audio.minDistance` | `1.0` | Full volume up to distance (blocks) |
| `audio.maxDistance` | `50.0` | Silent beyond distance (blocks) |
| `turn.enabled` | `false` | TURN relay (see [PeerJS & TURN](peerjs.html)) |
| `turn.urls` / `turn.username` / `turn.credential` | empty | Required when `turn.enabled` |

### Operations

| Option | Default | Description |
|--------|---------|--------------|
| `mode` | `"PUBLIC"` | `PUBLIC` or `PRIVATE` |
| `private.enabled` | `false` | Private mode |
| `logging.level` | `"INFO"` | `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR` |
| `logging.logSvcPackets` | `false` | Capture SVC packets (loud!) |
| `logging.logWebsocketMessages` | `false` | Capture WebSocket messages (loud!) |
| `webhooks.enabled/url/events/secret` | off | Webhook notifications |
| `distribution.bundleWebClient` | `false` | Ship web client along |
| `development` | `true` | Allow self-signed certificates |
| `tls.keystorePassword` | `""` | Keystore password (prefer env) |
| `debug` | `false` | Debug mode |
| `language` | `"de_DE"` | Language |

> **Note:** `webrtc.port` (default `24455`) is in the config but currently
> unused - a leftover. The PeerJS media path needs no inbound port.

Keep secrets in the environment, not in the file. `auth.jwtSecret` may stay
empty (auto-generation); use the env variant for `tls.keystorePassword`.

## Webend build variables

File: `webend/.env` (never commit!). Public PeerServer values for the Pages
build, see [Deployment](deployment.html):

```bash
VITE_PEERJS_HOST=0.peerjs.com
VITE_PEERJS_PORT=443
VITE_PEERJS_PATH=/
VITE_PEERJS_SECURE=true
VITE_PEERJS_KEY=peerjs
```

Without these variables the PeerJS cloud defaults apply. No fixed token is
written into the build - the target peer ID is inside the invite code.

## Browser settings (honesty)

The settings page stores everything, but only three switches really work
(browser-native, effective on **next connect**): echo cancellation, noise
suppression, automatic gain. The rest (microphone and output volume, noise
level, 3D audio, push-to-talk, threshold) is marked "coming soon" until wired.
Volume currently lives on the mixer in the voice tab.
