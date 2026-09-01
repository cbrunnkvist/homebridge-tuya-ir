"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuyaIRDiscovery = void 0;
const events_1 = __importDefault(require("events"));
const TuyaIRConfiguration_1 = require("./model/TuyaIRConfiguration");
const LoginHelper_1 = require("./api/LoginHelper");
const DeviceConfigurationHelper_1 = require("./api/DeviceConfigurationHelper");
const MAX_LOGIN_RETRIES = 10;
const BASE_RETRY_MS = 30000;
const MAX_RETRY_MS = 300000;
class TuyaIRDiscovery extends events_1.default {
    constructor(log, platformConfig) {
        super();
        this.log = log;
        this.platformConfig = platformConfig;
    }
    startDiscovery(index, cb) {
        this.log.info(`Trying to login for index ${index}...`);
        const configuration = new TuyaIRConfiguration_1.TuyaIRConfiguration(this.platformConfig, index);
        const loginHelper = LoginHelper_1.LoginHelper.Instance(configuration, this.log);
        const deviceConfigHelper = DeviceConfigurationHelper_1.DeviceConfigurationHelper.Instance(configuration, this.log);
        const attemptDiscovery = (retryCount) => {
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
                    const delayMs = Math.min(BASE_RETRY_MS * Math.pow(2, retryCount), MAX_RETRY_MS);
                    this.log.warn(`Discovery login failed (attempt ${retryCount + 1}/${MAX_LOGIN_RETRIES}): ${error}. ` +
                        `Retrying in ${Math.round(delayMs / 1000)}s...`);
                    setTimeout(() => attemptDiscovery(retryCount + 1), delayMs);
                }
                else {
                    this.log.error(`Discovery for index ${index} failed after ${MAX_LOGIN_RETRIES} attempts. ` +
                        `Accessories will be stale until Homebridge restarts. Last error: ${error}`);
                }
            });
        };
        attemptDiscovery(0);
    }
}
exports.TuyaIRDiscovery = TuyaIRDiscovery;
//# sourceMappingURL=TuyaIRDiscovery.js.map