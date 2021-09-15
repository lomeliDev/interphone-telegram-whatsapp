'use strict'

var Gpio = require('onoff').Gpio;

class ButtonsController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
        this.call = null;
        console.log("ButtonsController");
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.call = new Gpio(17, 'in', 'rising', { debounceTimeout: 10 });
            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

}

module.exports = ButtonsController;