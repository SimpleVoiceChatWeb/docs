---
title: Deployment
description: Produktionsreifes Deployment von SimpleVoiceChatWeb - Plugin, Webend und Dokumentation.
lead: Plugin bauen, Server starten, Web-App und Docs kommen per Workflow.
---

## Plugin (Paper-Server)

```bash
cd plugin
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew fatJar --no-daemon --console=plain
cp build/libs/SimpleVoiceChatWebPlugin-1.0.0-SNAPSHOT-fat.jar /paper-server/plugins/
```

Mit Java 25 scheitert der Build an `JavaVersion.parse` (alte Kotlin-Version) -
deshalb Java 21 per `JAVA_HOME`. Das Fat-JAR ist **plattformgebunden** (natives
Artefakt des Build-Hosts): Für Linux-Server auf Linux bauen. Benötigt im
`plugins/`-Ordner außerdem `ProtocolLib.jar` und
`voicechat-bukkit-2.6.21.jar` (oder neuer). Alte Fat-JARs nach
`jar-backups/` legen - **nie** in `plugins/`, sonst lädt Paper sie als Plugins.

### Testserver-Rezept

```bash
tmux new-session -d -s testmc -c /pfad/zu/TestMCServer \
  "java -Xms1G -Xmx2G -jar paper-26.2-112.jar nogui"
```

Es heißt `paper-26.2-112.jar`, nicht `paper.jar`. Ca. 40 Sekunden bis `Done`.
Stoppen mit `tmux send-keys -t testmc "stop" Enter`. Ports: 25565 (MC) und
24454 (Signaling + SVC-Voice).

## Webend (GitHub Pages)

Der Workflow `Deploy Webend to GitHub Pages` baut die Vue-App bei jeder
Änderung unter `src/**` (plus `index.html`, `package.json`,
`vite.config.ts`) auf `main` - oder manuell über Actions → Run workflow. Er
pusht `dist/` ins Root des `main`-Branches von
`SimpleVoiceChatWeb/SimpleVoiceChatWeb.github.io`:

- **Source:** Deploy from a branch, **Branch:** main / root
- **Live:** `https://simplevoicechatweb.github.io` (Hash-Routing: `/#/login`, `/#/voice`, `/#/settings`)
- Auth per SSH-Deploy-Key: Öffentlicher Teil als Deploy Key mit Write-Access
  im Pages-Repo, privater Teil als Actions-Secret `PAGES_DEPLOY_KEY` im
  Webend-Repo (nur für dieses Pages-Repo verwenden).
- PeerJS-Werte als Actions-Variables (`VITE_PEERJS_HOST`, `VITE_PEERJS_PORT`,
  `VITE_PEERJS_PATH`, `VITE_PEERJS_SECURE`, `VITE_PEERJS_KEY`), sonst
  PeerJS-Cloud-Defaults.

> **Falle:** Der Workflow triggert auf `paths: src/**`. Ein Push ohne
> `src`-Änderung (z. B. nur Docs) löst **keinen** Deploy aus. Status:
> `gh run list --repo SimpleVoiceChatWeb/webend`.

## Docs (`/docs`)

Diese Seiten leben als Markdown unter `webend/docs/*.ai.md` und werden per
`node scripts/build.js` nach `webend/docs/dist/` gebaut (`.html` plus die
`.ai.md`-Quellen für Agents). Lokal prüfen mit `npx serve dist -l 3001`.
Der Workflow `Deploy Docs to docs repository` pusht `dist/` per SSH-Deploy-Key
(`DOCS_DEPLOY_KEY`) nach `SimpleVoiceChatWeb/docs` (Branch `main`, Root) -
live unter `https://simplevoicechatweb.github.io/docs`. Repo dafür auf public
und Pages-Quelle "Deploy from a branch" stellen.

## Ports und Firewall

| Port | Protokoll | Zweck |
|------|-----------|-------|
| 25565 | TCP | Minecraft Game |
| 24454 | TCP | WebSocket-Signaling (`wss://`) |
| 24454 | UDP | SVC Voice |
| 443 | TCP (ausgehend) | PeerJS-Signalisierung |

```bash
# UFW Beispiel
ufw allow 25565/tcp   # Minecraft
ufw allow 24454/tcp   # WebSocket Signaling
ufw allow 24454/udp   # SVC Voice
ufw enable
```

> **Tipp:** Ports immer von einem **externen Netzwerk** testen
> (Handy-Hotspot), nicht vom Server selbst!

## Umgebungsvariablen

| Variable | Beschreibung |
|----------|--------------|
| `SVCWEB_WEB_PORT` | Beispiel: Dateiwerte per Env überschreiben (`SVCWEB_` + Pfad mit Punkten) |
| `JWT_SECRET` | Falls `auth.jwtSecret` nicht leer verwaltet wird (auto-generiert sonst) |
| `PAGES_DEPLOY_KEY` | Actions-Secret für den Pages-Push (nur Webend-Repo) |
