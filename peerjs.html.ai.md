---
title: PeerJS & TURN
nav: PeerJS & TURN
description: PeerJS-Signalisierung, STUN/TURN und Netzwerkmodell von SimpleVoiceChatWeb.
lead: PeerJS Cloud ist nur Signalisierung - Audio läuft direkt zwischen Browser und Plugin.
---
# PeerJS & TURN

Der Minecraft-Server nimmt keine eingehenden Browser-Verbindungen an. Deshalb
wählen sich für den Invite-Pfad **beide Seiten ausgehend** bei PeerJS Cloud
ein (`0.peerjs.com:443`). Nach dem Handshake versucht WebRTC eine direkte
Verbindung zwischen Browser und Plugin. PeerJS relayt **kein Audio**.

## Plugin

Den ausgehenden PeerJS-Client in `config.yml` einschalten:

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

Jeder `/voice link`-Befehl erzeugt eine neue 10-stellige PeerJS-Invite-ID,
speichert sie lokal mit der Spieler-Identität und registriert einen
ausgehenden PeerJS-Peer. Die ID wird einmal benutzt, danach wird der Peer
geschlossen. Bei leerem `token` erzeugt das Plugin ein zufälliges
Signaling-Token. Der Client sendet alle 5 Sekunden einen `HEARTBEAT`, weil
PeerJS Cloud sonst inaktive Sockets schließt.

## GitHub-Pages-Build

Die PeerServer-Werte kommen aus den Build-Variablen `VITE_PEERJS_HOST`,
`VITE_PEERJS_PORT`, `VITE_PEERJS_PATH`, `VITE_PEERJS_SECURE` und
`VITE_PEERJS_KEY` (siehe [Deployment](deployment.html)). Die Ziel-Peer-ID ist
**keine** Build-Einstellung: Sie steckt im Invite-Code selbst (z. B.
`K7P4QX9LM2`). Ein statischer Pages-Build verbindet dadurch beliebig viele
Minecraft-Server.

## Netzwerkmodell

Browser und Plugin verbinden sich ausgehend mit `0.peerjs.com:443`. Nach dem
PeerJS-Handshake versucht WebRTC eine direkte STUN-unterstützte Verbindung.
PeerJS Cloud ersetzt **keinen** TURN-Server: Symmetrisches NAT oder restriktive
Firewalls können die direkte Verbindung trotzdem verhindern.

## STUN und TURN

Der Browser nutzt standardmäßig einen STUN-Server
(`stun:stun.l.google.com:19302`). STUN ermittelt nur die öffentliche Adresse
eines Kandidaten, es relayt keine Medien. Das reicht, solange Browser und
Minecraft-Host sich direkt erreichen - der Normalfall bei Homeserver und
normalem Anschluss.

Symmetrisches NAT, manche Firmen-Firewalls und Mobilfunk/CGNAT brechen diese
Annahme. Symptom: Die PeerJS-Verbindung meldet `connected` im Signaling, aber
der WebRTC-Medienpfad entsteht nie, und das Browser-Diagnose-Log stoppt nach
den lokalen ICE-Kandidaten.

Für ein Relay zusätzliche ICE-Server in die Voice-Verbindung geben (Option
`iceServers` in `PeerJsVoiceConnection`, Standard sind die STUN-Defaults aus
`IceManager`). Browser **und** Plugin müssen den TURN-Server erreichen, im
Plugin über die [Konfiguration](configuration.html) (`turn.*`):

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

TURN kostet Latenz und Bandbreite, weil alles Audio über den TURN-Server
läuft - direkte Verbindung bevorzugen, TURN nur als Fallback. Der TURN-Server
ist die einzige Komponente, die mit der Zahl gleichzeitiger Browser-Sitzungen
skalieren muss; getrennt vom Minecraft-Server betreiben, damit ein
Relay-Ausfall den Voice-Chat nicht mitnimmt.
