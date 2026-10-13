---
title: Troubleshooting
description: Häufige Probleme, Diagnose-Schritte und Lösungen für SimpleVoiceChatWeb.
lead: Erst messen, dann raten - die meisten Geister sind Verdrahtung, nicht Logik.
---

## Quick Reference

| Problem | Ursache | Lösung |
|---------|---------|--------|
| "Code ungültig" | Code abgelaufen (5 Min) oder verbraucht | `/voice link` neu ausführen (jeder Code einmalig) |
| `ALREADY_LINKED` | Alte Sitzung belegt den Slot | Zweiter Code schließt die alte Sitzung automatisch |
| "Keine Verbindung" | Ports/Signaling nicht erreichbar | Ports von extern testen, Serverlog prüfen |
| "Kein Audio" | Mute-Gate, Gruppe oder Firewall | Mute-Status, Gruppenraum, UDP prüfen |
| "Nur LAN funktioniert" | Kein Port-Forwarding | Router-Forwarding für 24454 einrichten |
| "WebRTC bleibt bei signaling connected stehen" | Symmetrisches NAT/Firewall | TURN einrichten ([PeerJS & TURN](peerjs.html)) |
| Gruppe zeigt "0 Personen" | Falscher Raum oder keine Antwort | Seite neu laden, Konsole auf echte Fehlermeldung prüfen |
| Gruppen-Erstellung läuft in Timeout | Antwort ohne `requestId` oder Kanal noch zu | Seite hart neu laden, dann Konsole lesen |

## Die wichtigste Methode

Bei stillem Scheitern **zuerst die ankommende Nachricht loggen, nicht den
Code lesen**. Sechs Gruppen-Fehler in Folge saßen alle in der Verdrahtung
(private Methode per Cast, `null`-Connection im PeerJS-Pfad, fehlende Antwort,
doppelt verschachtelter Payload, Antwort-Filter im Browser, zu frühe Anfrage)
- kein einziger in der eigentlichen Logik.

## Gruppen-Probleme

- **Erstellen tut nichts:** Browser-Konsole öffnen - seit dem Error-Handling
  steht dort die echte Plugin-Meldung statt eines Timeouts.
- **Liste aktualisiert nicht:** Sie pollt alle 5 Sekunden; bei Stillstand
  `requestGroupList` manuell anstoßen und Netzwerk-Tab prüfen.
- **Name wird abgeschnitten:** SVC speichert max 16 Zeichen, Rest fällt still weg.
- **Passwortgruppe:** Schloss-Symbol → Dialog. "Passwort nötig" (1005) vs.
  "falsch" (1006) sind verschiedene Fehler.
- **Mod sieht Browser nicht:** Presence-Registrierung passiert beim
  Gruppen-Join; ohne Join kein Eintrag in der Mod-Liste.

## Audio-Probleme

- **Gegenseite hört nichts:** Mute-Status beidseitig prüfen (`/voicechat test`
  zeigt ihn). Serverseitig blockt das Mute-Gate alles - auch "versehentlich"
  gesendete Frames.
- **Browser hört nichts:** Deafen-Status prüfen; deafened Browser bekommen keine
  Frames (Drop vor dem Dekodieren).
- **Handy ohne Mikrofon:** Der Browser fällt auf einen stillen
  Receive-only-Track zurück (Hörmodus-Warnung). Echte Audio-Tests brauchen
  Desktop-Browser mit Mikrofon.
- **Mikrofon in Minecraft muten:** Taste **V**, kein Rechtsklick.
- **Echo:** Kopfhörer nutzen; Echo-Unterdrückung in den Browser-Einstellungen
  (wirkt ab nächstem Verbinden).

## Build-Probleme

| Symptom | Ursache | Lösung |
|---------|---------|--------|
| `JavaVersion.parse("25...")` | Gradle mit Java 25 | `JAVA_HOME` auf Java 21 setzen |
| `de.maxhenkel` unauflösbar (CI) | SVC-API nur lokal vorhanden | Build holt sie von Modrinth (lokal → Latest → 2.6.21); Versionsfeld heißt `bukkit-2.6.21` |
| `spotlessCheck` rot | War noch nie grün | Deaktiviert lassen oder einmal `spotlessApply` |
| `vue-tsc` bricht ab | `<!-- -->` in `src/main.ts` | Nur `//`-Kommentare dort |
| Kein Pages-Deploy | Push ohne `src`-Änderung | Workflow triggert nur auf `src/**` |

## Server-Probleme

- **Falsches JAR:** Server heißt `paper-26.2-112.jar`, nicht `paper.jar`.
- **Alte JARs in `plugins/`:** Paper lädt sie als Plugins - Backups nur nach `jar-backups/`.
- **Befehle tun nichts (`/svcweb`, `/svcw`):** Teilen sich den Executor mit `/voice` - normal.
- **Befehle nach Logout:** OP-Freischaltungen werden bei Logout und Plugin-Stop gelöscht.
- **Niemals einen Ordner `~` anlegen:** Prompts immer mit absoluten Pfaden oder `./` schreiben.

## Browser-Diagnose

- Verbindungslog im Voice-Tab (einklappbar, dunkles Panel) zeigt
  Signaling-Zustand, ICE-Kandidaten und Chat-Kanal.
- `chrome://webrtc-internals` (Chrome) bzw. `about:webrtc` (Firefox) für
  Stats, Kandidatenpaare und Paketverlust.
- Latenz Plugin-intern: Debug-Log `WebRTC -> SVC inject time` (alle 50
  Frames). Kleine Zahl beweist keinen schnellen Call - Ende-zu-Ende mit zwei
  Spielern messen.

## Support

Vor einem Issue prüfen: Ports von extern getestet? Browser-Konsole? Plugin-Log
(DEBUG)? `config.yml` ohne Secrets teilen?

[Issue erstellen auf GitHub](https://github.com/SimpleVoiceChatWeb/issues)
