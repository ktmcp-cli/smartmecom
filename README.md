> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# smart-me CLI

A production-ready command-line interface for the [smart-me](https://www.smart-me.com) API. Monitor energy consumption, manage smart devices, and control your energy infrastructure directly from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by smart-me.

## Features

- **Device Management** — List, get, and control smart-me devices
- **Real-time Measurements** — Monitor power, voltage, current, and temperature
- **Historical Data** — Retrieve energy consumption history
- **Device Control** — Switch devices on/off remotely
- **User Management** — View user info and access tokens
- **JSON output** — All commands support `--json` for scripting and piping
- **Colorized output** — Clean, readable terminal output

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to `jq`, `grep`, `awk`, and other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/smartmecom
```

## Authentication Setup

### 1. Get API Credentials

Visit [smart-me portal](https://www.smart-me.com) and generate an API key, or use your username/password.

### 2. Configure the CLI

Option A - API Key (recommended):
```bash
smartmecom config set --api-key YOUR_API_KEY
```

Option B - Username/Password:
```bash
smartmecom config set --username YOUR_USERNAME --password YOUR_PASSWORD
```

### 3. Verify

```bash
smartmecom config show
```

## Commands

### Configuration

```bash
# Set API key
smartmecom config set --api-key <key>

# Set username/password
smartmecom config set --username <user> --password <pass>

# Show current config
smartmecom config show
```

### Devices

```bash
# List all devices
smartmecom devices list

# Get device details
smartmecom devices get <device-id>

# Get device values (power, temperature, etc.)
smartmecom devices values <device-id>
```

### Measurements

```bash
# Get measurements for device
smartmecom measurements get <device-id>

# Get realtime measurements
smartmecom measurements realtime <device-id>

# Get historical data
smartmecom measurements history <device-id> --start 2026-01-01 --end 2026-01-31
```

### Device Actions

```bash
# Switch device on
smartmecom actions switch <device-id> on

# Switch device off
smartmecom actions switch <device-id> off
```

### User

```bash
# Get user information
smartmecom user info

# List access tokens
smartmecom user tokens
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get all devices as JSON
smartmecom devices list --json

# Pipe to jq for filtering
smartmecom devices list --json | jq '.[] | select(.DeviceEnergyType == "MeterTypeElectricity")'

# Get power consumption
smartmecom devices values <id> --json | jq '.ActivePower'
```

## Examples

### Monitor energy consumption

```bash
# List all devices
smartmecom devices list

# Get realtime power consumption
smartmecom measurements realtime <device-id>

# Get monthly consumption
smartmecom measurements history <device-id> --start 2026-02-01 --end 2026-02-28 --json
```

### Control smart switches

```bash
# Turn on a device
smartmecom actions switch <device-id> on

# Turn off a device
smartmecom actions switch <device-id> off
```

### Track historical usage

```bash
# Get last week's data
smartmecom measurements history <device-id> \
  --start 2026-02-10 \
  --end 2026-02-17 \
  --json | jq '.[] | {date: .Date, value: .Value}'
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/smartmecom](https://github.com/ktmcp-cli/smartmecom).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.
