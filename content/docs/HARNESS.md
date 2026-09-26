# Agent harnesses (auto-notify)

A skill teaches the model to call `nokoo`. A **harness** removes the
remembering: the host itself calls Nokoo at attention boundaries —
permission prompts, questions, session completion, session errors — through
its own hooks or plugin system.

Install both. The skill covers anything the harness does not (custom
milestones, mid-task decisions the host never sees); the harness covers the
model forgetting.

## Notify-only guarantee

The hook/plugin notifiers (OpenCode, Codex, Claude, Gemini, Copilot, Cursor,
Muse, Kilo, Pi) are **notify-only**:

- They send `nokoo send` as a side effect and return no decision.
- Hook scripts always exit `0`. The OpenCode/Kilo plugins never throw.
- A missing CLI, stopped broker, or failed send is silent. The session
  continues exactly as if the harness were absent.

Two bridges go further and **wait for and return the human answer** through
the interaction broker ([INTERACTIONS.md](INTERACTIONS.md)):

- **Hermes** approval transport: an explicit decision surface you opt into
  via `config.yaml`. Transport errors raise and Hermes denies by default —
  a failure can never silently allow a command.
- **OpenClaw** watch daemon: resolves gateway approvals with your answer;
  unsettled approvals stay pending, exactly as without the bridge.

## Ask mode (Codex + Claude Code)

```bash
nokoo install-harness codex --ask
nokoo install-harness claude --ask
```

Ask mode replaces the notify-only permission hook with a blocking hook that
registers one broker interaction, notifies, waits for your answer (Broker,
CLI, or phone via Relay), and prints the host-native decision back into the
waiting call. The decision schemas are verified against the official hook
references: Codex `PermissionRequest` (`decision.behavior: allow/deny`) and
Claude Code `PermissionRequest` (same shape). Anything unsettled — no broker,
no answer in time, expired, cancelled — prints nothing and exits `0`, so the
host falls back to its ordinary local prompt. Ask mode never auto-allows and
never auto-denies.

Tradeoff: while the hook waits (Codex ~10 min, Claude ~5 min), the host's own
prompt is suppressed. Use ask mode when you answer from the phone or another
machine; keep the default notify-only hooks when you sit at the terminal.
Reinstall without `--ask` to switch back; the migration removes the other
mode's entries so they never double-fire.

Other hosts stay notify-only for now: their synchronous decision schemas are
not verified (Gemini `BeforeTool` fires per tool, Copilot/Cursor/Muse ask
shapes are unconfirmed), and a wrong guess would look exactly like success.
Muse follows automatically once its `PermissionRequest` round trip is
confirmed live.

The full relay→phone→host loop (answering from mobile) is implemented and documented in
[RELAY_INTERACTIONS.md](RELAY_INTERACTIONS.md).

## Install

Offline, no downloads. One command per host:

```bash
nokoo install-harness opencode
nokoo install-harness codex
nokoo install-harness claude
nokoo install-harness gemini
nokoo install-harness copilot
nokoo install-harness cursor
nokoo install-harness muse
nokoo install-harness kilo
nokoo install-harness openclaw
nokoo install-harness hermes
nokoo install-harness pi
```

`nokoo install harness <agent>` is accepted as a readable alias.
`claude-code` is accepted for `claude`. Add `--scope project` to install
under the current repository, `--dry-run` to inspect the destination,
`--path DIRECTORY` for a custom harness root, or `--force` after reviewing
a locally modified harness file. Changed files are protected unless
`--force` is explicit. Hook JSON is merged: unrelated entries survive, and
reinstalling never duplicates the Nokoo entries.

Restart the host session after installing. Hooks and plugins load at
startup.

### Where files land

```text
OpenCode     ~/.config/opencode/plugins/nokoo.js
Codex        ~/.codex/nokoo/nokoo_hook.py + ~/.codex/hooks.json
Claude Code  ~/.claude/nokoo/nokoo_hook.py + ~/.claude/settings.json
Gemini CLI   ~/.gemini/nokoo/nokoo_hook.py + ~/.gemini/settings.json
Copilot CLI  ~/.copilot/nokoo/nokoo_hook.py + ~/.copilot/hooks/nokoo.json
Cursor       ~/.cursor/nokoo/nokoo_hook.py + ~/.cursor/hooks.json
Muse Code    ~/.config/muse/nokoo/nokoo_hook.py + ~/.config/muse/settings.json
Kilo Code    ~/.config/kilo/plugin/nokoo.js
OpenClaw     ~/.openclaw/nokoo/nokoo_openclaw.py (watch daemon, no config merge)
Hermes Agent ~/.hermes/plugins/nokoo/ (plus config.yaml edits, see below)
Pi           ~/.pi/agent/extensions/nokoo.ts
```

