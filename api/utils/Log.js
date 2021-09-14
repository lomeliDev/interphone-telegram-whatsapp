'use strict'

class Log {

    constructor({ config }) {
        this._config = config;
    }

    log(text) {
        if (this._config.DEBUG) {
            console.log(text);
        }
    }

    error(text) {
        if (this._config.DEBUG) {
            console.error(text);
        }
    }

}

module.exports = Log;