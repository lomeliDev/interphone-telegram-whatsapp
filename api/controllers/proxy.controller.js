'use strict'

const cors_proxy = require('cors-anywhere');

class ProxyController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this._log.log("Proxy service started");
                const _this = this;
                cors_proxy.createServer({
                    originWhitelist: [],
                    requireHeader: [],
                    removeHeaders: ['cookie', 'cookie2']
                }).listen(this._config.PORT_PROXY, "0.0.0.0", function () {
                    _this._log.log('Running CORS Anywhere');
                    resolve();
                });
            } catch (error) {
                this._log.error(error.message);
                resolve();
            }
        });
    }

    Redirect(req, res) {
        //http://192.168.0.10:5001/api/http/redirect
        let urlRedirect = `${this._config.URL_HOST}:${this._config.PORT_PROXY}/`;
        try {
            if (this._config.CAMERA === "ESP32") {
                urlRedirect = `${this._config.URL_HOST}:${this._config.PORT_PROXY}/http://${this._config.HOST_CAMERA}/mjpeg/1`;
            } else if (this._config.CAMERA === "NATIVE") {
                urlRedirect = `${this._config.URL_HOST}:${this._config.PORT_PROXY}/http://127.0.0.1:${this._config.PORT_API}/stream/stream.mjpg`;
            }
            res.redirect(urlRedirect);
        } catch (error) {
            res.redirect(urlRedirect);
        }
    }

}

module.exports = ProxyController;