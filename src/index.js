import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  listDevices,
  getDevice,
  getDeviceValues,
  getMeasurements,
  getRealtimeMeasurements,
  getHistoricalData,
  switchDevice,
  setDeviceValues,
  getUserInfo,
  listAccessTokens
} from './api.js';

const program = new Command();

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }
  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });
  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));
  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });
  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('Authentication not configured.');
    console.log('\nRun one of the following to configure:');
    console.log(chalk.cyan('  smartmecom config set --api-key <key>'));
    console.log(chalk.cyan('  smartmecom config set --username <user> --password <pass>'));
    process.exit(1);
  }
}

program
  .name('smartmecom')
  .description(chalk.bold('smart-me CLI') + ' - Smart energy monitoring from your terminal')
  .version('1.0.0');

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'smart-me API key')
  .option('--username <user>', 'smart-me username')
  .option('--password <pass>', 'smart-me password')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess('API key set');
    }
    if (options.username) {
      setConfig('username', options.username);
      printSuccess('Username set');
    }
    if (options.password) {
      setConfig('password', options.password);
      printSuccess('Password set');
    }
    if (!options.apiKey && !options.username && !options.password) {
      printError('No options provided. Use --api-key or --username/--password');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    const username = getConfig('username');
    const password = getConfig('password');
    console.log(chalk.bold('\nsmart-me CLI Configuration\n'));
    console.log('API Key:  ', apiKey ? chalk.green('*'.repeat(16)) : chalk.red('not set'));
    console.log('Username: ', username ? chalk.green(username) : chalk.red('not set'));
    console.log('Password: ', password ? chalk.green('*'.repeat(8)) : chalk.red('not set'));
    console.log('');
  });

const devicesCmd = program.command('devices').description('Manage devices');

devicesCmd
  .command('list')
  .description('List all devices')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const devices = await withSpinner('Fetching devices...', () => listDevices());
      if (options.json) {
        printJson(devices);
        return;
      }
      printTable(devices, [
        { key: 'Id', label: 'ID' },
        { key: 'Name', label: 'Name' },
        { key: 'Serial', label: 'Serial' },
        { key: 'DeviceEnergyType', label: 'Type' },
        { key: 'ActivePower', label: 'Power (W)', format: (v) => v?.toFixed(2) || '0.00' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

devicesCmd
  .command('get <device-id>')
  .description('Get device details')
  .option('--json', 'Output as JSON')
  .action(async (deviceId, options) => {
    requireAuth();
    try {
      const device = await withSpinner('Fetching device...', () => getDevice(deviceId));
      if (options.json) {
        printJson(device);
        return;
      }
      console.log(chalk.bold('\nDevice Details\n'));
      console.log('ID:     ', chalk.cyan(device.Id));
      console.log('Name:   ', device.Name || 'N/A');
      console.log('Serial: ', device.Serial || 'N/A');
      console.log('Type:   ', device.DeviceEnergyType || 'N/A');
      console.log('Power:  ', device.ActivePower ? `${device.ActivePower.toFixed(2)} W` : 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

devicesCmd
  .command('values <device-id>')
  .description('Get device values')
  .option('--json', 'Output as JSON')
  .action(async (deviceId, options) => {
    requireAuth();
    try {
      const values = await withSpinner('Fetching values...', () => getDeviceValues(deviceId));
      if (options.json) {
        printJson(values);
        return;
      }
      console.log(chalk.bold('\nDevice Values\n'));
      console.log('Active Power:        ', values.ActivePower ? `${values.ActivePower.toFixed(2)} W` : 'N/A');
      console.log('Counter Reading:     ', values.CounterReading ? `${values.CounterReading.toFixed(2)} kWh` : 'N/A');
      console.log('Temperature:         ', values.Temperature ? `${values.Temperature.toFixed(1)} °C` : 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

const measurementsCmd = program.command('measurements').description('Manage measurements');

measurementsCmd
  .command('get <device-id>')
  .description('Get measurements for device')
  .option('--json', 'Output as JSON')
  .action(async (deviceId, options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching measurements...', () => getMeasurements(deviceId));
      if (options.json) {
        printJson(data);
        return;
      }
      printTable(data, [
        { key: 'Date', label: 'Date' },
        { key: 'Value', label: 'Value', format: (v) => v?.toFixed(2) || '0.00' },
        { key: 'Unit', label: 'Unit' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

measurementsCmd
  .command('realtime <device-id>')
  .description('Get realtime measurements')
  .option('--json', 'Output as JSON')
  .action(async (deviceId, options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching realtime data...', () => getRealtimeMeasurements(deviceId));
      if (options.json) {
        printJson(data);
        return;
      }
      console.log(chalk.bold('\nRealtime Measurements\n'));
      console.log('Active Power: ', data.ActivePower ? `${data.ActivePower.toFixed(2)} W` : 'N/A');
      console.log('Voltage:      ', data.Voltage ? `${data.Voltage.toFixed(2)} V` : 'N/A');
      console.log('Current:      ', data.Current ? `${data.Current.toFixed(2)} A` : 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

measurementsCmd
  .command('history <device-id>')
  .description('Get historical measurements')
  .requiredOption('--start <date>', 'Start date (YYYY-MM-DD)')
  .requiredOption('--end <date>', 'End date (YYYY-MM-DD)')
  .option('--json', 'Output as JSON')
  .action(async (deviceId, options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching historical data...', () =>
        getHistoricalData(deviceId, options.start, options.end)
      );
      if (options.json) {
        printJson(data);
        return;
      }
      printTable(data, [
        { key: 'Date', label: 'Date' },
        { key: 'Value', label: 'Value', format: (v) => v?.toFixed(2) || '0.00' },
        { key: 'Unit', label: 'Unit' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

const actionsCmd = program.command('actions').description('Device actions');

actionsCmd
  .command('switch <device-id> <state>')
  .description('Switch device on/off')
  .action(async (deviceId, state) => {
    requireAuth();
    const isOn = state.toLowerCase() === 'on' || state === '1' || state === 'true';
    try {
      await withSpinner(`Switching device ${isOn ? 'on' : 'off'}...`, () =>
        switchDevice(deviceId, isOn)
      );
      printSuccess(`Device switched ${isOn ? 'on' : 'off'}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

const userCmd = program.command('user').description('User information');

userCmd
  .command('info')
  .description('Get user information')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const user = await withSpinner('Fetching user info...', () => getUserInfo());
      if (options.json) {
        printJson(user);
        return;
      }
      console.log(chalk.bold('\nUser Information\n'));
      console.log('Username: ', user.Username || 'N/A');
      console.log('Email:    ', user.Email || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

userCmd
  .command('tokens')
  .description('List access tokens')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const tokens = await withSpinner('Fetching tokens...', () => listAccessTokens());
      if (options.json) {
        printJson(tokens);
        return;
      }
      printTable(tokens, [
        { key: 'Id', label: 'ID' },
        { key: 'Name', label: 'Name' },
        { key: 'Created', label: 'Created' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
