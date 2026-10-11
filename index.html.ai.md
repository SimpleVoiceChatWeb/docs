---
title: SimpleVoiceChatWeb
nav: Start
description: SimpleVoiceChatWeb - Dokumentation für das Minecraft Voice Chat Bridge System
lead: Willkommen bei der offiziellen Dokumentation von SimpleVoiceChatWeb - der Bridge zwischen Minecraft Simple Voice Chat Mod und WebRTC Browser-Clients.
---
# SimpleVoiceChatWeb Dokumentation

> **Alpha:** Diese Dokumentation und das gesamte System befinden sich in
> aktiver Entwicklung. Anleitungen und Verhalten können sich ändern - bei
> Abweichungen gilt der Code, Fehler bitte als
> [Issue melden](https://github.com/SimpleVoiceChatWeb/SimpleVoiceChatWeb/issues).

## Was ist SimpleVoiceChatWeb?

SimpleVoiceChatWeb ist eine Bridge zwischen dem **Simple Voice Chat Minecraft Mod** und **WebRTC Browser-Clients**. Sie ermöglicht es Spielern ohne Mod, per Browser am Voice-Chat teilzunehmen - mit echten SVC-Gruppen, Mute-Symbolen und Befehlen.

### Statistiken

- **0 €** Hosting-Kosten (GitHub Pages, kein Relay-Server)
- **48 kHz** Opus Audio Qualität
- **2** Transporte (WebSocket direkt + PeerJS hinter NAT)

### Quick Actions

- [Zum Schnellstart](quickstart.html) - In 5 Minuten zum Voice Chat
- [Architektur verstehen](architecture.html) - Deep Dive in die Systemarchitektur

## Architektur-Übersicht

```
Browser <── WebRTC/DTLS/SRTP ──> Plugin <── SVC-API ──> Minecraft-Spieler
```

Keine Browser-zu-Browser-Verbindungen, kein Audio-Relay außerhalb des
Minecraft-Servers. Das Plugin übersetzt zwischen WebRTC-Audio und Simple
Voice Chat.

::: cards
### Echte SVC-Gruppen

Browser-Gruppen sind echte SVC-Gruppen: Mod-Spieler sehen und betreten sie, mit Passwort-Schutz und Typen wie in der Mod.

### QR-Einladung

`/voice link` legt eine Karten-QR in die Hand - Rechtsklick öffnet den Invite-Link, kein Fremd-Plugin nötig.

### Mute mit Symbol

Browser-Mute wird serverseitig erzwungen, Deafen zeigt Mod-Spielern das Vollmute-Symbol wie bei der Mod.

### Eigene Befehle

`/voicechat invite/join/leave/test` für Browser-Spieler, mit Mod-Fallback für Mod-Spieler.
:::

## Technische Übersicht

| Komponente | Technologie | Zweck |
|------------|-------------|-------|
| **Plugin** | Kotlin, Java 21, Paper 26.2 | Opus-Übersetzung, Gruppen, Presence |
| **Webend** | Vue 3 + Vite + TypeScript | Browser-Client (Voice, Kanäle, Settings) |
| **Signaling** | Netty `wss://`, PeerJS | Zwei Transporte, ein Protokoll |
| **Audio** | Opus 48 kHz mono 20 ms | WebRTC-Standard, ~64 kbps |
| **Docs** | Markdown → statisches HTML | Diese Seiten, Agents lesen die `.ai.md`-Quellen |

## Projektstruktur

```
SimpleVoiceChatWeb/
├── plugin/           # Paper-Plugin (Kotlin): svc/, peerjs/, signaling/, qr/, config/
├── webend/           # Vue-3-Frontend: voice/, signaling/, stores/, webrtc/, audio/
├── webend/docs/      # Diese Doku: *.ai.md-Quellen, Build per node scripts/build.js
└── TestMCServer/     # Lokaler Paper-Testserver (Ports 25565/24454)
```

## Schnellzugriff

::: cards
### Schnellstart

In 5 Minuten zum laufenden Voice Chat - Plugin installieren, Code generieren, verbinden.

### Architektur

Deep-Dive in die Datenflüsse: WebRTC ↔ Plugin ↔ SVC, Presence, Gruppen, Sitzungen.

### PeerJS & TURN

Wenn die direkte Verbindung nicht reicht: Signalisierung, STUN, TURN-Relay.

### Deployment

Produktions-Setup: Plugin bauen, Testserver, GitHub Pages, Ports.

### API Referenz

Das echte Wire-Protokoll: Nachrichten, Gruppen-Payloads, Fehlercodes.

### Konfiguration

Alle `config.yml`-Optionen mit echten Defaults plus Build-Variablen.
:::

## Links & Ressourcen

- [Web-App öffnen](https://simplevoicechatweb.github.io) (neuer Tab)
- [GitHub Organisation](https://github.com/SimpleVoiceChatWeb)
- [Haupt-Repository](https://github.com/SimpleVoiceChatWeb/SimpleVoiceChatWeb)
- [Issues & Support](https://github.com/SimpleVoiceChatWeb/SimpleVoiceChatWeb/issues)
