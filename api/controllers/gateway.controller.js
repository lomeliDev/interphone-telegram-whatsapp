'use strict'

const fetch = require('node-fetch');

class GatewayController {

    constructor({ config }) {
        this._config = config;
    }

    offLight() {
        fetch('http://127.0.0.1:' + this._config.PORT_API + '/api/http/light/status/no')
            .then(res => res.json())
            .then(json => { });
    }

    onLight() {
        fetch('http://127.0.0.1:' + this._config.PORT_API + '/api/http/light/status/yes')
            .then(res => res.json())
            .then(json => { });
    }

    offAlarm() {
        fetch('http://127.0.0.1:' + this._config.PORT_API + '/api/http/alarm/status/no')
            .then(res => res.json())
            .then(json => { });
    }

    onAlarm() {
        fetch('http://127.0.0.1:' + this._config.PORT_API + '/api/http/alarm/status/yes')
            .then(res => res.json())
            .then(json => { });
    }

}

module.exports = GatewayController;