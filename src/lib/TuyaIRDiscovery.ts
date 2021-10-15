const EventEmitter = require('events');
import { API, Logger } from 'homebridge';
import { Config } from './Config';
import { TuyaAPIHelper } from './TuyaAPIHelper';

export class TuyaIRDiscovery extends EventEmitter {

    private config: Config = new Config();
    private api: API;
    public readonly log: Logger;

    constructor(log, api) {
        super();
        this.log = log;
        this.api = api;
    }

    start(api, props, index, cb) {
        this.log.info(`Trying to login...`);
        this.config = new Config(props.client_id, props.secret, props.region, props.smartIR[index].deviceId, props.smartIR[index].autoFetchRemotes, props.smartIR[index].devices);
        var helper = TuyaAPIHelper.Instance(this.config, this.log);
        helper.login(() => {
            this.log.info("Fetching configured remotes...");
            helper.fetchDevices(this.config.deviceId, (devs: any[]) => {
                cb(devs, index);
            });
        })
    }
}