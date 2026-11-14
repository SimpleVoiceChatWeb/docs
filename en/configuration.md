---
title: Configuration
description: Complete reference of all configuration options for plugin and webend.
lead: Every switch in one place - with real defaults from the code, not guessed.
---

## Plugin config (`config.yml`)

File: `plugins/SimpleVoiceChatWeb/config.yml` (HOCON). If missing, it is created with defaults. Environment variables with the `SVCWEB_` prefix override file values, e.g. `SVCWEB_WEB_PORT=24455` → `web.port`. Restart after changes - there is no hot-reload.

Only options that the plugin actually reads are listed here. Anything else in an older file is ignored.

### General

| Option | Default | Description |
|--------|---------|--------------|
| `debug` | `false` | Verbose WebRTC logging |
| `configDir` | `"."` | Base directory for the TLS keystore lookup |
| `development` | `true` | Allow a self-signed certificate when no keystore exists |

### Web and TLS

| Option | Default | Description |
|--------|---------|--------------|
| `web.host` | `"0.0.0.0"` | Signaling server bind address |
| `web.port` | `24454` | TCP signaling (browser); the UDP voice port belongs to SVC |
| `web.tlsTerminatedExternally` | `false` | `true` = reverse proxy handles TLS |
| `web.clientUrl` | `"https://SimpleVCWeb.github.io/app/"` | Base URL of the web client for invite links and QR codes; no query or fragment |
| `web.signalingUrl` | `""` | Full WebSocket URL for direct mode (e.g. `wss://voice.example.com/signaling`); empty = invites without a `ws` parameter |
| `tls.keystorePassword` | `""` | Keystore password - prefer `SVCWEB_TLS_KEYSTORE_PASSWORD` |

Invite links have the form `<web.clientUrl>?code=<10 characters>`; when `web.signalingUrl` is set, the plugin appends `&ws=<URL-encoded WebSocket URL>`.

### Auth

| Option | Default | Description |
|--------|---------|--------------|
| `auth.codeTtlSeconds` | `300` | Invite code validity (seconds) |
| `auth.jwtTtlSeconds` | `86400` | JWT validity (seconds) |
| `auth.jwtSecret` | `""` | HS256 secret - set a fixed value to keep sessions across restarts |

### Modules

| Option | Default | Description |
|--------|---------|-------------|
| `modules.enabled` | `[]` | Modules that may be enabled; currently only front. An unknown name is only logged. |

The module jars must be placed in `plugins/` manually for now; automatic loading/downloading will follow later.

### PeerJS

| Option | Default | Description |
|--------|---------|--------------|
| `peerjs.enabled` | `true` | Enabled by default; `false` turns off the PeerJS invite path |
| `peerjs.scheme` | `"wss"` | `wss` or `ws` |
| `peerjs.host` | `"0.peerjs.com"` | PeerServer host |
| `peerjs.port` | `443` | PeerServer port |
| `peerjs.path` | `"/"` | PeerServer path |
| `peerjs.key` | `"peerjs"` | PeerServer key |
| `peerjs.token` | `""` | Empty = random signaling token |

With `peerjs.enabled=true`, invite codes are brokered through the configured PeerServer (default `0.peerjs.com`); to avoid that, set `peerjs.enabled=false` and use direct mode via `web.signalingUrl`.

### TURN

| Option | Default | Description |
|--------|---------|--------------|
| `turn.enabled` | `false` | TURN relay for restrictive networks |
| `turn.urls` | empty | TURN server URLs, e.g. `turn:turn.example.org:3478` |
| `turn.username` | `""` | TURN username |
| `turn.credential` | `""` | TURN password |

Older releases wrote options such as `web.corsAllowedOrigins`, `webrtc.port`, `svc.*`, `audio.*`, `mode`, `webhooks.*`, `logging.*` and `resourcePack*`. The plugin ignores them today, and the [config editor](tools.html) removes them on load.

Keep secrets in the environment, not in the file. Use the env variant for `tls.keystorePassword`; `auth.jwtSecret` may stay empty and is generated at startup.

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

The settings page stores everything. Actually wired are echo cancellation,
noise suppression and automatic gain (browser-native, effective on **next
connect**), the output volume on the mixer, and **push-to-talk**: hold the
key and the microphone is open (default **V**, changeable in the field; the
key position is stored, not the character). The microphone button still
mutes on top of it and always wins. Not wired and therefore marked "coming
soon": microphone volume, noise level, 3D audio and the voice activation
threshold.
