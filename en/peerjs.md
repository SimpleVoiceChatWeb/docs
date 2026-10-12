---
title: PeerJS & TURN
description: PeerJS signaling, STUN/TURN and the SimpleVoiceChatWeb network model.
lead: PeerJS Cloud is signaling only - audio runs directly between browser and plugin.
---

The Minecraft server accepts no incoming browser connections. For the invite
path, **both sides dial out** to PeerJS Cloud (`0.peerjs.com:443`). After the
handshake, WebRTC attempts a direct connection between browser and plugin.
PeerJS relays **no audio**.

## Plugin

Enable the outbound PeerJS client in `config.yml`:

```hocon
peerjs {
  enabled = true
  scheme = "wss"
  host = "0.peerjs.com"
  port = 443
  path = "/"
  key = "peerjs"
  token = ""
}
```

Every `/voice link` command creates a new 10-character PeerJS invite ID,
stores it locally with the player identity, and registers one outbound PeerJS
peer. The ID is used once, then the peer is closed. With an empty `token` the
plugin generates a random signaling token. The client sends a `HEARTBEAT`
every 5 seconds, because PeerJS Cloud otherwise closes inactive sockets.

## GitHub Pages build

The PeerServer values come from the build variables `VITE_PEERJS_HOST`,
`VITE_PEERJS_PORT`, `VITE_PEERJS_PATH`, `VITE_PEERJS_SECURE` and
`VITE_PEERJS_KEY` (see [Deployment](deployment.html)). The target peer ID is
**not** a build setting: it is inside the invite code itself (e.g.
`K7P4QX9LM2`). One static Pages build therefore connects any number of
Minecraft servers.

## Network model

Browser and plugin connect outbound to `0.peerjs.com:443`. After the PeerJS
handshake, WebRTC attempts a direct STUN-assisted connection. PeerJS Cloud
does **not** replace a TURN server: symmetric NAT or restrictive firewalls can
still prevent the direct connection.

## STUN and TURN

The browser defaults to one STUN server (`stun:stun.l.google.com:19302`).
STUN only discovers a candidate's public address, it relays no media. That is
enough while browser and Minecraft host reach each other directly - the normal
case for a home server and a regular connection.

Symmetric NAT, some corporate firewalls and mobile/CGNAT networks break this
assumption. Symptom: the PeerJS connection reports `connected` in signaling,
but the WebRTC media path never forms, and the browser diagnostics log stops
after the local ICE candidates.

For a relay, pass additional ICE servers to the voice connection (`iceServers`
option in `PeerJsVoiceConnection`, defaulting to the STUN defaults from
`IceManager`). Browser **and** plugin must reach the TURN server, on the
plugin via [configuration](configuration.html) (`turn.*`):

```ts
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:turn.example.com:3478',
    username: 'svc-web',
    credential: '<shared secret>',
  },
]
```

TURN costs latency and bandwidth because all audio runs through the TURN
server - prefer direct connections, TURN only as fallback. The TURN server is
the only component that must scale with concurrent browser sessions; run it
separately from the Minecraft server so a relay outage doesn't take voice
chat down with it.
