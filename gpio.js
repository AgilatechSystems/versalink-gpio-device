
const VersalinkDevice = require('@agilatech/versalink-device');
const device = require('@agilatech/gpio');

module.exports = class Gpio extends VersalinkDevice {
    
    constructor(options) {

        if ((options['gpio'] == null) || (options['gpio'] === 'undefined')) {
            throw 'Gpio exception: gpio pin not defined';
        }

        const hardware = new device(options['gpio'], options['direction'], options['edge'], options['debounce']);

        super(hardware, options);

        this.hardware.watch((this._inputEvent).bind(this));   
    }

    addDeviceFunctionsToStates(config, onAllow, offAllow) {
        
        if (this.hardware.direction == 'out') {
            onAllow.push('change-output', 'toggle-output');
            config.map('change-output', this.changeOutput, [{name:'level'}]);
            config.map('toggle-output', this.toggleOutput);
        }
        else if (this.hardware.direction == 'in') {
            onAllow.push('trigger-input');
            config.map('trigger-input', this.triggerInput);
        }
    }

    changeOutput(level, callback) {
        const status = this.hardware.sendCommandSync(level);

        if (status > 0) {
            this.syncLevel();
        }

        callback();
    }

    toggleOutput(callback) {
        const status = this.hardware.sendCommandSync('toggle');

        if (status > 0) {
            this.syncLevel();
        }

        callback();
    }

    triggerInput(callback) {
        const status = this.hardware.sendCommandSync('trigger');

        callback();
    }

    syncLevel() {
        this.deviceProperties['level'].cur = this.hardware.valueAtIndexSync(0);

        this.level = this.deviceProperties['level'].cur;
        this.info(`${this.name} level changed to ${this.deviceProperties['level'].cur}`);
    }

    _inputEvent(err, val) {
        if (err) {
            this.error("GPIO Input error: " + err, {"error":err});
        }
        else {
            const propertyName = this.hardware.nameAtIndex(0);
            this[propertyName] = val;
            this.deviceProperties[propertyName].cur = val;
        }
    }
    
}



