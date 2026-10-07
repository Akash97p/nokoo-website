# Installing on macOS and Linux

Windows gets the full tray application and a single-file installer. macOS and Linux get the same
background broker (`nokood`) and `nokoo` command-line client; macOS archives also contain
a native quota-only status item (`nokoo-menubar`) that the broker owns. The API, bearer token,
notification model, and `SKILL.md` are identical on all three platforms, so an agent written against
the Windows build needs no changes.

> **Status.** These builds are part of the prerelease line. The broker itself has been run and
> exercised end to end on Linux and, since 2026-09-04, on real Intel Mac hardware, where the
> `osascript` notification backend was also seen displaying a banner. The Linux graphical
> notification backend has still not been observed, and neither has any Apple Silicon machine.
> See [VERIFICATION.md](VERIFICATION.md) for exactly what has and has not been observed.
>
> The binaries are adhoc-signed rather than notarized, so macOS quarantines a fresh download.
> `xattr -dr com.apple.quarantine <dir>` clears it, and needs no `sudo`.

## Install

```sh
curl -fsSL https://raw.githubusercontent.com/Akash97p/agent-notify/main/scripts/install.sh | sh
```

The script detects your platform, downloads the matching archive from GitHub Releases, **verifies
its SHA-256 against the published checksum file**, and installs the CLI and broker into
`~/.local/bin`; a macOS archive that contains `nokoo-menubar` installs that third executable too.
It refuses to install anything it cannot verify. With no version override, it selects the newest
published release, including a prerelease; set `NOKOO_VERSION` to pin an exact tag. The current
`v0.3.0-alpha.3` archive includes the native macOS menu-bar executable.

To install elsewhere or pin a version:

```sh
NOKOO_PREFIX=/usr/local/bin NOKOO_VERSION=v0.3.0-alpha.3 sh install.sh
```

### Manual install

