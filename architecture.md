---
title: Architektur
description: Deep Dive in die Architektur von SimpleVoiceChatWeb - Bridge zwischen Simple Voice Chat und WebRTC.
lead: Wie der Browser zum vollwertigen Simple-Voice-Chat-Client wird - ohne Mod, ohne Relay.
---

## Topologie (bewusst so)

```
Browser <── WebRTC/DTLS/SRTP ──> Plugin <── SVC-API ──> Minecraft-Spieler
```

Es gibt **keine** Browser-zu-Browser-Audioverbindungen und **keinen** zentralen
Audio-Relay außerhalb des Minecraft-Servers. Das Plugin übersetzt zwischen
WebRTC-Audio und Simple Voice Chat. Alles, was Simple Voice Chat kann
(Gruppen, Reichweite, Lautstärke), kommt von SVC - nichts wird nachgebaut.

## Zwei Transporte

| Transport | Weg | Wofür |
|-----------|-----|-------|
| WebSocket direkt | Browser ↔ eigener `wss://…/signaling`-Endpunkt aus `web.signalingUrl` | Direktmodus: Signaling + WebRTC mit dem Plugin; im Invite per `?ws=` gesetzt |
| PeerJS | Browser + Plugin wählen sich bei `0.peerjs.com:443` ein | Invite-Pfad (`/voice link`) ohne `ws`: Nur ausgehende Verbindungen nötig, ideal hinter NAT |

Beide Transporte sprechen dasselbe Nachrichtenprotokoll (inklusive
`requestId`-Korrelations-IDs und Gruppen-Nachrichten). Sie dürfen gleichzeitig
aktiv sein. Welcher greift, entscheidet der Einladungslink: ein gültiger
`ws`-Parameter hat Vorrang vor PeerJS; fehlt er oder ist er ungültig, nutzt
der Client bei gültigem 10-Zeichen-Code PeerJS. Den Zielhost zeigt der Client
an, bevor er verbindet. Siehe [API Referenz](api.html) und
[PeerJS & TURN](peerjs.html).

## Komponenten

| Komponente | Technik | Zweck |
|------------|---------|-------|
| `SvcBridge` | Kotlin, SVC-API | Opus-Übersetzung WebRTC ↔ SVC, Mute-Gate, Latenzmessung |
| `BrowserPresenceBridge` | SVC `PlayerStateManager` | Browser als VoicechatConnection registrieren, Mute-Symbole broadcasten |
| `SvcGroupService` | echte SVC Gruppen-API | Echte SVC-Gruppen (normal/open/isolated), Zählung aus SVC-Verbindungen |
| `PeerJsVoiceRuntime` + `PeerJsWebRtcBridge` | PeerJS, WebRTC-Engine | Invite-Sitzungen, Gruppen über Datenkanal |
| `SignalingHandler` (Netty) | WebSocket `wss://` | Direkter Pfad: Signaling, WebRTC, Gruppen |
| `SingleSessionGuard` | pro Spieler-UUID | Genau eine Brücken-Sitzung je Spieler |
| `InviteMapService` + ZXing | Minecraft-Maps | QR-Einladung als Karte in die Hand |
| `WebVoicechatCommand` | Bukkit-Commands | `/voicechat` für Browser-Spieler, Mod-Fallback für Mod-Spieler |
| Webend | Vue 3 + Vite + TypeScript | Browser-Client (Voice-, Kanal- und Einstellungs-UI) |

## Datenfluss

### Browser → Minecraft (Ausgehendes Audio)

1. Browser: Mikrofon → Opus (48 kHz mono, 20 ms) → SRTP
2. Plugin: Empfang → `SvcBridge.injectPcmFromWebRtc` → Opus → `LocalAudioChannel`
3. SVC verteilt an alle, die den Spieler hören (Gruppe + Distanz)

Ist der Browser gemutet, verwirft das `WebMuteGate` die Frames serverseitig -
egal, was der Client schickt.