Project scope (`--scope project`) writes under the repository instead:

```text
OpenCode     <repo>/.opencode/plugins/nokoo.js
Codex        <repo>/.codex/nokoo/nokoo_hook.py + <repo>/.codex/hooks.json
Claude Code  <repo>/.claude/nokoo/nokoo_hook.py + <repo>/.claude/settings.json
Gemini CLI   <repo>/.gemini/nokoo/nokoo_hook.py + <repo>/.gemini/settings.json
Copilot CLI  <repo>/.github/hooks/nokoo.json + <repo>/.github/nokoo/nokoo_hook.py
Cursor       <repo>/.cursor/nokoo/nokoo_hook.py + <repo>/.cursor/hooks.json
Muse Code    <repo>/.muse/nokoo/nokoo_hook.py + <repo>/.muse/hooks.json
Kilo Code    <repo>/.kilo/plugin/nokoo.js
OpenClaw     <repo>/.openclaw/nokoo/nokoo_openclaw.py
Hermes Agent <repo>/.hermes/plugins/nokoo/ (needs HERMES_ENABLE_PROJECT_PLUGINS=true)
Pi           <repo>/.pi/extensions/nokoo.ts (trusted projects only)
```

## What each harness watches

| Host | Permission / question | Completion | Error |
|---|---|---|---|
| OpenCode | `permission.asked`/`permission.updated` → `permission_required`; `question` tool → `input_required` | `session.idle` (and `session.status` idle) → `completed` | `session.error` → `error` |
| Codex | `PermissionRequest` → `permission_required` | `Stop`, `SessionEnd` → `completed` | — |
| Claude Code | `Notification` → `permission_required` | `Stop` → `completed` | — |
| Gemini CLI | `Notification` → `permission_required` | `AfterAgent`, `SessionEnd` → `completed` | — |
| Copilot CLI | `notification` → `permission_required` | `agentStop`, `sessionEnd` → `completed` | `errorOccurred` → `error` |
| Cursor | — (per-tool hooks are too noisy; `ask` mode is planned) | `stop`, `sessionEnd` → `completed` | — |
| Muse Code | `PermissionRequest` → `permission_required` | `Stop` → `completed` | — |
| Kilo Code | `permission.asked` → `permission_required` (same V1 surface as OpenCode) | session idle → `completed` | session error → `error` |
| OpenClaw | gateway approvals → `permission_required` (watch daemon) | — | — |
| Hermes | `pre_approval_request` → `permission_required` (+ transport waits, see below) | `on_session_end` → `completed` | — |
| Pi | `ui_prompt_start` (any blocking dialog) → `permission_required` + capture | `agent_settled` → `completed` | — |

Permission notifications reuse one `--key` per project/session
(`<project>-<session>-permission`) so repeat prompts update rather than
pile up. Completion notifications carry no key. Resolve them from the CLI
(`nokoo resolve ID`) or the notification center when done; the skill
describes the habit.

Subagent child sessions are skipped for OpenCode idle/error noise unless
`NOKOO_INCLUDE_SUBAGENTS=1` is set. Override the CLI binary with
`NOKOO_BIN` when it is not on `PATH`.

## Requirements

- The `nokoo` CLI on `PATH` (`nokoo.exe` on Windows/WSL).
- All hook-script harnesses (Codex, Claude, Gemini, Copilot, Cursor, Muse)
  need `python3` on `PATH` (the hook scripts use only the standard library).
  Copilot's PowerShell entries use `python`; on Windows, if only `python`
  exists, edit the recorded command or add a `python3` alias.
- OpenCode needs no extra runtime: the plugin uses `node:child_process`
  only, which Bun provides.

## Host notes

