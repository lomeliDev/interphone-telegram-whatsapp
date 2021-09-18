'use strict'

class Log {

    constructor({ config }) {
        this._config = config;
    }

    log(text) {
        if (this._config.DEBUG === 1 || this._config.DEBUG === '1') {
            console.log(text);
        }
    }

    error(text) {
        if (this._config.DEBUG === 1 || this._config.DEBUG === '1') {
            console.error(text);
        }
    }

}

module.exports = Log;