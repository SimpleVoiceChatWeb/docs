---
title: Deployment
nav: Deployment
description: Production-grade SimpleVoiceChatWeb deployment - plugin, webend and documentation.
lead: Build the plugin, start the server, web app and docs arrive via workflow.
---
# Deployment

## Plugin (Paper server)

```bash
cd plugin
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew fatJar --no-daemon --console=plain
cp build/libs/SimpleVoiceChatWebPlugin-1.0.0-SNAPSHOT-fat.jar /paper-server/plugins/
```

Building fails on Java 25 with `JavaVersion.parse` (old Kotlin version) -
hence Java 21 via `JAVA_HOME`. The fat JAR is **platform-bound** (native
artifact of the build host): build on Linux for Linux servers. It also needs
`ProtocolLib.jar` and `voicechat-bukkit-2.6.21.jar` (or newer) in `plugins/`.
Old fat JARs go to `jar-backups/` - **never** into `plugins/`, or Paper loads
them as plugins.

### Test server recipe

```bash
tmux new-session -d -s testmc -c /path/to/TestMCServer \
  "java -Xms1G -Xmx2G -jar paper-26.2-112.jar nogui"
```

It is called `paper-26.2-112.jar`, not `paper.jar`. About 40 seconds to `Done`.
Stop with `tmux send-keys -t testmc "stop" Enter`. Ports: 25565 (MC) and
24454 (signaling + SVC voice).

## Webend (GitHub Pages)

The `Deploy Webend to GitHub Pages` workflow builds the Vue app on every
change under `src/**` (plus `index.html`, `package.json`, `vite.config.ts`)
on `main` - or manually via Actions → Run workflow. It pushes `dist/` into
the root of `main` in `SimpleVoiceChatWeb/SimpleVoiceChatWeb.github.io`:

- **Source:** Deploy from a branch, **Branch:** main / root
- **Live:** `https://simplevoicechatweb.github.io` (hash routing: `/#/login`, `/#/voice`, `/#/settings`)
- Auth via SSH deploy key: public part as deploy key with write access in the
  Pages repo, private part as `PAGES_DEPLOY_KEY` Actions secret in the webend
  repo (use only for this Pages repo).
- PeerJS values as Actions variables (`VITE_PEERJS_HOST`, `VITE_PEERJS_PORT`,
  `VITE_PEERJS_PATH`, `VITE_PEERJS_SECURE`, `VITE_PEERJS_KEY`), otherwise
  PeerJS cloud defaults.

> **Trap:** The workflow triggers on `paths: src/**`. A push without `src`
> changes (e.g. docs only) triggers **no** deploy. Status:
> `gh run list --repo SimpleVoiceChatWeb/webend`.

## Docs (`/docs`)

These pages live as Markdown under `webend/docs/*.ai.md` (German) and
`*.en.ai.md` (English), built with `node scripts/build.js` into
`webend/docs/dist/` (`.html` plus the `.ai.md` sources for agents). Check
locally with `npx serve dist -l 3001`. The `Deploy Docs to docs repository`
workflow pushes `dist/` via SSH deploy key (`DOCS_DEPLOY_KEY`) to
`SimpleVoiceChatWeb/docs` (branch `main`, root) - live at
`https://simplevoicechatweb.github.io/docs`. The picker at the top right
switches languages.

## Ports and firewall

| Port | Protocol | Purpose |
|------|-----------|-------|
| 25565 | TCP | Minecraft game |
| 24454 | TCP | WebSocket signaling (`wss://`) |
| 24454 | UDP | SVC voice |
| 443 | TCP (outbound) | PeerJS signaling |

```bash
# UFW example
ufw allow 25565/tcp   # Minecraft
ufw allow 24454/tcp   # WebSocket signaling
ufw allow 24454/udp   # SVC voice
ufw enable
```

> **Tip:** Always test ports from an **external network**
> (phone hotspot), not from the server itself!

## Environment variables

| Variable | Description |
|----------|--------------|
| `SVCWEB_WEB_PORT` | Example: override file values via env (`SVCWEB_` + dotted path) |
| `JWT_SECRET` | If `auth.jwtSecret` is not left to auto-generate |
| `PAGES_DEPLOY_KEY` | Actions secret for the Pages push (webend repo only) |
