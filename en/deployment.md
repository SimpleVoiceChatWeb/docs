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

## Front module

`SimpleVoiceChatWebFront` is an optional Paper plugin that serves the site bundle itself and terminates TLS. It ships as a separate jar so the core stays small and works without it.

### Install

1. Put `SimpleVoiceChatWebFront-<version>.jar` into `plugins/`.
2. Add `front` to `modules.enabled` in `plugins/SimpleVoiceChatWeb/config.yml`:

```yaml
modules {
  enabled = ["front"]
}
```

3. Restart the server. On first start the module writes `plugins/SimpleVoiceChatWebFront/config.yml` with defaults.

To stop it, remove `front` from `modules.enabled` and restart. The jar may stay in `plugins/`: the plugin is loaded but binds no ports. Delete the jar to remove it completely.

### Site bundle

The module serves the site bundle from the jar: landing page at `/`, web client at `/app/`, docs at `/docs/`, tools at `/tools/`. The bundle is embedded at build time with `SVCWEB_WEB_ASSETS_ZIP=<path>` (or `-PwebAssetsZip=<path>`). Without bundled assets the module answers `503`; alternatively put an unpacked bundle into `plugins/SimpleVoiceChatWebFront/web/` and point `static.bundle` at that directory.

The bundle expects the domain root (`/`, `/app/`, `/docs/`, `/tools/`). A subpath such as `/voice/` is not supported.

### TLS

Browsers only grant microphone access in a secure context; self-signed certificates are not enough. Use a certificate from a public CA, for example from your hosting provider.

- Keystore: PKCS12 at `plugins/SimpleVoiceChatWebFront/tls/keystore.p12` (or `https.keystore`, relative to the module data directory).
- Password: `SVCWEB_FRONT_KEYSTORE_PASSWORD` wins over `https.keystorePassword`.
- Renewal: replace the keystore file. The module reloads it on the next handshake, without a restart.
- Ports: `https.port` (default `443`) and, with `https.redirectHttp`, `acme.httpPort` (default `80`) for the HTTP→HTTPS redirect.

With `https.enabled=false` the module serves plain HTTP on `https.port`, for example behind an external TLS terminator on a private network.

`GET /healthz` returns JSON with `status`, `static`, `https`, `cert` (certificate expiry) and `bundle` (bundle commit, when known).

### Configuration

File: `plugins/SimpleVoiceChatWebFront/config.yml` (HOCON). Only options that the module reads are listed.

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `true` | Start the module at all |
| `https.enabled` | `true` | Terminate TLS in the module |
| `https.host` | `"0.0.0.0"` | Bind address |
| `https.port` | `443` | HTTPS port (plain HTTP port when TLS is off) |
| `https.keystore` | `"tls/keystore.p12"` | PKCS12 keystore, relative to the data directory |
| `https.keystorePassword` | `""` | Keystore password - prefer the environment variable |
| `https.redirectHttp` | `true` | Redirect HTTP to HTTPS on the second listener |
| `https.hsts` | `true` | Send `Strict-Transport-Security` |
| `acme.httpPort` | `80` | HTTP listener for the redirect (also the future ACME challenge port) |
| `static.enabled` | `true` | Serve the site bundle |
| `static.bundle` | `"classpath"` | `classpath` or a directory containing the bundle |
| `static.root` | `"web"` | Subdirectory inside the bundle (classpath prefix or path below `static.bundle`) |
| `static.landingRedirect` | `"/app/"` | Redirect for `/`; empty serves `index.html` |
| `static.spaFallback` | `true` | `/app/*` and `/tools/*` fall back to their `index.html` |

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
