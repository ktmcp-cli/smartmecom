import Conf from 'conf';

const config = new Conf({
  projectName: 'smartmecom-cli',
  schema: {
    apiKey: {
      type: 'string',
      default: ''
    },
    username: {
      type: 'string',
      default: ''
    },
    password: {
      type: 'string',
      default: ''
    }
  }
});

export function getConfig(key) {
  return config.get(key);
}

export function setConfig(key, value) {
  config.set(key, value);
}

export function getAllConfig() {
  return config.store;
}

export function clearConfig() {
  config.clear();
}

export function isConfigured() {
  const apiKey = config.get('apiKey');
  const username = config.get('username');
  const password = config.get('password');
  return !!(apiKey || (username && password));
}

export default config;
