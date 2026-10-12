---
title: API Reference
description: SimpleVoiceChatWeb signaling protocol, group messages and TypeScript interfaces.
lead: The real wire protocol - verified against the code, not guessed.
---

## Signaling protocol (WebSocket)

WebSocket endpoint: `wss://<host>:24454/signaling`. JSON messages with
correlation ID - the browser **drops every group answer without `requestId`**,
the server echoes it on both transports. Group requests run into a visible
timeout after 8 seconds.

### Message types

| Type | Direction | Purpose |
|-----|----------|-------|
| `join` / `joined` | both | Join + confirmation with peer info |
| `offer` / `answer` / `ice-candidate` | both | WebRTC signaling |
| `mute` (`{muted}`) | both | Microphone state, enforced server-side |
| `deafen` (`{deafened}`) | both | Full-mute symbol for mod players |
| `volume` | both | Volume |
| `position` (`x/y/z/yaw/pitch`) | both | 3D position for spatial audio |
| `group-list` / `group-create` / `group-delete` / `group-join` / `group-leave` | Client → Server | Group operations |
| `group-created` / `group-joined` / `group-left` / `group-list` | Server → Client | Answers (always with `requestId`) |
| `leave` | both | Leave connection/group |
| `ping` / `pong` | both | Keepalive (PeerJS additionally `HEARTBEAT` every 5 s) |
| `error` (`code`, `message`) | Server → Client | Real reason instead of timeout |

### Error codes

| Code | Meaning |
|------|-----------|
| `1000` | Generic (format, unknown type, WebRTC not ready) |
| `1001` | Not authenticated |
| `1004` | No player on this connection / unknown group |
| `1005` | Group needs a password (open dialog) |
| `1006` | Wrong password (keep dialog open) |
| `1009` | Token invalid or expired |
| `1010` | Token without `voice` scope |

### Group payloads

```json
// Join, only send password when there is one
{ "type": "group-join", "payload": { "id": "<uuid>" } }
{ "type": "group-join", "payload": { "id": "<uuid>", "password": "..." } }

// Answer carries GroupInfo directly, list as {groups: [...]}
{ "type": "group-joined", "requestId": "...",
  "payload": { "id": "<uuid>", "name": "...", "hasPassword": false } }
```

SVC limits group names to **16 characters** (longer ones are silently cut).
Types like in the mod: `normal`, `open`, `isolated`.

## TypeScript interfaces (webend, abbreviated)

```typescript
interface BaseSignalingMessage<T, P> {
  type: T;
  payload: P;
  from?: string;
  to?: string;
  roomId?: string;
  timestamp?: number;
}

interface JoinPayload {
  token: string;
  roomId: string;
  displayName: string;
}

interface MutePayload { muted: boolean }
interface DeafenPayload { deafened: boolean }

interface PositionPayload {
  x: number; y: number; z: number;
  yaw: number; pitch: number;
}
```

Complete in `webend/src/signaling/types.ts` (with `is*Payload` guards and
`create*Message` factories).

## Plugin side (Kotlin, overview)

- `SvcBridge.injectPcmFromWebRtc`: WebRTC audio → SVC, with mute gate and
  latency measurement (debug log every 50 frames).
- `BrowserPresenceBridge`: registers a real `VoicechatConnection` and
  broadcasts `PlayerState.disabled` for the full-mute symbol.
- `ActualVoicechatApi.setReceiverSilencer`: per-receiver filter over
  `StaticSoundPacketEvent` - a muted browser is silent for exactly that mod
  player.
- `SvcGroupService`: real SVC group API, counts from SVC connections across
  all worlds (distance-independent).

## Chat and game commands

Browser messages run `Player.chat`, commands run `Player.performCommand`. The
chat panel mirrors server messages and command answers; player chat arrives
via `AsyncChatEvent`, system chat via ProtocolLib. See
[Quickstart](quickstart.html) for the command list.
