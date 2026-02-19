import axios from 'axios';
import { getConfig } from './config.js';

const SMARTME_BASE_URL = 'https://api.smart-me.com';

/**
 * Create axios client with auth headers
 */
function createClient() {
  const apiKey = getConfig('apiKey');
  const username = getConfig('username');
  const password = getConfig('password');

  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else if (username && password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  } else {
    throw new Error('API key or username/password not configured. Run: smartmecom config set --api-key <key>');
  }

  return axios.create({
    baseURL: SMARTME_BASE_URL,
    headers
  });
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      throw new Error('Authentication failed. Check your API key or credentials.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Check your API permissions.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else {
      const message = data?.message || data?.error || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from smart-me API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// DEVICES
// ============================================================

export async function listDevices() {
  const client = createClient();
  try {
    const response = await client.get('/api/Devices');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getDevice(deviceId) {
  const client = createClient();
  try {
    const response = await client.get(`/api/Devices/${deviceId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getDeviceValues(deviceId) {
  const client = createClient();
  try {
    const response = await client.get(`/api/DeviceBySerial?serial=${deviceId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// MEASUREMENTS
// ============================================================

export async function getMeasurements(deviceId, params = {}) {
  const client = createClient();
  try {
    const response = await client.get(`/api/MeterValues/${deviceId}`, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getRealtimeMeasurements(deviceId) {
  const client = createClient();
  try {
    const response = await client.get(`/api/DeviceBySerial?serial=${deviceId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getHistoricalData(deviceId, startDate, endDate) {
  const client = createClient();
  try {
    const response = await client.get(`/api/MeterValues/${deviceId}`, {
      params: { date: startDate, endDate }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// ACTIONS
// ============================================================

export async function switchDevice(deviceId, state) {
  const client = createClient();
  try {
    const response = await client.post(`/api/Devices/${deviceId}/Switch`, {
      state: state ? 'On' : 'Off'
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function setDeviceValues(deviceId, values) {
  const client = createClient();
  try {
    const response = await client.post(`/api/DeviceBySerial`, {
      DeviceSerial: deviceId,
      ...values
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// USER
// ============================================================

export async function getUserInfo() {
  const client = createClient();
  try {
    const response = await client.get('/api/User');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function listAccessTokens() {
  const client = createClient();
  try {
    const response = await client.get('/api/AccessTokens');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
