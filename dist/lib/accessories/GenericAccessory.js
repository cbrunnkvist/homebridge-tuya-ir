"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericAccessory = void 0;
const Config_1 = require("../Config");
const TuyaAPIHelper_1 = require("../TuyaAPIHelper");
/**
 * Generic Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
class GenericAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        /**
         * These are just used to create a working example
         * You should implement your own code to track the state of your accessory
         */
        this.switchStates = {
            On: this.platform.Characteristic.Active.INACTIVE
        };
        this.parentId = "";
        this.powerCommand = 1;
        this.parentId = accessory.context.device.ir_id;
        this.tuya = TuyaAPIHelper_1.TuyaAPIHelper.Instance(new Config_1.Config(platform.config.client_id, platform.config.secret, platform.config.region, platform.config.deviceId, platform.config.devices), platform.log);
        // set accessory information
        this.accessory.getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, accessory.context.device.product_name)
            .setCharacteristic(this.platform.Characteristic.Model, 'Infrared Controlled Switch')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);
        // get the LightBulb service if it exists, otherwise create a new LightBulb service
        // you can create multiple services for each accessory
        this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
        // set the service name, this is what is displayed as the default name on the Home app
        // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
        this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);
        // each service must implement at-minimum the "required characteristics" for the given service type
        // see https://developers.homebridge.io/#/service/Lightbulb
        // register handlers for the On/Off Characteristic
        this.service.getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.setOn.bind(this)) // SET - bind to the `setOn` method below
            .onGet(this.getOn.bind(this)); // GET - bind to the `getOn` method below
    }
    setup(platform, accessory) {
    }
    /**
     * Handle "SET" requests from HomeKit
     * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
     */
    async setOn(value) {
        // implement your own code to turn your device on/off
        if (this.switchStates.On != value) {
            var command = this.powerCommand;
            this.tuya.sendFanCommand(this.parentId, this.accessory.context.device.id, command, false, (body) => {
                if (!body.success) {
                    this.platform.log.error(`Failed to change device status due to error ${body.msg}`);
                }
                else {
                    this.platform.log.info(`${this.accessory.displayName} is now ${value == 0 ? 'Off' : 'On'}`);
                    this.switchStates.On = value;
                }
            });
        }
    }
    /**
     * Handle the "GET" requests from HomeKit
     * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
     *
     * GET requests should return as fast as possbile. A long delay here will result in
     * HomeKit being unresponsive and a bad user experience in general.
     *
     * If your device takes time to respond you should update the status of your device
     * asynchronously instead using the `updateCharacteristic` method instead.
  
     * @example
     * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
     */
    async getOn() {
        return this.switchStates.On;
    }
}
exports.GenericAccessory = GenericAccessory;
//# sourceMappingURL=GenericAccessory.js.map