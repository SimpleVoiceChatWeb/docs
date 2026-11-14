---
title: Werkzeuge
description: config.yml im Formular bearbeiten und Firewall-Regeln erzeugen – alles läuft im Browser.
lead: Zwei kleine Helfer für Serverbetreiber: ein Config-Editor und ein Port-/Firewall-Generator. Keine Installation, kein Login, kein Upload.
---

## Config-Editor

Öffne [Werkzeuge → Config-Editor](/tools/#/config) und lade deine `config.yml`. Jede Option, die das Plugin tatsächlich liest, wird zu einem Formularfeld – gruppiert wie die Datei selbst: Allgemein, Web/TLS, PeerJS, Authentifizierung und TURN.

- **Angezeigt werden nur aktive Optionen.** Schlüssel aus älteren Versionen (zum Beispiel `webrtc.port`, `web.corsAllowedOrigins` oder `svc.*`) werden beim Laden entfernt und separat aufgelistet.
- **Unbekannte Schlüssel bleiben erhalten.** Optionen, die der Editor nicht kennt (neuere Version, Fork), stehen unverändert in der Ausgabe und werden separat aufgelistet.
- **Kommentare bleiben erhalten**, solange nur Werte geändert werden. Das Ergänzen eines fehlenden oder das Entfernen eines veralteten Schlüssels schreibt die Datei neu; der Editor sagt dir vorher, dass Kommentare dabei verloren gehen.
- **Die Prüfung läuft live:** Web-Port, PeerJS-Host/-Port und TURN-Zugangsdaten werden vor dem Download geprüft.
- **Nur geänderte Werte** blendet alles aus, was du nicht angefasst hast; **Fehlende Schlüssel ergänzen** füllt das gesamte Schema mit Standardwerten.

Die Datei heißt `config.yml`, das Plugin schreibt aber JSON und liest sie über Typesafe Config. Der Editor akzeptiert JSON und YAML 1.2 und lädt immer gültiges JSON herunter (vier Leerzeichen Einrückung), das Typesafe Config ohne Überraschungen liest.

## Ports & Firewall

[Ports & Firewall](/tools/#/ports) macht aus deinen Ports fertige Snippets:

| Ausgabe | Verwendung |
|---------|------------|
| `ufw` | Debian-/Ubuntu-Hosts mit ufw |
| `iptables` | Systeme ohne ufw oder mit eigenen Regeln |
| `docker-compose` | Container-Setups mit veröffentlichten Ports |
| Config-Werte | Die passende Zeile für `web.port` |

Das Spiel braucht TCP auf 25565, der Browser **TCP** auf dem Web-Port fürs Signaling. UDP auf derselben Nummer ist der Sprachport von Simple Voice Chat und nur nötig, wenn Spieler mit dem **Mod** mitsprechen – `web.port` steuert ihn nicht. Browser-Audio läuft als WebRTC über kurzlebige UDP-Ports zwischen Browser und Plugin und braucht keine eingehende Freigabe. Kommt im Browser kein Ton an, liegt es meist an Mute/Gruppe oder an einem symmetrischen NAT (dann hilft TURN).

Das Plugin hat keinen eingehenden WebRTC-Port. Ältere Versionen schrieben `webrtc.port`; er wird ignoriert und vom Config-Editor entfernt.

## Nichts verlässt den Browser

Beide Werkzeuge sind statische Dateien. Die geöffnete Config liest der Browser über die File-API, verarbeitet sie lokal und lädt sie nirgendwo hoch. Es gibt kein Konto, keine Analyse und keine Speicherung über die Seite hinaus.

## Grenzen

Das Schema bildet die Optionen der aktuellen Plugin-Version ab. Kommt ein Schlüssel hinzu, bleibt er erhalten, wird aber erst nach einem Schema-Update beschriftet. Die erzeugten Firewall-Regeln sind ein Ausgangspunkt – prüfe sie gegen dein eigenes Firewall-Setup, bevor du sie anwendest.