- **Gemini CLI**: all three events are advisory — the hook observes but never
  decides, which is exactly the notify-only contract. Google has announced
  Gemini CLI will be replaced by Antigravity CLI for unpaid tiers; if the
  binary or `~/.gemini` layout moves, correct `HarnessCatalog` rather than
  adding a parallel list.
- **Copilot CLI**: the `notification` event is fire-and-forget by design.
  The installer writes one owned file (`hooks/nokoo.json`); keep custom
  hooks in a separate `*.json` file in the same directory.
- **Cursor**: user hooks (`~/.cursor/hooks.json`) do not run in cloud
  agents — only project hooks (`.cursor/hooks.json`) do. Install with
  `--scope project` for cloud-agent coverage.
- **Muse Code**: beta host, Developer Preview SDK, no stability promise.
  User-scope `settings.json` is the documented surface; the installer seeds
  the required `schema_version: 1` on fresh files and preserves yours.
  Project-scope `.muse/hooks.json` follows the Claude Code schema per
  third-party verification but is unconfirmed — start one session and check
  for a hooks warning.
- **Kilo Code**: speaks the OpenCode V1 plugin/event surface, so the harness
  is the same file retargeted (`kilo` agent id, Kilo titles) at install time.
  Legacy plugin dirs (`.kilocode/plugin`, `.opencode/plugin`) also load it —
  pass `--path` if you use one.
- **OpenClaw**: no hooks to merge — run the watch daemon next to the gateway:
  `python3 ~/.openclaw/nokoo/nokoo_openclaw.py watch` (systemd,
  launchd, or tmux). It polls `openclaw approvals pending --json`, opens one
  broker interaction per approval, notifies, waits for the human answer, and
  resolves via `openclaw approvals resolve`. Unsettled approvals stay pending.
  Needs the operator-authenticated `openclaw` CLI. A native gateway operator
  client (`operator.approvals` scope) is the planned upgrade; the CLI bridge
  is the portable v1.
- **Hermes**: install, then two explicit consent steps in
  `~/.hermes/config.yaml` (printed by the installer): `plugins.enabled:
  [nokoo]` plus `security.approval.transport: nokoo`. The
  transport **waits for and returns your answer** (this is a decision
  surface, not notify-only): transport errors raise and Hermes denies by
  default — a failure can never silently allow a command. Set
  `transport_fallback: builtin` to fall back to the ordinary prompt instead.
- **Pi**: copy to `~/.pi/agent/extensions/nokoo.ts` (or
  `.pi/extensions/` in a trusted project), then `/reload`. Uses only
  confirmed APIs (`agent_settled`, `ui_prompt_start/end`, `ctx.ui.notify`,
  `tool_call` shapes from the official examples). Blocking dialogs open a
  broker interaction (phone-visible) that auto-cancels when the local dialog
  closes; the local dialog still collects the answer. Full remote answering
  runs Pi in RPC mode, where these dialogs become `extension_ui_request`
  messages — see [INTERACTIONS.md](INTERACTIONS.md) and the relay contract.

## Verify tomorrow (manual checklist)

1. `nokoo health` returns `ok`.
2. `nokoo install-harness opencode --dry-run` prints the destination;
   without `--dry-run` it writes `nokoo.js`. Restart OpenCode, run a
   task that asks a permission, and confirm a desktop notification appears.
3. Same for `codex`: accept the trust prompt if Codex asks about the
   project `.codex` layer, trigger an approval, and confirm the
   notification. `Stop` fires when the agent finishes a response.
4. Same for `claude`: `/hooks` or settings check shows the entries;
   trigger a permission prompt and a task completion.
5. Same for `gemini` (`Notification`/`AfterAgent`), `copilot`
   (`notification`/`agentStop`), `cursor` (`stop`), and `muse`
   (`PermissionRequest`/`Stop`, watching for a hooks warning on first run).
6. Same for `kilo` (permission prompt → Kilo-titled notification), `pi`
   (`/reload`, then a blocking dialog → notification + auto-cancel on close),
   `hermes` (transport prompt after the two `config.yaml` steps), and
   `openclaw` (raise a test approval, answer from the CLI, watch it resolve).
6. `nokoo list --unresolved` shows the harness-sent rows; `resolve`
   clears them.
7. Temporarily stop the broker and confirm the session still works (the
   harness must fail silently).

