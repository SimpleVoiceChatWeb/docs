---
title: Quickstart
description: Get SimpleVoiceChatWeb running in 5 minutes - plugin, code, connect.
lead: From empty server to first browser call in 5 minutes.
---

## Requirements

| Component | Requirement |
|------------|-------------|
| Minecraft server | Paper 26.2 |
| Simple Voice Chat | `voicechat-bukkit-2.6.21.jar` (or newer) in `plugins/` |
| ProtocolLib | `ProtocolLib.jar` in `plugins/` (hard dependency) |
| Java | 21 to build, 25 to run |
| Ports | 25565 (TCP), 24454 (TCP+UDP) |

## 1. Build the plugin

```bash
cd plugin
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew fatJar --no-daemon --console=plain
```

The fat JAR lands in `plugin/build/libs/SimpleVoiceChatWebPlugin-1.0.0-SNAPSHOT-fat.jar`.
It is **platform-bound** (native artifact of the build host): build on Linux
for Linux servers, on each target platform for others.

> **Note:** `./gradlew build` fails on Java 25 with `JavaVersion.parse`
> (old Kotlin version). Always set `JAVA_HOME` to Java 21.

### Check the plugin loaded

Copy the JAR to `plugins/` and start the server. The log must say:

```
[INFO]: [SimpleVoiceChatWeb] Signaling server started on port 24454
[INFO]: [SimpleVoiceChatWeb] Took over /voicechat, mod fallback executor captured
[INFO]: Done (...)! For help, type "help"
```

## 2. Connect in game

### Step 1: Generate a code

```
 /voice link
```

Every code is **single-use** and valid for 5 minutes. Without OP the command
is rejected with a hint at the mod, OPs only get a hint.
`/voice link force` unlocks once.

After the command the player holds a **QR map in hand**: right-click opens the
map view with the invite link. The map cleans itself up as soon as the player
moves, stows it, or the browser connects.

### Step 2: Open the code in the browser

1. Open `https://simplevoicechatweb.github.io` (or directly with code: `https://simplevoicechatweb.github.io/?code=...`)
2. Enter the code, click **Connect**
3. Allow microphone access
4. **Talk!**

Testing audio needs **two players** in hearing range - best one with the mod
and one via browser.

## Port requirements

| Port | Protocol | Purpose |
|------|-----------|-------|
| 25565 | TCP | Minecraft game |
| 24454 | TCP | WebSocket signaling (`wss://`) |
| 24454 | UDP | SVC voice (Minecraft players) |

For the PeerJS path, browser **and** plugin only need **outbound**
connections to `0.peerjs.com:443`. See [PeerJS & TURN](peerjs.html).

### Test ports from an external network

```bash
nc -zv YOUR_PUBLIC_IP 25565
nc -zv YOUR_PUBLIC_IP 24454
nc -zuv YOUR_PUBLIC_IP 24454
```

> **Important:** Always test from an external network (phone hotspot).
> Localhost tests don't prove port forwarding works.

## Command overview

| Command | Who | What |
|--------|-----|-----|
| `/voice link` | Player | Create single-use code + show QR map |
| `/voice link force` | OP | Unlock once despite OP gate |
| `/voice unlink` | Player | Disconnect browser session |
| `/voicechat help` | Everyone | Overview (browser and mod ways) |
| `/voicechat invite` | Browser player | New single-use code + QR map |
| `/voicechat join <group-ID>` | Browser player | Join SVC group |
| `/voicechat leave` | Browser player | Leave group |
| `/voicechat test` | Browser player | Show connection and mute status |

Mod players keep their original `/voicechat` commands - the plugin only
intercepts browser sessions and passes the rest through to the mod.

## Next steps

- [Architecture](architecture.html) - How the bridge works internally
- [PeerJS & TURN](peerjs.html) - When the direct connection is not enough
- [Configuration](configuration.html) - All `config.yml` options
- [Troubleshooting](troubleshooting.html) - When something breaks
