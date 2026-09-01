const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const { TuyaIRDiscovery } = require('../dist/lib/TuyaIRDiscovery');
const { LoginHelper } = require('../dist/lib/api/LoginHelper');
const { DeviceConfigurationHelper } = require('../dist/lib/api/DeviceConfigurationHelper');
const { TuyaIRPlatform } = require('../dist/platform');

const log = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

test('discovery contains a rejected login without an unhandled rejection', async () => {
  const originalLoginInstance = LoginHelper.Instance;
  const originalDeviceInstance = DeviceConfigurationHelper.Instance;
  const originalSetTimeout = global.setTimeout;
  const unhandled = [];
  const onUnhandled = (reason) => unhandled.push(reason);

  LoginHelper.Instance = () => ({
    login: () => Promise.reject(new Error('EAI_AGAIN')),
  });
  DeviceConfigurationHelper.Instance = () => ({
    fetchDevices: () => Promise.reject(new Error('unexpected call')),
  });
  // Capture the retry without waiting thirty seconds or keeping the test alive.
  global.setTimeout = () => ({ });
  process.on('unhandledRejection', onUnhandled);

  try {
    const discovery = new TuyaIRDiscovery(log, {
      name: 'TuyaIR',
      tuyaAPIClientId: 'client',
      tuyaAPISecret: 'secret',
      deviceRegion: 'eu',
      smartIR: [{ deviceId: 'ir-device' }],
    });
    discovery.startDiscovery(0, () => assert.fail('discovery callback must not run'));
    await new Promise((resolve) => originalSetTimeout(resolve, 0));
    assert.deepEqual(unhandled, []);
  } finally {
    process.removeListener('unhandledRejection', onUnhandled);
    global.setTimeout = originalSetTimeout;
    LoginHelper.Instance = originalLoginInstance;
    DeviceConfigurationHelper.Instance = originalDeviceInstance;
  }
});

test('platform logs a configuration error instead of starting discovery without smartIR', () => {
  const errors = [];
  const platform = Object.create(TuyaIRPlatform.prototype);
  platform.log = { error: (message) => errors.push(message) };
  platform.config = {
    tuyaAPIClientId: 'client',
    tuyaAPISecret: 'secret',
    deviceRegion: 'eu',
  };

  platform.discoverDevices();

  assert.deepEqual(errors, [
    'No Smart IR devices are configured. Please check your config.json',
  ]);
});

test('configured Homebridge stays alive through a DNS login failure', async () => {
  const storage = fs.mkdtempSync(path.join(os.tmpdir(), 'tuya-ir-homebridge-'));
  const config = {
    bridge: {
      name: 'Tuya IR verification',
      username: 'CC:22:3D:E3:CE:31',
      port: 51827,
      pin: '031-45-155',
    },
    platforms: [{
      name: 'TuyaIR',
      platform: 'TuyaIR',
      tuyaAPIClientId: 'verification-client',
      tuyaAPISecret: 'verification-secret',
      deviceRegion: 'zz',
      smartIR: [{ deviceId: 'verification-device', autoFetchRemotesFromServer: true }],
    }],
  };
  fs.writeFileSync(path.join(storage, 'config.json'), JSON.stringify(config));

  const child = spawn(process.execPath, [
    path.join(__dirname, '..', 'node_modules/homebridge/bin/homebridge'),
    '-D', '-I', '-Q', '-P', path.join(__dirname, '..'),
    '--strict-plugin-resolution', '-U', storage,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });

  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 1500);
      child.once('error', reject);
      child.once('exit', (code, signal) => {
        clearTimeout(timer);
        reject(new Error(`Homebridge exited early (${code ?? signal})\n${output}`));
      });
    });
    assert.equal(child.exitCode, null, output);
    assert.match(output, /TuyaIR|Tuya IR/);
  } finally {
    if (child.exitCode === null) {
      child.kill('SIGINT');
    }
    await new Promise((resolve) => child.once('exit', resolve));
    fs.rmSync(storage, { recursive: true, force: true });
  }
});
