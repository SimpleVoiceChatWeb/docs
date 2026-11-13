# SimpleVoiceChatWeb – Documentation

Built documentation for **SimpleVoiceChatWeb**, a voice bridge between a
Minecraft server (Simple Voice Chat) and the browser.

- **Live (German):** <https://SimpleVoiceChatWeb.github.io/docs/>
- **Live (English):** <https://SimpleVoiceChatWeb.github.io/docs/en/>
- **Short domain:** <https://SimpleVCWeb.github.io/docs/>
- **Project:** <https://SimpleVCWeb.github.io/>
- **Source:** [`SimpleVoiceChatWeb/webend`](https://github.com/SimpleVoiceChatWeb/webend) (`docs/`)

No login, no access gate: the entire published documentation is public.

## What is inside

| Page | Topic |
|---|---|
| `index.html` | Overview and entry points |
| `quickstart.html` | First server and first browser call |
| `tools.html` | Config editor and firewall helper |
| `architecture.html` | Components and how audio flows |
| `peerjs.html` | PeerJS path, NAT and TURN |
| `deployment.html` | Server, proxy and firewall |
| `configuration.html` | Every option the plugin reads |
| `troubleshooting.html` | Symptom → cause → fix |
| `api.html` | HTTP and WebSocket reference |

German pages live at the root, English pages under `/en/`. Every page also
exists as `.md`, generated from the same source, for agents and offline reading.

## Do not edit by hand

Every file except this `README.md` is generated. The
`Deploy Docs to docs repository` workflow in
[`webend`](https://github.com/SimpleVoiceChatWeb/webend) renders
`docs/lang/*.json` with a dependency-free Node script and pushes `docs/dist/`
into the root of `main` with `rsync --delete`. Changes made here are overwritten
on the next deploy; the README is excluded from that sync.

| Path | Purpose |
|---|---|
| `*.html` | German pages |
| `en/*.html` | English pages |
| `*.md`, `en/*.md` | Same content as Markdown |
| `assets/` | Stylesheet, icons, meta images |
| `.nojekyll` | Disables Jekyll on GitHub Pages |

## Public build only

Deployment internals (repo layout, deploy keys, workflow details) are part of
the private source and are stripped from this public build. The build also
fails if a secret, an absolute home path or a private server name slips into a
page.

## GitHub Pages

- Source: **Deploy from a branch**, branch `main`, folder `/ (root)`
- Deploys on changes under `docs/` in `webend`
- Deploy key access is limited to the `webend` repository (`DOCS_DEPLOY_KEY`)