### Minecraft → Browser (Eingehendes Audio)

1. SVC: `MicrophonePacketEvent` pro Sprecher
2. Plugin: Opus extrahieren → an berechtigte WebRTC-Peers weiterleiten
3. Browser: Dekodieren → pro Peer ein Gain → Mixer → Lautsprecher

Ein deafened Browser bekommt keine Frames (Drop vor dem Dekodieren).

## Mute und Deafen über die Grenze

- **Browser mutet sich:** Meldung über Datenkanal/Signaling → `WebMuteGate` blockt den
  Audiofluss. Mod-Spieler hören ihn nicht mehr.
- **Browser deafened sich:** Zusätzlich `PlayerState.disabled` + Broadcast -
  Mod-Spieler sehen das Vollmute-Symbol, wie bei der Mod.
- **Sichtbarkeit:** `BrowserPresenceBridge` registriert eine echte
  `VoicechatConnection` für den Browser, damit er in der Mod-Gruppenliste mit
  Mikrofon-Symbol erscheint statt als "disconnected".

## Gruppen

Browser-Gruppen **sind** SVC-Gruppen (`GroupService` nutzt `createGroup`,
`groupBuilder`, `setGroup`). Mod-Spieler sehen und betreten sie, Browser sehen
Mod-Gruppen. Beitritt mit Passwort wird unterstützt (`hasPassword`-Schloss in
der Kanal-UI, Fehlercodes für "nötig" vs. "falsch"). Gruppennamen begrenzt SVC
auf 16 Zeichen. Die Webend-Liste pollt alle 5 Sekunden.

## Sitzungen und Sicherheit

- Ein Code = eine Sitzung (`/voice link`-Codes sind einmalig, 5 Minuten TTL).
  Im Direktmodus verbraucht erst der erste `join` den Code - innerhalb von
  60 Sekunden nach `verify`.
- Eine Brücke je Spieler (`SingleSessionGuard`); ein zweiter Code schließt die
  alte Sitzung statt zu scheitern. Quit gibt sofort frei.
- OP-Gate: Ohne OP kein `/voice link` (Hinweis auf die Mod), `/voice link
  force` schaltet einmalig frei.
- JWT (HS256) mit `voice`-Scope für den WebSocket-Pfad; `verify` liefert ein
  Session-Token mit TTL `auth.jwtTtlSeconds` (Default 24 h). Reconnects mit
  demselben Token sind erlaubt, bis es abläuft.
- Rate-Limit: 5 Codes/Minute/Spieler für `/voice link`; das `verify`-Limit im
  Direktmodus liegt separat bei 10/Minute pro Client-IP.
- Leeres `auth.jwtSecret` wird pro Start **flüchtig** erzeugt - ein Neustart
  beendet alle Sitzungen. Für Persistenz einen festen Wert setzen.

## Audio-Spezifikationen

| Parameter | Wert |
|-----------|------|
| Codec | Opus |
| Sample Rate | 48 kHz |
| Channels | 1 (Mono) |
| Frame | 20 ms (960 Samples) |
| Bitrate | ~64 kbps (`maxaveragebitrate=64000`, FEC, DTX) |

## Netzwerk-Ports

| Port | Protokoll | Zweck |
|------|-----------|-------|
| 25565 | TCP | Minecraft Game |
| 24454 | TCP | WebSocket-Signaling (`wss://`) |
| 24454 | UDP | SVC-Sprache (nur Mod-Spieler) |
| kurzlebige UDP-Ports | UDP (ausgehend) | Browser-Audio über WebRTC |
| 443 | TCP (ausgehend) | PeerJS-Signalisierung (`0.peerjs.com`) |

Der Browser spricht mit dem Plugin nur über TCP (Signaling) und danach per WebRTC direkt. Die Sprachpakete laufen über Ports, die libwebrtc aushandelt; nach außen ist dafür keine eingehende Regel nötig, solange der Rückweg über conntrack offen bleibt.
