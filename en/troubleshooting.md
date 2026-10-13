---
title: Troubleshooting
description: Common problems, diagnostic steps and solutions for SimpleVoiceChatWeb.
lead: Measure first, guess later - most ghosts are wiring, not logic.
---

## Quick reference

| Problem | Cause | Solution |
|---------|---------|--------|
| "Code invalid" | Code expired (5 min) or spent | Run `/voice link` again (every code single-use) |
| `ALREADY_LINKED` | Old session holds the slot | Second code closes the old session automatically |
| "No connection" | Ports/signaling unreachable | Test ports externally, check server log |
| "No audio" | Mute gate, group or firewall | Check mute status, group room, UDP |
| "LAN only works" | No port forwarding | Set up router forwarding for 24454 |
| "WebRTC stuck at signaling connected" | Symmetric NAT/firewall | Set up TURN ([PeerJS & TURN](peerjs.html)) |
| Group shows "0 people" | Wrong room or no answer | Reload page, check console for real error |
| Group creation times out | Answer without `requestId` or channel still closed | Hard-reload page, then read console |

## The most important method

When something fails silently, **log the incoming message first, don't read
the code**. Six group bugs in a row sat in wiring (private method via cast,
`null` connection on PeerJS path, missing answer, doubly nested payload,
answer filter in browser, too-early request) - not one in actual logic.

## Group problems

- **Creating does nothing:** Open the browser console - since error handling,
  the real plugin message shows there instead of a timeout.
- **List doesn't refresh:** It polls every 5 seconds; when stuck, trigger
  `requestGroupList` manually and check the network tab.
- **Name gets cut:** SVC stores max 16 characters, rest silently dropped.
- **Password group:** lock icon → dialog. "Password needed" (1005) vs.
  "wrong" (1006) are different errors.
- **Mod doesn't see browser:** presence registration happens on group join;
  without join, no entry in the mod list.

## Audio problems

- **Other side hears nothing:** check mute status on both sides (`/voicechat
  test` shows it). Server-side the mute gate blocks everything - even
  "accidentally" sent frames.
- **Browser hears nothing:** check deafen status; deafened browsers get no
  frames (dropped before decoding).
- **Phone without microphone:** the browser falls back to a silent
  receive-only track (hearing-mode warning). Real audio tests need a desktop
  browser with microphone.
- **Mute microphone in Minecraft:** **V** key, not right-click.
- **Echo:** use headphones; echo cancellation in browser settings (effective
  on next connect).

## Build problems

| Symptom | Cause | Solution |
|---------|---------|--------|
| `JavaVersion.parse("25...")` | Gradle on Java 25 | Set `JAVA_HOME` to Java 21 |
| `de.maxhenkel` unresolvable (CI) | SVC API only local | Build fetches from Modrinth (local → Latest → 2.6.21); version field is `bukkit-2.6.21` |
| `spotlessCheck` red | Never green | Keep disabled or run `spotlessApply` once |
| `vue-tsc` breaks | `<!-- -->` in `src/main.ts` | Only `//` comments there |
| No Pages deploy | Push without `src` changes | Workflow only triggers on `src/**` |

## Server problems

- **Wrong JAR:** server is called `paper-26.2-112.jar`, not `paper.jar`.
- **Old JARs in `plugins/`:** Paper loads them as plugins - backups only to `jar-backups/`.
- **Commands do nothing (`/svcweb`, `/svcw`):** they share the executor with `/voice` - normal.
- **Commands after logout:** OP unlocks are deleted on logout and plugin stop.
- **Never create a `~` folder:** write prompts with absolute paths or `./`.

## Browser diagnostics

- Connection log in the voice tab (collapsible, dark panel) shows signaling
  state, ICE candidates and chat channel.
- `chrome://webrtc-internals` (Chrome) or `about:webrtc` (Firefox) for stats,
  candidate pairs and packet loss.
- Plugin-internal latency: debug log `WebRTC -> SVC inject time` (every 50
  frames). A small number proves no fast call - measure end to end with two
  players.

## Support

Before an issue check: ports tested externally? Browser console? Plugin log
(DEBUG)? Share `config.yml` without secrets?

[Create issue on GitHub](https://github.com/SimpleVoiceChatWeb/issues)
