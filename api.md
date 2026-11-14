---
title: API Referenz
description: Signaling-Protokoll, Gruppen-Nachrichten und TypeScript-Interfaces von SimpleVoiceChatWeb.
lead: Das echte Wire-Protokoll - verifiziert am Code, nicht geraten.
---

## Signaling-Protokoll (WebSocket)

WebSocket-Endpoint: `wss://<host>:24454/signaling`. JSON-Nachrichten mit
Korrelations-ID - der Browser **verwirft jede Gruppen-Antwort ohne
`requestId`**, der Server echot sie auf beiden Transporten. Gruppen-Anfragen
laufen nach 8 Sekunden in einen sichtbaren Timeout.

### Nachrichtentypen

| Typ | Richtung | Zweck |
|-----|----------|-------|
| `join` / `joined` | beide | Beitritt + Bestätigung mit Peer-Info |
| `verify` (`{code}`) | Client → Server | Einladungscode gegen ein Session-Token tauschen |
| `token` (`{token, expiresAt}`) | Server → Client | Antwort auf `verify`; `expiresAt` als Unix-Sekunden |
| `offer` / `answer` / `ice-candidate` | beide | WebRTC-Signaling |
| `mute` (`{muted}`) | beide | Mikrofon-Status, serverseitig erzwungen |
| `deafen` (`{deafened}`) | beide | Vollmute-Symbol für Mod-Spieler |
| `volume` | beide | Lautstärke |
| `position` (`x/y/z/yaw/pitch`) | beide | 3D-Position für räumliches Audio |
| `group-list` / `group-create` / `group-delete` / `group-join` / `group-leave` | Client → Server | Gruppen-Operationen |
| `group-created` / `group-joined` / `group-left` / `group-list` | Server → Client | Antworten (immer mit `requestId`) |
| `leave` | beide | Verbindung/Gruppe verlassen |
| `ping` / `pong` | beide | Keepalive (PeerJS zusätzlich `HEARTBEAT` alle 5 s) |
| `error` (`code`, `message`) | Server → Client | Echte Begründung statt Timeout |

### Fehlercodes

| Code | Bedeutung |
|------|-----------|
| `1000` | Generisch (Format, unbekannter Typ, WebRTC nicht bereit); auch `verify` nach erfolgreichem Join |
| `1001` | Nicht authentifiziert |
| `1004` | Kein Spieler zu dieser Verbindung / unbekannte Gruppe |
| `1005` | Gruppe braucht ein Passwort (Dialog öffnen) |
| `1006` | Passwort falsch (Dialog offen lassen) |
| `1009` | Token ungültig/abgelaufen - oder Code ungültig, abgelaufen, verbraucht bzw. 60-s-Join-Fenster vorbei (bewusst nicht unterscheidbar) |
| `1010` | Token ohne `voice`-Scope |
| `1029` | Rate-Limit erreicht (10 `verify` pro Minute und IP) |

### Direktmodus (verify → join)

Im Direktmodus holt der Client das Session-Token über die
Signaling-WebSocket; `join` folgt mit diesem Token.

```json
// Client → Server
{ "type": "verify", "payload": { "code": "K7P4QX9LM2" } }

// Server → Client
{ "type": "token", "payload": { "token": "<jwt>", "expiresAt": 1763200000 } }
```

- `verify` verbraucht den Code **nicht**; der Token enthält zusätzlich `code`
  und `codeIssuedAt`.
- Der **erste** `join` mit diesem Token verbraucht den Code und muss innerhalb
  von **60 Sekunden** nach Ausstellung erfolgen - sonst `1009`.
- Danach darf derselbe Token (gleiche `jti`) beliebig oft für Reconnects
  `join`en, bis er abläuft.
- Token-TTL: `auth.jwtTtlSeconds` (Default 86400 s). Ein zweiter Token für
  denselben Code kann ihn nicht mehr nutzen, sobald ein anderer ihn verbraucht
  hat.
- Der Client hält den Token in `sessionStorage` und verwirft ihn nach `exp`;
  ein Browser-Neustart braucht einen neuen Code.

Rate-Limit: 10 `verify` pro Minute pro Client-IP, auch für ungültige Codes
(`1029`). Maßgeblich ist die TCP-Remote-Adresse; `X-Forwarded-For` zählt nur,
wenn der TCP-Peer Loopback ist (lokaler Reverse Proxy) - bei direkter
Verbindung wird der Header ignoriert.

### Gruppen-Payloads

```json
// Beitritt, Passwort nur mitschicken wenn vorhanden
{ "type": "group-join", "payload": { "id": "<uuid>" } }
{ "type": "group-join", "payload": { "id": "<uuid>", "password": "..." } }

// Antwort trägt GroupInfo direkt, Liste als {groups: [...]}
{ "type": "group-joined", "requestId": "...",
  "payload": { "id": "<uuid>", "name": "...", "hasPassword": false } }
```

Gruppennamen begrenzt SVC auf **16 Zeichen** (längere werden still
abgeschnitten). Typen wie in der Mod: `normal`, `open`, `isolated`.

## TypeScript-Interfaces (Webend, gekürzt)

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

Vollständig in `webend/src/signaling/types.ts` (mit `is*Payload`-Guards und
`create*Message`-Factories).

## Plugin-Seite (Kotlin, Überblick)

- `SvcBridge.injectPcmFromWebRtc`: WebRTC-Audio → SVC, mit Mute-Gate und
  Latenzmessung (alle 50 Frames als Debug-Log).
- `BrowserPresenceBridge`: registriert eine echte `VoicechatConnection` und
  broadcastet `PlayerState.disabled` für das Vollmute-Symbol.
- `ActualVoicechatApi.setReceiverSilencer`: pro-Empfänger-Filter über
  `StaticSoundPacketEvent` - ein gemuteter Browser ist für genau diesen
  Mod-Spieler stumm.
- `SvcGroupService`: echte SVC-Gruppen-API, Zählung aus SVC-Verbindungen über
  alle Welten (gruppenunabhängig von Distanz).

## Chat- und Spielbefehle

Browser-Nachrichten führen `Player.chat` aus, Kommandos
`Player.performCommand`. Servernachrichten und Command-Antworten spiegelt das
Chat-Panel; Spieler-Chat kommt über `AsyncChatEvent`, System-Chat über
ProtocolLib. Siehe [Schnellstart](quickstart.html) für die Befehlsliste.
