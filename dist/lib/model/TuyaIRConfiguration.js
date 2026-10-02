"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TuyaIRConfiguration = void 0;
const Device_1 = require("./Device");
class TuyaIRConfiguration {
    constructor(config, index) {
        var _a, _b;
        this.tuyaAPIClientId = "";
        this.tuyaAPISecret = "";
        this.deviceRegion = "";
        this.irDeviceId = "";
        this.autoFetchRemotesFromServer = true;
        this.configuredRemotes = [];
        this.apiHost = "";
        this.tuyaProjects = [];
        this.activeProjectIndex = 0;
        this.tuyaAPIClientId = config.tuyaAPIClientId;
        this.tuyaAPISecret = config.tuyaAPISecret;
        this.deviceRegion = config.deviceRegion;
        this.irDeviceId = config.smartIR[index].deviceId;
        this.autoFetchRemotesFromServer = config.smartIR[index].autoFetchRemotesFromServer;
        this.configuredRemotes = (_b = (_a = config.smartIR[index].configuredRemotes) === null || _a === void 0 ? void 0 : _a.map(v => new Device_1.Device(v))) !== null && _b !== void 0 ? _b : [];
        if (Array.isArray(config.tuyaProjects) && config.tuyaProjects.length > 0) {
            this.tuyaProjects = config.tuyaProjects;
            this.tuyaAPIClientId = this.tuyaProjects[0].clientId;
            this.tuyaAPISecret = this.tuyaProjects[0].secret;
            this.deviceRegion = this.tuyaProjects[0].region || this.deviceRegion;
        }
        this.apiHost = `https://openapi.tuya${this.deviceRegion}.com`;
    }
    switchToNextProject() {
        if (this.tuyaProjects.length <= 1) {
            return false;
        }
        this.activeProjectIndex =
            (this.activeProjectIndex + 1) % this.tuyaProjects.length;
        const project = this.tuyaProjects[this.activeProjectIndex];
        this.tuyaAPIClientId = project.clientId;
        this.tuyaAPISecret = project.secret;
        this.deviceRegion = project.region || this.deviceRegion;
        this.apiHost = `https://openapi.tuya${this.deviceRegion}.com`;
        return true;
    }
}
exports.TuyaIRConfiguration = TuyaIRConfiguration;
//# sourceMappingURL=TuyaIRConfiguration.js.map