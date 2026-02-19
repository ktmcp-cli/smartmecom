# smart-me CLI - AI Agent Usage Guide

This CLI is designed to be used by AI agents for smart energy monitoring and device control.

## Authentication

Before using any commands, configure your credentials:

```bash
smartmecom config set --api-key YOUR_API_KEY
# OR
smartmecom config set --username YOUR_USERNAME --password YOUR_PASSWORD
```

## Common Tasks

### 1. List All Devices

```bash
smartmecom devices list --json
```

### 2. Get Device Details

```bash
smartmecom devices get DEVICE_ID --json
```

### 3. Get Current Power Reading

```bash
smartmecom devices values DEVICE_ID --json
smartmecom measurements realtime DEVICE_ID --json
```

### 4. Get Historical Energy Data

```bash
smartmecom measurements history DEVICE_ID --start YYYY-MM-DD --end YYYY-MM-DD --json
```

### 5. Control Device (Switch On/Off)

```bash
smartmecom actions switch DEVICE_ID on
smartmecom actions switch DEVICE_ID off
```

### 6. Get User Information

```bash
smartmecom user info --json
```

## JSON Output

All commands support `--json` flag for structured output suitable for parsing.

## Error Handling

- Exit code 0 = success
- Exit code 1 = error (check stderr for message)

## Use Cases

- **Energy Monitoring**: Track power consumption across devices
- **Device Control**: Automate switching devices on/off based on conditions
- **Cost Analysis**: Calculate energy costs from historical data
- **Anomaly Detection**: Monitor for unusual power consumption patterns
- **Smart Scheduling**: Control devices based on time or energy pricing
