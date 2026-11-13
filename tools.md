---
title: Werkzeuge
description: config.yml im Formular bearbeiten und Firewall-Regeln erzeugen – alles läuft im Browser.
lead: Zwei kleine Helfer für Serverbetreiber: ein Config-Editor und ein Port-/Firewall-Generator. Keine Installation, kein Login, kein Upload.
---

## Config-Editor

Öffne [Werkzeuge → Config-Editor](https://SimpleVCWeb.github.io/tools/#/config) und lade deine `config.yml`. Jeder Schlüssel, den das Plugin kennt, wird zu einem Formularfeld – gruppiert wie die Datei selbst: Web, WebRTC, PeerJS, Authentifizierung, TURN und so weiter.

- **Unbekannte Schlüssel bleiben erhalten.** Optionen, die der Editor nicht kennt (neuere Version, Fork), stehen unverändert in der Ausgabe und werden separat aufgelistet.
- **Kommentare bleiben erhalten**, solange nur Werte geändert werden. Das Hinzufügen eines fehlenden Schlüssels schreibt die Datei neu; der Editor sagt dir vorher, dass Kommentare dabei verloren gehen.
- **Die Prüfung läuft live:** Portbereiche, Pflicht-Origins, TURN-Zugangsdaten und Audio-Abstände werden vor dem Download geprüft.
- **Nur geänderte Werte** blendet alles aus, was du nicht angefasst hast; **Fehlende Schlüssel ergänzen** füllt das gesamte Schema mit Standardwerten.

Die Datei heißt `config.yml`, das Plugin schreibt aber JSON und liest sie über Typesafe Config. Der Editor akzeptiert JSON und YAML 1.2 und lädt immer gültiges JSON herunter (vier Leerzeichen Einrückung), das Typesafe Config ohne Überraschungen liest.

Erlaubte Origins werden normalisiert: Pfad, Query und abschließender Schrägstrich fallen weg, aus `https://example.org/app/?code=1` wird `https://example.org`.

## Ports & Firewall

[Ports & Firewall](https://SimpleVCWeb.github.io/tools/#/ports) macht aus deinen drei Ports fertige Snippets:

| Ausgabe | Verwendung |
|---------|------------|
| `ufw` | Debian-/Ubuntu-Hosts mit ufw |
| `iptables` | Systeme ohne ufw oder mit eigenen Regeln |
| `docker-compose` | Container-Setups mit veröffentlichten Ports |
| Config-Werte | Die passenden Zeilen für `web.port` und `webrtc.port` |

Für das Spiel und den Web-/Signaling-Port reicht TCP; Sprache braucht **UDP** auf dem Web-Port. Ohne diese UDP-Regel verbindet der Browser, aber es kommt kein Ton an – der häufigste Fehler. Der WebRTC-Port ist nur nötig, wenn du ihn im Plugin aktivierst.

## Nichts verlässt den Browser

Beide Werkzeuge sind statische Dateien. Die geöffnete Config liest der Browser über die File-API, verarbeitet sie lokal und lädt sie nirgendwo hoch. Es gibt kein Konto, keine Analyse und keine Speicherung über die Seite hinaus.

## Grenzen

Das Schema bildet die Optionen der aktuellen Plugin-Version ab. Kommt ein Schlüssel hinzu, bleibt er erhalten, wird aber erst nach einem Schema-Update beschriftet. Die erzeugten Firewall-Regeln sind ein Ausgangspunkt – prüfe sie gegen dein eigenes Firewall-Setup, bevor du sie anwendest.