Download the archive for your platform from the
releases page on [nokooai.kabanitech.com](https://nokooai.kabanitech.com/), check it against
`SHA256SUMS.txt`, then:

```sh
tar -xzf nokoo-linux-x64.tar.gz
install -m 0755 nokoo-linux-x64/nokoo  ~/.local/bin/
install -m 0755 nokoo-linux-x64/nokood ~/.local/bin/
```

For macOS, use the matching `nokoo-osx-*` directory and also install
`nokoo-menubar` beside `nokood`.

Supported archives: `linux-x64`, `linux-arm64`, `osx-x64`, `osx-arm64`, and `win-x64` for a portable
Windows copy without the installer.

macOS marks downloaded binaries with a quarantine attribute. These builds are not yet notarized, so
the first run needs:

```sh
xattr -d com.apple.quarantine ~/.local/bin/nokoo ~/.local/bin/nokood \
  ~/.local/bin/nokoo-menubar
codesign --force --sign - ~/.local/bin/nokoo ~/.local/bin/nokood \
  ~/.local/bin/nokoo-menubar
```

## Run the broker

```sh
nokood
```

It prints the address it listens on, how provider secrets are protected, and which notification
backend it selected:

```text
Nokoo broker listening on http://127.0.0.1:47821
  secrets      : Secret Service keyring via secret-tool
  notifications: notify-send
Press Ctrl+C to stop.
```

Options:

| Option | Effect |
| --- | --- |
| `--port <n>` | Listen on a different loopback port |
| `--config-dir <path>` | Use a different per-user data directory |
| `--no-desktop` | Print notifications to standard output instead of the desktop |
| `--version`, `--help` | Print version or usage and exit |

Then, from any shell:

```sh
nokoo health
nokoo send --agent codex --project payments --type input_required \
  --key payments-decision --title "Need a decision" --message "Normalized or denormalized?"
```

Open the broker's local web interface with `nokoo ui`. It provides settings, channels,
questions, history, and an Insights area for local usage, API-equivalent cost estimates, and live
Codex/Claude Code quota. On macOS the broker automatically starts `nokoo-menubar` after the API
is ready; configure its enabled state, refresh interval, and menu-bar accounts on Live quota. See
[WEB_UI.md](WEB_UI.md) for account setup, polling/estimate limits, and SSH forwarding.

## Run it in the background

### Linux (systemd user service)

Create `~/.config/systemd/user/nokoo.service`:

```ini
[Unit]
Description=Nokoo broker
After=graphical-session.target

[Service]
ExecStart=%h/.local/bin/nokood
Restart=on-failure

[Install]
WantedBy=default.target
```

```sh
systemctl --user daemon-reload
systemctl --user enable --now nokoo
```

`nokood` stops cleanly on `SIGTERM`, so `systemctl --user stop nokoo` shuts the broker
down rather than killing it.

### macOS (launchd agent)

Create `~/Library/LaunchAgents/ai.nokoo.broker.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>ai.nokoo.broker</string>
  <key>ProgramArguments</key>
  <array><string>/Users/YOUR_USER/.local/bin/nokood</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
```

```sh
launchctl load ~/Library/LaunchAgents/ai.nokoo.broker.plist
```

## Desktop notifications

| Platform | Backend | Requirement |
| --- | --- | --- |
| Linux | `notify-send` | Install `libnotify-bin` (Debian/Ubuntu) or `libnotify` (Fedora/Arch), and run inside a graphical session |
| macOS | `terminal-notifier` if installed, otherwise Notification Center via `osascript` | None; `terminal-notifier` gives better grouping |
| Any | console | Automatic fallback when no graphical session is available, for example over SSH |

The console fallback means a notification is never silently dropped: if nothing can display it, the
broker writes it to standard output instead. `osascript` cannot render a notification that stays on
screen, so on macOS sticky attention types behave like ordinary banners; the entry still stays
active in history until it is resolved.

## Where your data lives

| Path | Contents |
| --- | --- |
| `$XDG_DATA_HOME/Nokoo` or `~/.local/share/Nokoo` | Everything below |
| `config.json` | Settings **and the local bearer token** |
| `nokoo.db` | Notification history |
| `secret.key` | Present only when no keyring is available |
| `logs/` | Daily log files |
| `nokood.lock` | Single-instance lock |

The directory is created `0700` and those files `0600`. Do not copy or commit `config.json`: anyone
holding the token can post notifications to your broker.

## Provider credential protection

Outbound channels are opt-in and disabled until you configure them. When you do, credentials are
encrypted before they reach SQLite:

- **macOS** — AES-GCM under a key kept in your login keychain.
- **Linux** — AES-GCM under a key kept in the Secret Service keyring, via `secret-tool`
  (`libsecret-tools` on Debian/Ubuntu, `libsecret` elsewhere).
- **No keyring available** — AES-GCM under an owner-only `secret.key` file. The broker warns about
  this at startup. It is weaker: any process running as you can read that file.

Installing `secret-tool` before configuring providers gets you the stronger option on Linux. See
[SECURITY.md](../SECURITY.md).

## What is missing compared with Windows

macOS has a native quota status item, but no native notification center or Settings window. Linux has
no tray. The broker serves those full surfaces in a browser: run `nokoo ui` (see
[WEB_UI.md](WEB_UI.md)). Toast placement and sounds are Windows-app settings; here the platform's
notification service decides both. A full macOS client and Linux tray remain planned; see
[CROSS_PLATFORM.md](CROSS_PLATFORM.md).

## Troubleshooting

Most symptoms and fixes are shared with Windows and live in
[TROUBLESHOOTING.md](TROUBLESHOOTING.md). Platform-specific ones:

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Nokoo is already running for this user` | Another `nokood` holds the lock | `nokoo health`; stop the other instance, or pass a different `--config-dir` |
| Broker starts but nothing appears on screen | No `notify-send`, or no graphical session | Install `libnotify-bin`; over SSH the console fallback is expected |
| `notifications: console` on a desktop machine | `DISPLAY`/`WAYLAND_DISPLAY` not visible to the service | Ensure the user service inherits the graphical session environment |
| Startup warns about the key file | No keyring found | Install and unlock `secret-tool`, then re-enter provider credentials |
| macOS refuses to run a binary | Quarantine or an unacceptable ad-hoc signature | Clear quarantine and run `codesign --force --sign -` on the CLI, broker, and menu-bar executable |
| Broker runs but no quota percentage appears | Menu-bar executable absent/disabled, or no five-hour window | Install it beside `nokood`; enable it on Live quota; inspect the broker log for the one-time missing-binary warning |
