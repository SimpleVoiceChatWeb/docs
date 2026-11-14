---
title: Tools
description: Edit config.yml in a form and generate firewall rules - everything runs in the browser.
lead: Two small utilities for server owners: a config editor and a port/firewall helper. No install, no login, no upload.
---

## Config editor

Open [Tools → Config editor](/tools/#/config) and load your `config.yml`. Every option the plugin actually reads becomes a form field, grouped like the file itself: general, web/TLS, PeerJS, authentication and TURN.

- **Only active options are shown.** Keys from older releases (for example `webrtc.port`, `web.corsAllowedOrigins` or `svc.*`) are removed on load and listed separately.
- **Unknown keys are kept.** If your file has options the editor does not know (a newer release, a fork), they stay in the output unchanged and are listed separately.
- **Comments are kept** as long as the edit only changes values. Adding a missing key or removing an obsolete one rewrites the file, and the editor tells you that comments are lost.
- **Validation runs live:** the web port, the PeerJS host/port and the TURN credentials are checked before you download.
- **Only changed values** hides everything you did not touch; **Add missing keys** fills the whole schema with defaults.

Although the file is called `config.yml`, the plugin writes JSON and reads it through Typesafe Config. The editor accepts JSON and YAML 1.2 and always downloads valid JSON (four-space indent), which Typesafe Config reads without surprises.

## Ports & firewall

[Ports & firewall](/tools/#/ports) turns your ports into copy-paste snippets:

| Output | Use |
|--------|-----|
| `ufw` | Debian/Ubuntu hosts with ufw |
| `iptables` | Systems without ufw or with custom rule chains |
| `docker-compose` | Container setups that publish ports |
| Config values | The matching `web.port` line |

The game needs TCP on 25565, the browser needs **TCP** on the web port for signaling. UDP on the same number is the Simple Voice Chat voice port and is only required when players use the **mod** - `web.port` does not control it. Browser audio runs as WebRTC over short-lived UDP ports between browser and plugin and needs no inbound rule. If a browser stays silent, it is usually mute/group state or a symmetric NAT (then TURN helps).

The plugin has no inbound WebRTC port. Older versions wrote `webrtc.port`; it is ignored and removed by the config editor.

## Nothing leaves the browser

Both tools are static files. The config file you open is read with the browser's File API, processed locally and never uploaded. There is no account, no analytics and no storage beyond the page itself.

## Limits

The schema mirrors the options of the current plugin release. If a release adds a key, the editor keeps it but cannot label it until the schema is updated. The generated firewall rules are a starting point - review them against your own firewall setup before applying them.
