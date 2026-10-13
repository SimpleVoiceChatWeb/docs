---
title: SimpleVoiceChatWeb
description: SimpleVoiceChatWeb - documentation for the Minecraft voice chat bridge system
lead: Welcome to the official SimpleVoiceChatWeb documentation - the bridge between the Minecraft Simple Voice Chat mod and WebRTC browser clients.
---

> **Alpha:** This documentation and the whole system are in active
> development. Guides and behavior may change - when in doubt the code wins,
> please report bugs as an
> [issue](https://github.com/SimpleVoiceChatWeb/issues).

## What is SimpleVoiceChatWeb?

SimpleVoiceChatWeb is a bridge between the **Simple Voice Chat Minecraft mod**
and **WebRTC browser clients**. It lets players without the mod join voice
chat from the browser - with real SVC groups, mute symbols and commands.

### Stats

- **0 €** hosting costs (GitHub Pages, no relay server)
- **48 kHz** Opus audio quality
- **2** transports (direct WebSocket + PeerJS behind NAT)

### Quick Actions

- [To the quickstart](quickstart.html) - Voice chat in 5 minutes
- [Understand the architecture](architecture.html) - Deep dive into the system

## Architecture overview

```
Browser <── WebRTC/DTLS/SRTP ──> Plugin <── SVC-API ──> Minecraft players
```

No browser-to-browser connections, no audio relay outside the Minecraft
server. The plugin translates between WebRTC audio and Simple Voice Chat.

::: cards
### Real SVC groups

Browser groups are real SVC groups: mod players see and join them, with password protection and types like in the mod.

### QR invite

`/voice link` puts a map QR in your hand - right-click opens the invite link, no third-party plugin needed.

### Mute with symbol

Browser mute is enforced server-side, deafen shows mod players the full-mute symbol like the mod.

### Own commands

`/voicechat invite/join/leave/test` for browser players, with mod fallback for mod players.
:::

## Tech overview

| Component | Technology | Purpose |
|------------|-------------|-------|
| **Plugin** | Kotlin, Java 21, Paper 26.2 | Opus translation, groups, presence |
| **Webend** | Vue 3 + Vite + TypeScript | Browser client (voice, channels, settings) |
| **Signaling** | Netty `wss://`, PeerJS | Two transports, one protocol |
| **Audio** | Opus 48 kHz mono 20 ms | WebRTC standard, ~64 kbps |
| **Docs** | Markdown → static HTML | These pages, agents read the `.ai.md` sources |

## Project structure

```
SimpleVoiceChatWeb/
├── plugin/           # Paper plugin (Kotlin): svc/, peerjs/, signaling/, qr/, config/
├── webend/           # Vue 3 frontend: voice/, signaling/, stores/, webrtc/, audio/
├── webend/docs/      # These docs: *.ai.md sources, build with node scripts/build.js
└── TestMCServer/     # Local Paper test server (ports 25565/24454)
```

## Quick access

::: cards
### Quickstart

Voice chat running in 5 minutes - install the plugin, generate a code, connect.

### Architecture

Deep dive into the data flows: WebRTC ↔ plugin ↔ SVC, presence, groups, sessions.

### PeerJS & TURN

When the direct connection is not enough: signaling, STUN, TURN relay.

### Deployment

Production setup: build the plugin, test server, GitHub Pages, ports.

### API Reference

The real wire protocol: messages, group payloads, error codes.

### Configuration

All `config.yml` options with real defaults plus build variables.
:::

## Links & resources

- [Open the web app](https://simplevoicechatweb.github.io) (new tab)
- [GitHub organization](https://github.com/SimpleVoiceChatWeb)
- [Main repository](https://github.com/SimpleVoiceChatWeb/SimpleVoiceChatWeb)
- [Issues & support](https://github.com/SimpleVoiceChatWeb/issues)
