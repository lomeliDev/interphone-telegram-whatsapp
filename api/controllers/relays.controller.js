'use strict'

//https://github.com/tomatpasser/gpio-buttons

const Gpio = require('onoff').Gpio;

class RelaysController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
        this.lastDoor = 0;
        this.lastGarage = 0;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {

            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

    openDoor() {
        if (Date.now() > this.lastDoor || this.lastDoor == 0) {
            this.lastDoor = Date.now() + (1000 * 5);
            const relay = new Gpio(20, 'high');
            relay.write(0);
            setTimeout(() => { this._log.log("open relay door"); relay.write(1); }, 200);
            setTimeout(() => { this._log.log("close relay door"); relay.unexport(); }, 500);
        }
    }

    openGarage() {
        if (Date.now() > this.lastGarage || this.lastGarage == 0) {
            this.lastGarage = Date.now() + (1000 * 5);
            const relay = new Gpio(16, 'high');
            relay.write(0);
            setTimeout(() => { this._log.log("open relay garage"); relay.write(1); }, 200);
            setTimeout(() => { this._log.log("close relay garage"); relay.unexport(); }, 500);
        }
    }

}

module.exports = RelaysController;