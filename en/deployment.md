---
title: Deployment
description: Production-grade SimpleVoiceChatWeb deployment - plugin, webend and documentation.
lead: Build the plugin, start the server, open the ports - step by step for your own server.
---

## Self-hosting

This page describes how to run SimpleVoiceChatWeb on your own server: build the plugin, open the ports, serve the web client. The web client is a static site and works behind any web server.

The public instance of the project runs on GitHub Pages: the landing page at `/`, the web client at `/app/`, and these docs at `/docs/`.

The web client and these docs assume they live in the **root path** of the domain (`/`, `/app/`, `/docs/`, `/tools/`). Running under a subpath such as `/voice/` is not supported.

For the front-end module there is a site bundle that ships the landing page, app, docs and tools in one directory; without a configured site URL, canonical and OG tags are omitted.

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
ufw allow 24454/tcp   # WebSocket signaling (browser)
ufw allow 24454/udp   # SVC voice (mod players only)
ufw enable
```

> **Tip:** Always test ports from an **external network**
> (phone hotspot), not from the server itself! `24454/tcp` is mandatory as
> soon as browsers join; the UDP rule only when mod players are present.

### Direct mode behind a reverse proxy

When a reverse proxy terminates TLS, set `web.tlsTerminatedExternally=true`
and use `wss://…` in the link (`web.signalingUrl`) so an HTTPS page can reach
the endpoint. The proxy must set `X-Forwarded-For` and run on the same machine
(loopback connection) - otherwise the `verify` rate limit applies per proxy IP
instead of per client.

## Environment variables

Every option can be overridden with the `SVCWEB_` prefix plus the dotted path in upper case, with dots replaced by underscores:

| Variable | Description |
|----------|--------------|
| `SVCWEB_WEB_PORT` | Example: `web.port` |
| `SVCWEB_AUTH_JWT_SECRET` | Fixed JWT secret instead of auto-generation |
| `SVCWEB_TLS_KEYSTORE_PASSWORD` | Keystore password, preferred over the file |