Real-host display checks have **not** been performed in this branch —
automated tests cover install/merge/idempotency only. Record results in
`docs/VERIFICATION.md`.

## Manual install

Prefer the CLI, which handles absolute paths and JSON merging. To do it by
hand:

- OpenCode: copy `distribution/harness/opencode/nokoo.js` to
  `~/.config/opencode/plugins/nokoo.js` (legacy singular
  `~/.config/opencode/plugin/` also works on older builds) and restart.
- Codex: copy `distribution/harness/shared/nokoo_hook.py` to
  `~/.codex/nokoo/nokoo_hook.py`, then merge
  `distribution/harness/codex/hooks.example.json` into `~/.codex/hooks.json`,
  replacing `HOOK_DIR` with `~/.codex/nokoo`.
- Claude Code: copy the same script to
  `~/.claude/nokoo/nokoo_hook.py`, then merge
  `distribution/harness/claude/settings.example.json` into
  `~/.claude/settings.json`, replacing `HOOK_DIR` the same way.
- Gemini CLI: copy the same script to
  `~/.gemini/nokoo/nokoo_hook.py`, then merge
  `distribution/harness/gemini/settings.example.json` into
  `~/.gemini/settings.json`.
- Copilot CLI: copy the same script to
  `~/.copilot/nokoo/nokoo_hook.py`, then copy
  `distribution/harness/copilot/nokoo.example.json` to
  `~/.copilot/hooks/nokoo.json`, replacing `HOOK_DIR`.
- Cursor: copy the same script to
  `~/.cursor/nokoo/nokoo_hook.py`, then merge
  `distribution/harness/cursor/hooks.example.json` into
  `~/.cursor/hooks.json`.
- Muse Code: copy the same script to
  `~/.config/muse/nokoo/nokoo_hook.py`, then merge
  `distribution/harness/muse/settings.example.json` into
  `~/.config/muse/settings.json` (keep `schema_version: 1`).
- Kilo Code: copy `distribution/harness/opencode/nokoo.js` to
  `~/.config/kilo/plugin/nokoo.js`, replacing the `opencode` agent id
  and OpenCode titles with `kilo`/Kilo (the CLI does this for you).
- OpenClaw: copy `distribution/harness/openclaw/nokoo_openclaw.py` to
  `~/.openclaw/nokoo/` and run `python3 ... watch` under your process
  supervisor.
- Hermes: copy `distribution/harness/hermes/nokoo/` to
  `~/.hermes/plugins/nokoo/`, then apply the two `config.yaml` consent
  steps above.
- Pi: copy `distribution/harness/pi/nokoo.ts` to
  `~/.pi/agent/extensions/nokoo.ts`, then `/reload` in Pi.

## Uninstall

- OpenCode: delete `nokoo.js` from the plugin directory.
- Codex: delete the three Nokoo blocks from `hooks.json` and remove
  `~/.codex/nokoo/`.
- Claude Code: delete the two Nokoo blocks from `settings.json` and
  remove `~/.claude/nokoo/`.
- Gemini CLI: delete the three Nokoo blocks from `settings.json` and
  remove `~/.gemini/nokoo/`.
- Copilot CLI: delete `hooks/nokoo.json` and remove
  `~/.copilot/nokoo/`.
- Cursor: delete the two Nokoo blocks from `hooks.json` and remove
  `~/.cursor/nokoo/`.
- Muse Code: delete the two Nokoo blocks from `settings.json` and
  remove `~/.config/muse/nokoo/`.
- Kilo Code: delete `nokoo.js` from the plugin directory.
- OpenClaw: stop the watch daemon and remove `~/.openclaw/nokoo/`.
- Hermes: remove `~/.hermes/plugins/nokoo/` and the two `config.yaml`
  entries.
- Pi: delete `nokoo.ts` from the extensions directory and `/reload`.

## Compatibility contract

- Hook entry points are versioned by the host, not by Nokoo. When a
  host renames an event (OpenCode has done so before: `session.idle` →
  `session.status`), the plugin handles both names; correct
  `HarnessCatalog`/`HarnessInstaller` rather than adding a parallel list.
- Unknown future events are ignored silently by design.
- The tray Install tab does not install harnesses yet; the CLI is the
  installer until a Settings surface is built and visually verified.
