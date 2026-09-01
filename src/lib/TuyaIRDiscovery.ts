import EventEmitter from 'events';
import { Logger, PlatformConfig } from 'homebridge';
import { TuyaIRConfiguration } from './model/TuyaIRConfiguration';
import { LoginHelper } from './api/LoginHelper';
import { DeviceConfigurationHelper } from './api/DeviceConfigurationHelper';

const MAX_LOGIN_RETRIES = 10;
const BASE_RETRY_MS = 30_000;
const MAX_RETRY_MS = 300_000;

export class TuyaIRDiscovery extends EventEmitter {
    private platformConfig: PlatformConfig;

    constructor(private readonly log: Logger, platformConfig: PlatformConfig) {
        super();
        this.platformConfig = platformConfig;
    }

    startDiscovery(index, cb) {
        this.log.info(`Trying to login for index ${index}...`);
        const configuration = new TuyaIRConfiguration(this.platformConfig, index);
        const loginHelper = LoginHelper.Instance(configuration, this.log);
        const deviceConfigHelper = DeviceConfigurationHelper.Instance(configuration, this.log);

        const attemptDiscovery = (retryCount: number) => {
            // Start from a microtask so synchronous setup failures enter the
            // same recovery path as rejected login and discovery promises.
            Promise.resolve()
                .then(() => loginHelper.login())
                .then(() => {
                    this.log.info("Fetching configured remotes...");
                    return deviceConfigHelper.fetchDevices(configuration.irDeviceId);
                }).then((devs) => {
                    cb(devs, index);
                }).catch(error => {
                    if (retryCount < MAX_LOGIN_RETRIES) {
                        const delayMs = Math.min(
                            BASE_RETRY_MS * Math.pow(2, retryCount),
                            MAX_RETRY_MS,
                        );
                        this.log.warn(
                            `Discovery login failed (attempt ${retryCount + 1}/${MAX_LOGIN_RETRIES}): ${error}. ` +
                            `Retrying in ${Math.round(delayMs / 1000)}s...`,
                        );
                        setTimeout(() => attemptDiscovery(retryCount + 1), delayMs);
                    } else {
                        this.log.error(
                            `Discovery for index ${index} failed after ${MAX_LOGIN_RETRIES} attempts. ` +
                            `Accessories will be stale until Homebridge restarts. Last error: ${error}`,
                        );
                    }
                });
        };

        attemptDiscovery(0);
    }
}
