---
title: Tools
description: Edit config.yml in a form and generate firewall rules - everything runs in the browser.
lead: Two small utilities for server owners: a config editor and a port/firewall helper. No install, no login, no upload.
---

## Config editor

Open [Tools → Config editor](https://SimpleVCWeb.github.io/tools/#/config) and load your `config.yml`. Every key the plugin knows becomes a form field, grouped like the file itself: web, WebRTC, PeerJS, authentication, TURN and so on.

- **Unknown keys are kept.** If your file has options the editor does not know (a newer release, a fork), they stay in the output unchanged and are listed separately.
- **Comments are kept** as long as the edit only changes values. Adding a missing key rewrites the file, and the editor tells you that comments are lost.
- **Validation runs live:** port ranges, required origins, TURN credentials and audio distances are checked before you download.
- **Only changed values** hides everything you did not touch; **Add missing keys** fills the whole schema with defaults.

Although the file is called `config.yml`, the plugin writes JSON and reads it through Typesafe Config. The editor accepts JSON and YAML 1.2 and always downloads valid JSON (four-space indent), which Typesafe Config reads without surprises.

The editor also normalises allowed origins: paths, queries and trailing slashes are dropped, so `https://example.org/app/?code=1` becomes `https://example.org`.

## Ports & firewall

[Ports & firewall](https://SimpleVCWeb.github.io/tools/#/ports) turns your three ports into copy-paste snippets:

| Output | Use |
|--------|-----|
| `ufw` | Debian/Ubuntu hosts with ufw |
| `iptables` | Systems without ufw or with custom rule chains |
| `docker-compose` | Container setups that publish ports |
| Config values | The matching `web.port` and `webrtc.port` lines |

Only TCP is needed for the game and the web/signalling port; voice needs **UDP** on the web port. Without that UDP rule the browser connects but no audio arrives - the most common mistake. The WebRTC port is only needed when you enable it in the plugin.

## Nothing leaves the browser

Both tools are static files. The config file you open is read with the browser's File API, processed locally and never uploaded. There is no account, no analytics and no storage beyond the page itself.

## Limits

The schema mirrors the options of the current plugin release. If a release adds a key, the editor keeps it but cannot label it until the schema is updated. The generated firewall rules are a starting point - review them against your own firewall setup before applying them.
