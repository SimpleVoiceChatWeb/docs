---
title: Schnellstart
description: SimpleVoiceChatWeb in 5 Minuten zum Laufen bringen - Plugin, Code, Verbinden.
lead: Vom leeren Server zum ersten Browser-Anruf in 5 Minuten.
---

## Voraussetzungen

| Komponente | Anforderung |
|------------|-------------|
| Minecraft Server | Paper 26.2 |
| Simple Voice Chat | `voicechat-bukkit-2.6.21.jar` (oder neuer) im `plugins/`-Ordner |
| ProtocolLib | `ProtocolLib.jar` im `plugins/`-Ordner (harte Abhängigkeit) |
| Java | 21 zum Bauen, 25 zum Laufen |
| Ports | 25565 (TCP), 24454 (TCP+UDP) |

## 1. Plugin bauen

```bash
cd plugin
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew fatJar --no-daemon --console=plain
```

Das Fat-JAR liegt danach unter `plugin/build/libs/SimpleVoiceChatWebPlugin-1.0.0-SNAPSHOT-fat.jar`.
Es ist **plattformgebunden** (natives Artefakt des Build-Hosts): Für Linux-Server
auf Linux bauen, für andere Plattformen jeweils dort.

> **Hinweis:** `./gradlew build` scheitert mit Java 25 an `JavaVersion.parse`
> (alte Kotlin-Version). Immer Java 21 per `JAVA_HOME` setzen.

### Plugin geladen prüfen

JAR nach `plugins/` kopieren und Server starten. Im Log muss stehen:

```
[INFO]: [SimpleVoiceChatWeb] Signaling server started on port 24454
[INFO]: [SimpleVoiceChatWeb] Took over /voicechat, mod fallback executor captured
[INFO]: Done (...)! For help, type "help"
```

## 2. Im Spiel verbinden

### Schritt 1: Code generieren

```
 /voice link
```

Jeder Code ist **einmalig** und gilt 5 Minuten. Ohne OP wird der Befehl mit
einem Hinweis auf die Mod abgewiesen, OPs bekommen nur einen Hinweis.
`/voice link force` schaltet einmalig frei.

Nach dem Befehl erhält der Spieler eine **QR-Karte in die Hand**: Rechtsklick
öffnet die Kartenansicht mit dem Invite-Link. Die Karte räumt sich selbst weg,
sobald der Spieler sich bewegt, sie wegsteckt oder der Browser verbunden ist.

### Schritt 2: Code im Browser öffnen

1. `https://simplevoicechatweb.github.io` öffnen (oder direkt mit Code: `https://simplevoicechatweb.github.io/?code=...`)
2. Code eingeben, auf **Verbinden** klicken
3. Mikrofonzugriff erlauben
4. **Sprechen!**

Zum Üben von Audio braucht es **zwei Spieler** in Hörreichweite - am besten
einen mit Mod und einen über den Browser.

## Port-Anforderungen

| Port | Protokoll | Zweck |
|------|-----------|-------|
| 25565 | TCP | Minecraft Game |
| 24454 | TCP | WebSocket-Signaling (`wss://`) |
| 24454 | UDP | SVC Voice (Minecraft-Spieler) |

Für den PeerJS-Pfad brauchen Browser **und** Plugin nur **ausgehende**
Verbindungen zu `0.peerjs.com:443`. Siehe [PeerJS & TURN](peerjs.html).

### Ports von externem Netzwerk testen

```bash
nc -zv DEINE_OEFFENTLICHE_IP 25565
nc -zv DEINE_OEFFENTLICHE_IP 24454
nc -zuv DEINE_OEFFENTLICHE_IP 24454
```

> **Wichtig:** Immer von einem externen Netzwerk testen (Handy-Hotspot).
> Localhost-Tests zeigen nicht, ob Port-Forwarding funktioniert.

## Befehle im Überblick

| Befehl | Wer | Was |
|--------|-----|-----|
| `/voice link` | Spieler | Einmal-Code erzeugen + QR-Karte zeigen |
| `/voice link force` | OP | Einmalig freischalten trotz OP-Sperre |
| `/voice unlink` | Spieler | Browser-Sitzung trennen |
| `/voicechat help` | alle | Übersicht (Browser- und Mod-Wege) |
| `/voicechat invite` | Browser-Spieler | Neuen Einmal-Code + QR-Karte |
| `/voicechat join <Gruppen-ID>` | Browser-Spieler | SVC-Gruppe betreten |
| `/voicechat leave` | Browser-Spieler | Gruppe verlassen |
| `/voicechat test` | Browser-Spieler | Verbindungs- und Mute-Status anzeigen |

Mod-Spieler behalten ihre originalen `/voicechat`-Befehle - das Plugin fängt
nur Browser-Sitzungen ab und reicht den Rest an die Mod durch.

## Nächste Schritte

- [Architektur](architecture.html) - Wie die Bridge intern funktioniert
- [PeerJS & TURN](peerjs.html) - Wenn die direkte Verbindung nicht reicht
- [Konfiguration](configuration.html) - Alle `config.yml`-Optionen
- [Troubleshooting](troubleshooting.html) - Wenn etwas nicht geht
