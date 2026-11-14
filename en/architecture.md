---
title: Architecture
description: Deep dive into the SimpleVoiceChatWeb architecture - bridge between Simple Voice Chat and WebRTC.
lead: How the browser becomes a full Simple Voice Chat client - no mod, no relay.
---

## Topology (by design)

```
Browser <── WebRTC/DTLS/SRTP ──> Plugin <── SVC-API ──> Minecraft players
```

There are **no** browser-to-browser audio connections and **no** central
audio relay outside the Minecraft server. The plugin translates between
WebRTC audio and Simple Voice Chat. Everything Simple Voice Chat can do
(groups, range, volume) comes from SVC - nothing is rebuilt.

## Two transports

| Transport | Path | For |
|-----------|-----|-------|
| Direct WebSocket | Browser ↔ own `wss://…/signaling` endpoint from `web.signalingUrl` | Direct mode: signaling + WebRTC with the plugin; set in the invite via `?ws=` |
| PeerJS | Browser + plugin dial out to `0.peerjs.com:443` | Invite path (`/voice link`) without `ws`: only outbound connections needed, ideal behind NAT |

Both transports speak the same message protocol (including `requestId`
correlation IDs and group messages). Both may be active at the same time. The
invite link decides which one is used: a valid `ws` parameter takes precedence
over PeerJS; if it is missing or invalid, the client uses PeerJS with a valid
10-character code. The client shows the target host before it connects. See [API Reference](api.html) and
[PeerJS & TURN](peerjs.html).

## Components

| Component | Tech | Purpose |
|------------|---------|-------|
| `SvcBridge` | Kotlin, SVC API | Opus translation WebRTC ↔ SVC, mute gate, latency measurement |
| `BrowserPresenceBridge` | SVC `PlayerStateManager` | Register browser as voicechat connection, broadcast mute symbols |
| `SvcGroupService` | Real SVC group API | Real SVC groups (normal/open/isolated), counts from SVC connections |
| `PeerJsVoiceRuntime` + `PeerJsWebRtcBridge` | PeerJS, WebRTC engine | Invite sessions, groups over data channel |
| `SignalingHandler` (Netty) | WebSocket `wss://` | Direct path: signaling, WebRTC, groups |
| `SingleSessionGuard` | Per player UUID | Exactly one bridge session per player |
| `InviteMapService` + ZXing | Minecraft maps | QR invite as map in hand |
| `WebVoicechatCommand` | Bukkit commands | `/voicechat` for browser players, mod fallback for mod players |
| Webend | Vue 3 + Vite + TypeScript | Browser client (voice, channel and settings UI) |

## Data flow

### Browser → Minecraft (outgoing audio)

1. Browser: microphone → Opus (48 kHz mono, 20 ms) → SRTP
2. Plugin: receive → `SvcBridge.injectPcmFromWebRtc` → Opus → `LocalAudioChannel`
3. SVC distributes to everyone who hears the player (group + distance)

When the browser is muted, the `WebMuteGate` drops the frames server-side -
no matter what the client sends.

### Minecraft → Browser (incoming audio)

1. SVC: `MicrophonePacketEvent` per speaker
2. Plugin: extract Opus → forward to eligible WebRTC peers
3. Browser: decode → one gain per peer → mixer → speakers

A deafened browser gets no frames (dropped before decoding).

## Mute and deafen across the boundary

- **Browser mutes itself:** message over data channel/signaling → `WebMuteGate`
  blocks the audio flow. Mod players no longer hear them.
- **Browser deafens itself:** additionally `PlayerState.disabled` + broadcast -
  mod players see the full-mute symbol, like with the mod.
- **Visibility:** `BrowserPresenceBridge` registers a real
  `VoicechatConnection` for the browser, so it shows in the mod group list
  with a microphone symbol instead of "disconnected".

## Groups

Browser groups **are** SVC groups (`GroupService` uses `createGroup`,
`groupBuilder`, `setGroup`). Mod players see and join them. Joining with a
password is supported (`hasPassword` lock in the channel UI, error codes for
"needed" vs. "wrong"). SVC limits group names to **16 characters**. The webend
list polls every 5 seconds.

## Sessions and security

- One code = one session (`/voice link` codes are single-use, 5 minute TTL).
  In direct mode the first `join` spends the code - within 60 seconds of
  `verify`.
- One bridge per player (`SingleSessionGuard`); a second code closes the old
  session instead of failing. Quit frees immediately.
- OP gate: no `/voice link` without OP (hint at the mod), `/voice link
  force` unlocks once.
- JWT (HS256) with `voice` scope for the WebSocket path; `verify` returns a
  session token with TTL `auth.jwtTtlSeconds` (default 24 h). Reconnects with
  the same token are allowed until it expires.
- Rate limit: 5 codes/minute/player for `/voice link`; the `verify` limit in
  direct mode is separate at 10/minute per client IP.
- An empty `auth.jwtSecret` is generated **ephemerally** per start - a restart
  ends all sessions. Set a fixed value for persistence.

## Audio specs

| Parameter | Value |
|-----------|------|
| Codec | Opus |
| Sample rate | 48 kHz |
| Channels | 1 (mono) |
| Frame | 20 ms (960 samples) |
| Bitrate | ~64 kbps (`maxaveragebitrate=64000`, FEC, DTX) |

## Network ports

| Port | Protocol | Purpose |
|------|-----------|-------|
| 25565 | TCP | Minecraft game |
| 24454 | TCP | WebSocket signaling (`wss://`) |
| 24454 | UDP | SVC voice (mod players only) |
| short-lived UDP ports | UDP (outbound) | browser audio over WebRTC |
| 443 | TCP (outbound) | PeerJS signaling (`0.peerjs.com`) |

The browser only talks to the plugin over TCP (signaling) and then directly via WebRTC. Voice packets use ports negotiated by libwebrtc; no inbound rule is needed for them as long as the return path stays open through conntrack.
