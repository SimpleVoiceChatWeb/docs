---
title: Deployment
description: Production-grade SimpleVoiceChatWeb deployment - plugin, webend and documentation.
lead: Build the plugin, start the server, open the ports - step by step for your own server.
---

## Self-hosting

This page describes how to run SimpleVoiceChatWeb on your own server: build the plugin, open the ports, serve the web client. The web client is a static site and works behind any web server.

The public instance of the project runs on GitHub Pages: the landing page at `/`, the web client at `/app/`, and these docs at `/docs/`.

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

## Environment variables

Every option can be overridden with the `SVCWEB_` prefix plus the dotted path in upper case, with dots replaced by underscores:

| Variable | Description |
|----------|--------------|
| `SVCWEB_WEB_PORT` | Example: `web.port` |
| `SVCWEB_AUTH_JWT_SECRET` | Fixed JWT secret instead of auto-generation |
| `SVCWEB_TLS_KEYSTORE_PASSWORD` | Keystore password, preferred over the file |
